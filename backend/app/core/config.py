from pydantic_settings import BaseSettings, SettingsConfigDict


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
    # In production set as JSON array: CORS_ORIGINS='["https://your-domain.com"]'
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
