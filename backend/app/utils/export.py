import csv
import json
import io
from typing import Any


def leads_to_csv(leads: list[dict[str, Any]]) -> str:
    if not leads:
        return ""
    fields = [
        "id", "company_name", "website", "linkedin_url", "industry",
        "employee_count", "contact_name", "contact_title", "email",
        "phone", "location", "source", "source_url", "notes", "created_at",
    ]
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    for lead in leads:
        writer.writerow({k: lead.get(k, "") for k in fields})
    return output.getvalue()


def leads_to_json(leads: list[dict[str, Any]]) -> str:
    return json.dumps(leads, indent=2, default=str)
