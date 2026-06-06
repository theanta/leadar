import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse
from app.services import lead_service

router = APIRouter()


@router.get("", response_model=LeadListResponse)
async def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str | None = Query(None),
    industry: str | None = Query(None),
    location: str | None = Query(None),
    source: str | None = Query(None),
    job_id: uuid.UUID | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    return await lead_service.get_leads(
        db,
        page=page,
        page_size=page_size,
        search=search,
        industry=industry,
        location=location,
        source=source,
        job_id=job_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    lead = await lead_service.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(data: LeadCreate, db: AsyncSession = Depends(get_db)):
    return await lead_service.create_lead(db, data)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: uuid.UUID, data: LeadUpdate, db: AsyncSession = Depends(get_db)
):
    lead = await lead_service.update_lead(db, lead_id, data)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/{lead_id}", status_code=204)
async def delete_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    deleted = await lead_service.delete_lead(db, lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
