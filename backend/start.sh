#!/usr/bin/env sh
set -e

echo "[start] Waiting for the database to accept connections..."
python - <<'PY'
import os, time
import sqlalchemy as sa

url = os.environ.get("DATABASE_URL", "postgresql+psycopg2://leadtracker:leadtracker@db:5432/leadtracker")
engine = sa.create_engine(url)
for attempt in range(30):
    try:
        with engine.connect() as conn:
            conn.execute(sa.text("SELECT 1"))
        print("[start] Database is ready.")
        break
    except Exception as exc:  # noqa: BLE001
        print(f"[start] DB not ready yet ({attempt + 1}/30): {exc}")
        time.sleep(2)
else:
    raise SystemExit("[start] Database did not become ready in time.")
PY

echo "[start] Running migrations..."
alembic upgrade head

echo "[start] Seeding sample data (only if the database is empty)..."
python -m app.seed --if-empty

echo "[start] Launching API with hot-reload..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
