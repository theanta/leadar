---
name: project-anta-signal
description: ANTA Lead Intelligence System — internal tool for lead discovery, scraping jobs, and outreach prep. Full-stack FastAPI + React.
metadata:
  type: project
---

ANTA Signal is a complete internal lead generation dashboard built at `/Users/anadithakur/Documents/Claude/Projects/anta-signal/`.

**Why:** ANTA needs an internal tool to discover, manage, and prepare leads for outreach with minimal manual work. Not a SaaS product.

**Stack:** FastAPI (async) + PostgreSQL + SQLAlchemy 2.0 + React 18 + Vite + TailwindCSS + shadcn/ui components (written manually) + TanStack Table + React Query + Zustand.

**Key architectural decisions:**
- Background scraping via FastAPI BackgroundTasks (not Celery — intentionally simple, ready to swap)
- Apify integration in `backend/app/integrations/apify/` — client.py (raw HTTP) + service.py (business logic, parse Google Maps output)
- Default Apify actor: `nwua9Gu5YkAT4syef` (Google Maps scraper)
- Tables auto-created on startup in dev; Alembic for prod migrations
- Vite proxy `/api → localhost:8000` to avoid CORS in dev

**Future extension hooks:** AI enrichment, outreach automation, Celery upgrade, CRM integrations — all structurally prepared but not implemented.

**How to apply:** When adding features, follow the existing module boundaries (services, integrations, workers). Don't add auth/billing — not planned.
