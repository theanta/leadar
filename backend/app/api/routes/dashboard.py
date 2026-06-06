from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.job import DashboardStats
from app.services.lead_service import get_lead_stats
from app.services.job_service import get_job_stats

router = APIRouter()


@router.get("", response_model=DashboardStats)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    lead_stats = await get_lead_stats(db)
    job_stats = await get_job_stats(db)

    return DashboardStats(
        total_leads=lead_stats["total_leads"],
        total_companies=lead_stats["total_companies"],
        active_jobs=job_stats["active_jobs"],
        completed_jobs=job_stats["completed_jobs"],
        recent_leads=lead_stats["recent_leads"],
        recent_jobs=job_stats["recent_jobs"],
    )
