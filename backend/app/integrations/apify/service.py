import re
from typing import Any

from app.integrations.apify.client import apify_client
from app.core.config import settings

_LINKEDIN_CITY_LOCATIONS = {
    "chicago": "Chicago, Illinois, United States",
    "detroit": "Detroit, Michigan, United States",
    "san francisco": "San Francisco, California, United States",
    "new york": "New York, New York, United States",
    "los angeles": "Los Angeles, California, United States",
}


def _build_google_maps_input(keyword: str, location: str | None, max_results: int = 100) -> dict:
    search_query = keyword
    if location:
        search_query = f"{keyword} {location}"
    return {
        "searchStringsArray": [search_query],
        "maxCrawledPlacesPerSearch": max_results,
        "language": "en",
        "exportPlaceUrls": False,
        "includeHistogram": False,
        "includeOpeningHours": False,
        "includePeopleAlsoSearchFor": False,
    }


def _map_linkedin_company_size(company_size: str | None) -> list[str] | None:
    if not company_size:
        return None
    mapping = {
        "1-10": ["1-10"],
        "11-50": ["11-50"],
        "51-200": ["51-200"],
        "201-1000": ["201-500", "501-1000"],
        "1000+": ["1001-5000", "5001-10000", "10001+"],
    }
    return mapping.get(company_size)


def _normalize_linkedin_location(location: str) -> str:
    normalized = location.strip()
    normalized = re.sub(r",\s*USA\s*$", ", United States", normalized, flags=re.IGNORECASE)
    normalized = re.sub(r"\bUSA\b", "United States", normalized, flags=re.IGNORECASE)

    city_key = normalized.lower()
    if city_key in _LINKEDIN_CITY_LOCATIONS:
        return _LINKEDIN_CITY_LOCATIONS[city_key]

    return normalized


def _extract_location_from_keyword(keyword: str) -> tuple[str, str | None]:
    search_query = keyword.strip()
    extracted_location = None

    in_match = re.search(r"\bin\s+(.+)$", search_query, re.IGNORECASE)
    if in_match:
        search_query = search_query[: in_match.start()].strip()
        extracted_location = in_match.group(1).strip()

    usa_match = re.search(r"\bUSA\s*$", search_query, re.IGNORECASE)
    if usa_match:
        search_query = search_query[: usa_match.start()].strip()
        extracted_location = extracted_location or "United States"

    return search_query, extracted_location


def _simplify_linkedin_search_query(search_query: str, has_location: bool) -> str:
    if not has_location:
        return search_query

    simplified = re.sub(
        r"\b(companies|company|firms|businesses)\b",
        "",
        search_query,
        flags=re.IGNORECASE,
    )
    simplified = re.sub(r"\s+", " ", simplified).strip()

    if re.search(r"\btech\s+startups?\b", simplified, re.IGNORECASE):
        return "startups"

    return simplified or search_query


def _build_linkedin_input(
    keyword: str,
    location: str | None = None,
    industry: str | None = None,
    company_size: str | None = None,
    max_results: int = 100,
) -> dict:
    search_query, extracted_location = _extract_location_from_keyword(keyword)
    if industry:
        search_query = f"{search_query} {industry}".strip()

    final_location = location or extracted_location
    if final_location:
        final_location = _normalize_linkedin_location(final_location)

    search_query = _simplify_linkedin_search_query(search_query, bool(final_location))

    input_data: dict[str, Any] = {
        "scraperMode": "full",
        "maxItems": min(max_results, 1000),
        "searchQuery": search_query,
    }
    if final_location:
        input_data["locations"] = [final_location]

    linkedin_sizes = _map_linkedin_company_size(company_size)
    if linkedin_sizes:
        input_data["companySize"] = linkedin_sizes

    return input_data


def _parse_google_maps_item(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "company_name": item.get("title", ""),
        "website": item.get("website"),
        "phone": item.get("phone"),
        "location": item.get("address") or item.get("city"),
        "industry": item.get("categoryName"),
        "source": "google_maps",
        "source_url": item.get("url"),
        "linkedin_url": None,
        "contact_name": None,
        "contact_title": None,
        "email": None,
        "employee_count": None,
    }


def _normalize_linkedin_phone(phone: Any) -> str | None:
    if phone is None:
        return None
    if isinstance(phone, dict):
        number = phone.get("number")
        extension = phone.get("extension")
        if number and extension:
            return f"{number} ext. {extension}"
        return number or None
    return str(phone) if phone else None


def _parse_linkedin_item(item: dict[str, Any]) -> dict[str, Any] | None:
    name = item.get("name") or item.get("title")
    if not name:
        return None

    location = None
    locations = item.get("locations") or []
    hq = next((loc for loc in locations if loc.get("headquarter")), None)
    target_loc = hq or (locations[0] if locations else None)
    if target_loc and target_loc.get("parsed"):
        location = target_loc["parsed"].get("text")

    industry = None
    industries = item.get("industries") or []
    if industries:
        industry = industries[0].get("name")

    employee_count = item.get("employeeCount")
    if employee_count is None:
        count_range = item.get("employeeCountRange") or {}
        employee_count = count_range.get("start")
    if employee_count is not None:
        employee_count = str(employee_count)

    return {
        "company_name": name,
        "website": item.get("website"),
        "phone": _normalize_linkedin_phone(item.get("phone")),
        "location": location,
        "industry": industry,
        "source": "linkedin",
        "source_url": item.get("linkedinUrl"),
        "linkedin_url": item.get("linkedinUrl"),
        "contact_name": None,
        "contact_title": None,
        "email": None,
        "employee_count": employee_count,
    }


async def trigger_search(
    keyword: str,
    location: str | None = None,
    source: str = "google_maps",
    industry: str | None = None,
    company_size: str | None = None,
    max_results: int = 100,
) -> str:
    if source == "linkedin":
        actor_id = settings.apify_linkedin_actor_id
        input_data = _build_linkedin_input(
            keyword, location, industry, company_size, max_results
        )
    else:
        actor_id = settings.apify_actor_id
        input_data = _build_google_maps_input(keyword, location, max_results)

    run = await apify_client.run_actor(actor_id, input_data)
    return run["id"]


async def get_run_status(run_id: str) -> tuple[str, str | None]:
    run = await apify_client.get_run(run_id)
    status = run.get("status", "UNKNOWN")
    dataset_id = run.get("defaultDatasetId")
    return status, dataset_id


async def fetch_leads(dataset_id: str, source: str = "google_maps") -> list[dict[str, Any]]:
    items = await apify_client.get_dataset_items(dataset_id)
    if source == "linkedin":
        leads = [lead for item in items if (lead := _parse_linkedin_item(item))]
    else:
        leads = [_parse_google_maps_item(item) for item in items if item.get("title")]

    return leads


APIFY_STATUS_MAP = {
    "READY": "running",
    "RUNNING": "running",
    "SUCCEEDED": "completed",
    "FAILED": "failed",
    "ABORTING": "failed",
    "ABORTED": "failed",
    "TIMING-OUT": "failed",
    "TIMED-OUT": "failed",
}
