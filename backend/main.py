from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.database.session import engine
from app.api.routes import leads, jobs, searches, exports, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
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
