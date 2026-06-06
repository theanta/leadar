import httpx
from typing import Any

from app.core.config import settings

APIFY_BASE_URL = "https://api.apify.com/v2"


class ApifyClient:
    def __init__(self):
        self.token = settings.apify_token
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.timeout = httpx.Timeout(30.0, connect=10.0)

    async def run_actor(self, actor_id: str, input_data: dict[str, Any]) -> dict[str, Any]:
        url = f"{APIFY_BASE_URL}/acts/{actor_id}/runs"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=input_data, headers=self.headers)
            response.raise_for_status()
            return response.json()["data"]

    async def get_run(self, run_id: str) -> dict[str, Any]:
        url = f"{APIFY_BASE_URL}/actor-runs/{run_id}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()["data"]

    async def get_dataset_items(self, dataset_id: str, limit: int = 1000) -> list[dict[str, Any]]:
        url = f"{APIFY_BASE_URL}/datasets/{dataset_id}/items"
        params = {"limit": limit, "clean": "true"}
        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
            response = await client.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            return response.json()


apify_client = ApifyClient()
