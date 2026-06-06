import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LeadBase(BaseModel):
    company_name: str
    website: str | None = None
    linkedin_url: str | None = None
    industry: str | None = None
    employee_count: str | None = None
    contact_name: str | None = None
    contact_title: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    source: str | None = None
    source_url: str | None = None
    notes: str | None = None


class LeadCreate(LeadBase):
    job_id: uuid.UUID | None = None


class LeadUpdate(BaseModel):
    company_name: str | None = None
    website: str | None = None
    linkedin_url: str | None = None
    industry: str | None = None
    employee_count: str | None = None
    contact_name: str | None = None
    contact_title: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    source: str | None = None
    source_url: str | None = None
    notes: str | None = None


class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
