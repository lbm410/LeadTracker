# LeadTracker Pro

A polished, single-user **personal CRM** for sales prospecting: a visual pipeline,
full interaction history per lead, and an integrated calendar — all running locally
with **one command** via Docker.

> Built for one person managing their own outreach. No multi-user accounts; the API
> is protected with a simple API key.

---

## ✨ Features

- **Dashboard** — leads by stage, interactions this week, actions due today, cold leads, conversion rate.
- **Pipeline (Kanban)** — drag leads between stages to change their status; priority & source badges.
- **Contacts** — searchable, filterable, sortable table of every lead.
- **Contact detail** — all data, a chronological interaction timeline, upcoming & past events, and quick buttons to *log an interaction* or *schedule an event* without leaving the page.
- **Calendar** — month / week / day views; click a day to create an event, click an event to edit. Color-coded by type. A contact's `next_action_date` shows up as an implicit reminder.
- **Today / Agenda** — today's meetings, follow-ups due (today + overdue), and cold leads to recover.

### Business rules wired in
- Logging an **interaction** automatically updates the contact's `last_contacted_at` (used to detect cold leads).
- Scheduling a **meeting/call** linked to a contact can optionally move that contact to *“Meeting scheduled”* (offered via a checkbox, never forced).
- A contact's **next action date** is surfaced both on the agenda and as an implicit calendar reminder.
- A contact's page shows **both** its past interactions **and** its upcoming events.

---

## 🧱 Tech stack

| Layer       | Stack |
|-------------|-------|
| Backend     | Python · FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 |
| Database    | PostgreSQL 16 (persistent volume) |
| Frontend    | React 18 · Vite · TypeScript · Tailwind CSS · TanStack Query · FullCalendar · dnd-kit · lucide-react |
| Orchestration | Docker Compose (`db`, `api` with hot-reload, `web`) |

---

## 🚀 Quick start

**Requirements:** Docker + Docker Compose (Docker Desktop on Mac/Windows works out of the box).

```bash
# 1. From the project root, create your env file (defaults work as-is)
cp .env.example .env

# 2. Build and start everything
docker compose up --build
```

That's it. The `api` container automatically:
1. waits for Postgres to be ready,
2. runs the Alembic migrations (`alembic upgrade head`),
3. seeds sample data **only if the database is empty**,
4. starts Uvicorn with hot-reload.

### URLs

| What | URL |
|------|-----|
| Web app | http://localhost:5173 |
| API (Swagger docs) | http://localhost:8000/docs |
| API health check | http://localhost:8000/health |

> First boot takes a minute or two while images build and `npm install` runs.

To stop: `Ctrl+C`, then `docker compose down`. Your data persists in the `pgdata`
volume. To wipe everything (including data): `docker compose down -v`.

---

## 🔑 API key

Every API endpoint (except `/`, `/health` and `/docs`) requires the header:

```
X-API-Key: dev-local-key-change-me
```

The web app sends it automatically (kept in sync via `.env`). Change `API_KEY`
in `.env` to your own secret — the frontend's `VITE_API_KEY` is derived from the
same value in `docker-compose.yml`, so they always match.

---

## 🗂️ Project structure

```
LeadTracker/
├── docker-compose.yml          # db + api + web
├── .env.example                # all configurable variables
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── start.sh                # wait-for-db → migrate → seed → uvicorn
│   ├── alembic.ini
│   ├── alembic/                # migration environment + versions/
│   └── app/
│       ├── main.py             # FastAPI app + CORS + routers
│       ├── config.py           # settings from env
│       ├── database.py         # engine + session dependency
│       ├── dependencies.py     # API-key guard
│       ├── enums.py            # all domain enums
│       ├── seed.py             # sample data (idempotent with --if-empty)
│       ├── models/             # SQLAlchemy models (Contact, Interaction, Event)
│       ├── schemas/            # Pydantic v2 request/response models
│       ├── services/           # business logic (per entity + dashboard)
│       └── routers/            # HTTP endpoints by resource
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts / tailwind.config.js / tsconfig*.json
    └── src/
        ├── main.tsx            # providers (React Query, Router, Toaster)
        ├── App.tsx             # routes
        ├── api/                # axios client + typed React Query hooks
        ├── components/         # UI primitives, layout, forms, badges
        ├── lib/                # constants (enum labels/colors) + helpers
        ├── pages/              # Dashboard, Pipeline, Contacts, ContactDetail, Calendar, Agenda
        └── types/              # shared TypeScript types mirroring the API
```

**Layered backend:** `routers → services → models`. Routers handle HTTP and
validation, services hold the business rules, models are the persistence layer.

---

## 🧬 Data model

- **Contact** — the lead. `full_name` (required), company, role, email, phone, linkedin,
  `source`, `status`, `priority`, `tags[]`, `notes`, `next_action` + `next_action_date`,
  and `last_contacted_at` (auto-updated).
- **Interaction** — a logged touch (1-to-many with Contact, cascade delete):
  `channel`, `direction`, `interaction_type`, `content`, `outcome`, `occurred_at`.
- **Event** — a calendar entry (optional many-to-one with Contact): `title`, `description`,
  `event_type`, `start_at`/`end_at`, `all_day`, `location`, `status`, `reminder_minutes_before`.

All tables use UUID primary keys and automatic `created_at` / `updated_at` timestamps.

---

## 📡 Key API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/contacts` | List with filters: `status`, `source`, `priority`, `tag`, `q`, `sort` |
| `POST` | `/contacts` | Create a contact |
| `GET/PATCH/DELETE` | `/contacts/{id}` | Read / update / delete |
| `GET` | `/contacts/cold?days=N` | Cold leads (no interaction in > N days) |
| `GET/POST` | `/contacts/{id}/interactions` | List / log interactions (nested) |
| `GET` | `/contacts/{id}/events` | A contact's events |
| `PATCH/DELETE` | `/interactions/{id}` | Edit / delete an interaction |
| `GET/POST` | `/events` | List (by date range) / create events |
| `GET/PATCH/DELETE` | `/events/{id}` | Read / update / delete |
| `GET` | `/calendar/items?start=&end=` | Unified feed: events + implicit next-action reminders |
| `GET` | `/dashboard/stats` | Pipeline counts, weekly interactions, conversion, etc. |
| `GET` | `/agenda/today` | Today's events + due/overdue actions + cold leads |

Full interactive reference at **http://localhost:8000/docs**.

---

## 🛠️ Common tasks

**Re-seed sample data** (only inserts when empty):
```bash
docker compose exec api python -m app.seed --if-empty
# or force it regardless of existing data:
docker compose exec api python -m app.seed
```

**Run migrations manually:**
```bash
docker compose exec api alembic upgrade head
```

**Create a new migration after changing models:**
```bash
docker compose exec api alembic revision --autogenerate -m "describe change"
docker compose exec api alembic upgrade head
```

**Open a database shell:**
```bash
docker compose exec db psql -U leadtracker -d leadtracker
```

**Tail logs:**
```bash
docker compose logs -f api
docker compose logs -f web
```

---

## 👤 Adding your first real contact

1. Open **http://localhost:5173**.
2. Go to **Contacts** (or **Pipeline**) and click **“New contact”**.
3. Fill in at least the **Full name** (everything else is optional), pick a *source*,
   *status* and *priority*, optionally add tags, a **next action** and its date.
4. Save — the contact appears in the list and on the pipeline board.
5. Open the contact to:
   - **Log interaction** — records a touch and updates *last contacted* automatically.
   - **Schedule** — create a meeting/call; tick the box to also move the lead to
     *“Meeting scheduled”*. It immediately shows on the **Calendar** and **Agenda**.
6. Set a **next action date** and watch it appear as a reminder on the **Calendar**
   and under **Today / Agenda**.

If you'd rather start from a clean slate, run `docker compose down -v` to drop the
seeded sample data, then `docker compose up` again and add only your own contacts.

---

## ⚙️ Configuration reference

All values live in `.env` (see `.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `leadtracker` | DB credentials |
| `DB_PORT` | `5432` | Host port for Postgres |
| `API_KEY` | `dev-local-key-change-me` | Shared API key (empty = no auth) |
| `API_PORT` | `8000` | Host port for the API |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed web origins |
| `COLD_LEAD_DAYS` | `7` | Cold-lead threshold (days) |
| `WEB_PORT` | `5173` | Host port for the web app |
| `VITE_API_URL` | `http://localhost:8000` | API base URL used by the browser |
