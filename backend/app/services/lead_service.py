import uuid
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadListResponse, LeadResponse


async def get_leads(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 25,
    search: str | None = None,
    industry: str | None = None,
    location: str | None = None,
    source: str | None = None,
    job_id: uuid.UUID | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> LeadListResponse:
    query = select(Lead)
    count_query = select(func.count()).select_from(Lead)

    filters = []
    if search:
        term = f"%{search}%"
        filters.append(
            or_(
                Lead.company_name.ilike(term),
                Lead.contact_name.ilike(term),
                Lead.email.ilike(term),
                Lead.location.ilike(term),
            )
        )
    if industry:
        filters.append(Lead.industry.ilike(f"%{industry}%"))
    if location:
        filters.append(Lead.location.ilike(f"%{location}%"))
    if source:
        filters.append(Lead.source == source)
    if job_id:
        filters.append(Lead.job_id == job_id)

    if filters:
        from sqlalchemy import and_
        query = query.where(and_(*filters))
        count_query = count_query.where(and_(*filters))

    sort_column = getattr(Lead, sort_by, Lead.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    result = await db.execute(query)
    leads = result.scalars().all()

    return LeadListResponse(
        items=[LeadResponse.model_validate(lead) for lead in leads],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 0,
    )


async def get_lead(db: AsyncSession, lead_id: uuid.UUID) -> Lead | None:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    return result.scalar_one_or_none()


async def create_lead(db: AsyncSession, data: LeadCreate) -> Lead:
    lead = Lead(**data.model_dump())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


async def bulk_create_leads(db: AsyncSession, leads_data: list[dict], job_id: uuid.UUID) -> int:
    leads = [Lead(**{**data, "job_id": job_id}) for data in leads_data]
    db.add_all(leads)
    await db.commit()
    return len(leads)


async def update_lead(db: AsyncSession, lead_id: uuid.UUID, data: LeadUpdate) -> Lead | None:
    lead = await get_lead(db, lead_id)
    if not lead:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    await db.commit()
    await db.refresh(lead)
    return lead


async def delete_lead(db: AsyncSession, lead_id: uuid.UUID) -> bool:
    lead = await get_lead(db, lead_id)
    if not lead:
        return False
    await db.delete(lead)
    await db.commit()
    return True


async def get_lead_stats(db: AsyncSession) -> dict:
    total_leads = await db.execute(select(func.count()).select_from(Lead))
    total_companies = await db.execute(select(func.count(func.distinct(Lead.company_name))).select_from(Lead))

    recent = await db.execute(
        select(Lead).order_by(Lead.created_at.desc()).limit(5)
    )

    return {
        "total_leads": total_leads.scalar_one(),
        "total_companies": total_companies.scalar_one(),
        "recent_leads": [
            {
                "id": str(lead.id),
                "company_name": lead.company_name,
                "contact_name": lead.contact_name,
                "location": lead.location,
                "created_at": lead.created_at.isoformat(),
            }
            for lead in recent.scalars().all()
        ],
    }
