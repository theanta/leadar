import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.lead import Lead
from app.utils.export import leads_to_csv, leads_to_json

router = APIRouter()


class ExportRequest(BaseModel):
    lead_ids: list[uuid.UUID]
    format: str = "csv"


@router.post("")
async def export_leads(data: ExportRequest, db: AsyncSession = Depends(get_db)):
    if data.format not in ("csv", "json"):
        raise HTTPException(status_code=400, detail="Format must be 'csv' or 'json'")

    result = await db.execute(select(Lead).where(Lead.id.in_(data.lead_ids)))
    leads = result.scalars().all()

    leads_dicts = [
        {
            "id": str(lead.id),
            "company_name": lead.company_name,
            "website": lead.website,
            "linkedin_url": lead.linkedin_url,
            "industry": lead.industry,
            "employee_count": lead.employee_count,
            "contact_name": lead.contact_name,
            "contact_title": lead.contact_title,
            "email": lead.email,
            "phone": lead.phone,
            "location": lead.location,
            "source": lead.source,
            "source_url": lead.source_url,
            "notes": lead.notes,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
        }
        for lead in leads
    ]

    if data.format == "csv":
        content = leads_to_csv(leads_dicts)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=leads.csv"},
        )

    content = leads_to_json(leads_dicts)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=leads.json"},
    )
