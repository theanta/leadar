from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.job import SearchRequest, JobResponse
from app.services import job_service
from app.workers.scraper import run_scraping_job

router = APIRouter()


@router.post("", response_model=JobResponse, status_code=202)
async def start_search(
    data: SearchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    job = await job_service.create_job(
        db,
        keyword=data.keyword,
        source=data.source,
        industry=data.industry,
        location=data.location,
        company_size=data.company_size,
    )

    background_tasks.add_task(
        run_scraping_job,
        job_id=job.id,
        keyword=data.keyword,
        location=data.location,
        source=data.source,
        industry=data.industry,
        company_size=data.company_size,
    )

    return job
