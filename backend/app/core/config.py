import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_CORS = ["http://localhost:5173", "http://localhost:3000"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://anta:anta@localhost:5432/anta_leads"

    # Apify
    apify_token: str = ""
    apify_actor_id: str = "compass~crawler-google-places"
    apify_linkedin_actor_id: str = "harvestapi~linkedin-company-search"

    # Apollo
    apollo_api_key: str = ""

    # App
    app_env: str = "development"
    # Accepts JSON array, comma-separated string, or empty (falls back to default)
    cors_origins: list[str] = _DEFAULT_CORS

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if not isinstance(v, str):
            return v  # type: ignore[return-value]
        v = v.strip()
        if not v:
            return _DEFAULT_CORS
        try:
            return json.loads(v)
        except json.JSONDecodeError:
            return [origin.strip() for origin in v.split(",") if origin.strip()]


settings = Settings()
