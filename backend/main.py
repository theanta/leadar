from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import engine
from app.database.base import Base
from app.api.routes import leads, jobs, searches, exports, dashboard

import app.models  # noqa: F401 — ensure models are registered before create_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="ANTA Lead Intelligence System",
    version="1.0.0",
    description="Internal lead generation and management platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(searches.router, prefix="/api/searches", tags=["searches"])
app.include_router(exports.router, prefix="/api/exports", tags=["exports"])


@app.get("/health")
async def health():
    return {"status": "healthy"}
