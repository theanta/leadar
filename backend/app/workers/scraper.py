import asyncio
import uuid
import logging

from app.database.session import AsyncSessionLocal
from app.services.job_service import update_job_status
from app.services.lead_service import bulk_create_leads
from app.integrations.apify.service import trigger_search, get_run_status, fetch_leads, APIFY_STATUS_MAP

logger = logging.getLogger(__name__)

POLL_INTERVAL = 10  # seconds
MAX_POLL_ATTEMPTS = 60  # 10 minutes max


async def run_scraping_job(
    job_id: uuid.UUID,
    keyword: str,
    location: str | None,
    source: str,
    industry: str | None = None,
    company_size: str | None = None,
) -> None:
    async with AsyncSessionLocal() as db:
        try:
            run_id = await trigger_search(
                keyword=keyword,
                location=location,
                source=source,
                industry=industry,
                company_size=company_size,
            )
            await update_job_status(db, job_id, status="running", apify_run_id=run_id)
            logger.info(f"Job {job_id}: Apify run {run_id} started")

            dataset_id = await _poll_until_complete(db, job_id, run_id)
            if not dataset_id:
                return

            leads_data = await fetch_leads(dataset_id, source=source)
            count = await bulk_create_leads(db, leads_data, job_id)

            await update_job_status(db, job_id, status="completed", total_results=count)
            logger.info(f"Job {job_id}: Completed with {count} leads")

        except Exception as exc:
            logger.error(f"Job {job_id} failed: {exc}", exc_info=True)
            await db.rollback()
            await update_job_status(db, job_id, status="failed", error_message=str(exc))


async def _poll_until_complete(
    db, job_id: uuid.UUID, run_id: str
) -> str | None:
    for attempt in range(MAX_POLL_ATTEMPTS):
        await asyncio.sleep(POLL_INTERVAL)
        try:
            apify_status, dataset_id = await get_run_status(run_id)
            mapped = APIFY_STATUS_MAP.get(apify_status, "running")

            if apify_status == "SUCCEEDED":
                return dataset_id

            if mapped == "failed":
                await update_job_status(
                    db, job_id, status="failed", error_message=f"Apify run {apify_status}"
                )
                return None

            logger.debug(f"Job {job_id}: poll {attempt + 1}, status={apify_status}")

        except Exception as exc:
            logger.warning(f"Job {job_id}: poll error: {exc}")

    await update_job_status(db, job_id, status="failed", error_message="Polling timed out")
    return None
