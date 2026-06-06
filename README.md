# ANTA Signal — Lead Intelligence System

Internal operational tool for ANTA to manage lead discovery and outreach workflows.

## Architecture

```
anta-signal/
├── backend/          FastAPI + PostgreSQL + SQLAlchemy
├── frontend/         React + Vite + TailwindCSS + shadcn/ui
└── docker-compose.yml
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, TanStack Table, React Query, Zustand |
| Backend | FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Scraping | Apify (Google Maps actor by default) |
| Container | Docker + docker-compose |

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.12+
- Node 20+
- PostgreSQL running locally (or use Docker)
- Apify account + API token

### 1. Clone & configure

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set APIFY_TOKEN

# Frontend
cp frontend/.env.example frontend/.env
```

### 2. Start backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create database (if not using Docker)
createdb anta_leads

# Run migrations (or let the app auto-create tables on first start)
alembic upgrade head

# Start API server
uvicorn main:app --reload --port 8000
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

API docs available at: `http://localhost:8000/docs`

---

## Docker (Production-like)

```bash
# Copy and fill in your tokens
cp backend/.env.example .env
# Set APIFY_TOKEN in .env

docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL URL | `postgresql+asyncpg://anta:anta@localhost:5432/anta_leads` |
| `APIFY_TOKEN` | Your Apify API token | **Required** |
| `APIFY_ACTOR_ID` | Apify actor to run | `compass~crawler-google-places` (Google Maps) |
| `APP_ENV` | `development` or `production` | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

---

## Apify Setup

1. Sign up at [apify.com](https://apify.com)
2. Copy your API token from **Settings → Integrations**
3. Paste it in `APIFY_TOKEN`

Default actor: **Google Maps Scraper** (`compass~crawler-google-places`)  
To use a different actor, update `APIFY_ACTOR_ID` and update `_build_google_maps_input` in `backend/app/integrations/apify/service.py`.

---

## Features

### Dashboard
- Live stats: total leads, companies, active jobs, completed jobs
- Recent leads and jobs panels
- Auto-refreshes every 30 seconds

### Lead Search
- Enter keywords, industry, location, company size, source
- Quick-fill example searches
- Launches Apify job in background — UI stays responsive
- Job status polling (auto-refreshes every 5s while active)

### Leads Table
- Pagination, sorting, multi-column filtering
- Row selection with checkboxes
- Click any row to open detail drawer
- Export selected (or all) leads as CSV or JSON

### Lead Drawer
- Full lead details: company, contact, links, location, source
- Editable notes with save
- Direct mailto/tel links

### Jobs Dashboard
- Full job history with status badges
- Filter by status
- Auto-refreshes while jobs are pending/running
- Click lead count to jump to that job's leads

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Dashboard stats |
| `GET` | `/api/leads` | List leads (paginated, filterable) |
| `GET` | `/api/leads/{id}` | Get lead by ID |
| `POST` | `/api/leads` | Create lead |
| `PATCH` | `/api/leads/{id}` | Update lead |
| `DELETE` | `/api/leads/{id}` | Delete lead |
| `GET` | `/api/jobs` | List jobs |
| `GET` | `/api/jobs/{id}` | Get job by ID |
| `POST` | `/api/searches` | Start new search (triggers Apify) |
| `POST` | `/api/exports` | Export leads as CSV or JSON |
| `GET` | `/health` | Health check |

Full interactive docs: `http://localhost:8000/docs`

---

## Database Schema

### leads
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| company_name | varchar(255) | indexed |
| website | varchar(500) | |
| linkedin_url | varchar(500) | |
| industry | varchar(255) | indexed |
| employee_count | varchar(100) | |
| contact_name | varchar(255) | |
| contact_title | varchar(255) | |
| email | varchar(255) | indexed |
| phone | varchar(50) | |
| location | varchar(255) | indexed |
| source | varchar(100) | indexed |
| source_url | varchar(500) | |
| notes | text | |
| job_id | UUID FK → scraping_jobs | |
| created_at | timestamptz | indexed |
| updated_at | timestamptz | |

### scraping_jobs
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| keyword | varchar(500) | |
| industry | varchar(255) | |
| location | varchar(255) | |
| company_size | varchar(100) | |
| source | varchar(100) | |
| status | varchar(50) | pending/running/completed/failed |
| apify_run_id | varchar(255) | |
| total_results | integer | |
| error_message | text | |
| created_at | timestamptz | indexed |
| completed_at | timestamptz | |

---

## Project Structure

```
backend/
  main.py                    FastAPI app entry point
  app/
    core/config.py            Settings (pydantic-settings)
    database/
      base.py                 SQLAlchemy declarative base
      session.py              Async engine + session factory
    models/
      lead.py                 Lead ORM model
      job.py                  ScrapingJob ORM model
    schemas/
      lead.py                 Lead Pydantic schemas
      job.py                  Job + search + dashboard schemas
    services/
      lead_service.py         Lead CRUD + filtering
      job_service.py          Job CRUD + stats
    integrations/apify/
      client.py               Raw HTTP client (run actor, poll, fetch dataset)
      service.py              Business logic (build input, parse output, status map)
    workers/
      scraper.py              Background task: trigger → poll → ingest
    api/routes/
      leads.py                /api/leads
      jobs.py                 /api/jobs
      searches.py             /api/searches
      exports.py              /api/exports
      dashboard.py            /api/dashboard
    utils/export.py           CSV + JSON serialization

frontend/src/
  types/index.ts              Shared TypeScript types
  services/api.ts             Axios API client
  store/index.ts              Zustand state (selection, drawer, filters)
  lib/utils.ts                cn(), formatDate(), truncate()
  hooks/
    useDashboard.ts
    useLeads.ts
    useJobs.ts
  layouts/MainLayout.tsx      Sidebar + outlet
  components/
    ui/                       button, card, badge, input, label, select, sheet, skeleton, separator
    leads/
      LeadTable.tsx           TanStack Table with selection + sorting
      LeadFilters.tsx         Search + filter bar
      LeadDrawer.tsx          Side drawer with full lead detail
      StatusBadge.tsx         Job status badge variants
    search/
      SearchForm.tsx          New search form
  pages/
    Dashboard.tsx             Stats + recent panels
    Leads.tsx                 Full lead management page
    Search.tsx                Search trigger page
    Jobs.tsx                  Job history page
  App.tsx                     Router + QueryClient
  main.tsx                    Entry point
```

---

## Future Extensions

The codebase is structured to make these additions straightforward:

- **AI enrichment** — add `enrichment_service.py` + Claude/OpenAI calls per lead
- **Outreach automation** — add `outreach/` module, email sequences per lead
- **CRM integration** — add HubSpot/Salesforce service under `integrations/`
- **Reply classification** — webhook endpoint + classifier model
- **Celery + Redis** — replace `BackgroundTasks` in `searches.py` with Celery tasks; worker code in `scraper.py` requires no changes

---

## Development Notes

- Tables are auto-created on startup in development. Use Alembic for production migrations.
- The jobs page auto-polls every 5s while any job is `pending` or `running`.
- Export downloads trigger directly in the browser via blob URL.
- The Vite dev server proxies `/api/*` to `localhost:8000` — no CORS issues in dev.
