import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SearchRequest(BaseModel):
    keyword: str
    industry: str | None = None
    location: str | None = None
    company_size: str | None = None
    source: str = "google_maps"


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    keyword: str
    industry: str | None = None
    location: str | None = None
    company_size: str | None = None
    source: str
    status: str
    apify_run_id: str | None = None
    total_results: int
    error_message: str | None = None
    created_at: datetime
    completed_at: datetime | None = None


class JobListResponse(BaseModel):
    items: list[JobResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DashboardStats(BaseModel):
    total_leads: int
    total_companies: int
    active_jobs: int
    completed_jobs: int
    recent_leads: list[dict]
    recent_jobs: list[dict]
