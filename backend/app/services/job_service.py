import uuid
import math
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.job import ScrapingJob
from app.schemas.job import JobResponse, JobListResponse


async def create_job(
    db: AsyncSession,
    keyword: str,
    source: str,
    industry: str | None = None,
    location: str | None = None,
    company_size: str | None = None,
) -> ScrapingJob:
    job = ScrapingJob(
        keyword=keyword,
        source=source,
        industry=industry,
        location=location,
        company_size=company_size,
        status="pending",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def get_job(db: AsyncSession, job_id: uuid.UUID) -> ScrapingJob | None:
    result = await db.execute(select(ScrapingJob).where(ScrapingJob.id == job_id))
    return result.scalar_one_or_none()


async def get_jobs(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 25,
    status: str | None = None,
) -> JobListResponse:
    query = select(ScrapingJob)
    count_query = select(func.count()).select_from(ScrapingJob)

    if status:
        query = query.where(ScrapingJob.status == status)
        count_query = count_query.where(ScrapingJob.status == status)

    query = query.order_by(ScrapingJob.created_at.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(query)
    jobs = result.scalars().all()

    return JobListResponse(
        items=[JobResponse.model_validate(job) for job in jobs],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


async def update_job_status(
    db: AsyncSession,
    job_id: uuid.UUID,
    status: str,
    apify_run_id: str | None = None,
    total_results: int | None = None,
    error_message: str | None = None,
) -> ScrapingJob | None:
    job = await get_job(db, job_id)
    if not job:
        return None

    job.status = status
    if apify_run_id is not None:
        job.apify_run_id = apify_run_id
    if total_results is not None:
        job.total_results = total_results
    if error_message is not None:
        job.error_message = error_message
    if status in ("completed", "failed"):
        job.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(job)
    return job


async def get_job_stats(db: AsyncSession) -> dict:
    active_result = await db.execute(
        select(func.count()).select_from(ScrapingJob).where(
            ScrapingJob.status.in_(["pending", "running"])
        )
    )
    completed_result = await db.execute(
        select(func.count()).select_from(ScrapingJob).where(ScrapingJob.status == "completed")
    )
    recent_result = await db.execute(
        select(ScrapingJob).order_by(ScrapingJob.created_at.desc()).limit(5)
    )

    return {
        "active_jobs": active_result.scalar_one(),
        "completed_jobs": completed_result.scalar_one(),
        "recent_jobs": [
            {
                "id": str(job.id),
                "keyword": job.keyword,
                "status": job.status,
                "total_results": job.total_results,
                "created_at": job.created_at.isoformat(),
            }
            for job in recent_result.scalars().all()
        ],
    }
