"""Aggregations for dashboard, agenda and the calendar feed."""
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.enums import ContactStatus, EventType, Priority
from app.models import Contact, Event, Interaction
from app.schemas.dashboard import (
    AgendaResponse,
    CalendarItem,
    DashboardStats,
    StageConversion,
)
from app.schemas.contact import ContactRead
from app.schemas.event import EventRead
from app.services.contact_service import cold_leads

# Order used to render the pipeline funnel consistently.
PIPELINE_ORDER = [s.value for s in ContactStatus]


def _day_bounds(day: date) -> tuple[datetime, datetime]:
    start = datetime.combine(day, time.min, tzinfo=timezone.utc)
    end = datetime.combine(day, time.max, tzinfo=timezone.utc)
    return start, end


def dashboard_stats(db: Session) -> DashboardStats:
    total_contacts = db.execute(select(func.count(Contact.id))).scalar_one()

    status_rows = db.execute(
        select(Contact.status, func.count(Contact.id)).group_by(Contact.status)
    ).all()
    leads_by_status = {status: count for status, count in status_rows}
    # Ensure every known status appears (zero-filled) for stable charts.
    leads_by_status = {s: leads_by_status.get(s, 0) for s in PIPELINE_ORDER}

    priority_rows = db.execute(
        select(Contact.priority, func.count(Contact.id)).group_by(Contact.priority)
    ).all()
    leads_by_priority = {p.value: 0 for p in Priority}
    for priority, count in priority_rows:
        leads_by_priority[priority] = count

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    interactions_this_week = db.execute(
        select(func.count(Interaction.id)).where(Interaction.occurred_at >= week_ago)
    ).scalar_one()

    now = datetime.now(timezone.utc)
    upcoming_stmt = (
        select(Event)
        .where(Event.start_at >= now, Event.status == "scheduled")
        .options(selectinload(Event.contact))
        .order_by(Event.start_at.asc())
        .limit(5)
    )
    upcoming_events = list(db.execute(upcoming_stmt).scalars().all())

    today = now.date()
    actions_due_today = db.execute(
        select(func.count(Contact.id)).where(
            Contact.next_action_date.is_not(None),
            Contact.next_action_date <= today,
            Contact.status.not_in(("won", "lost")),
        )
    ).scalar_one()

    won_count = leads_by_status.get("won", 0)
    lost_count = leads_by_status.get("lost", 0)
    closed = won_count + lost_count
    conversion_rate = (won_count / closed) if closed else 0.0

    cold = cold_leads(db)

    pipeline = [StageConversion(status=s, count=leads_by_status.get(s, 0)) for s in PIPELINE_ORDER]

    return DashboardStats(
        total_contacts=total_contacts,
        leads_by_status=leads_by_status,
        leads_by_priority=leads_by_priority,
        interactions_this_week=interactions_this_week,
        upcoming_events=[EventRead.model_validate(e) for e in upcoming_events],
        cold_leads_count=len(cold),
        actions_due_today=actions_due_today,
        won_count=won_count,
        lost_count=lost_count,
        conversion_rate=round(conversion_rate, 4),
        pipeline=pipeline,
    )


def agenda(db: Session, day: date | None = None) -> AgendaResponse:
    target = day or datetime.now(timezone.utc).date()
    start, end = _day_bounds(target)

    events_stmt = (
        select(Event)
        .where(Event.start_at >= start, Event.start_at <= end)
        .options(selectinload(Event.contact))
        .order_by(Event.start_at.asc())
    )
    today_events = list(db.execute(events_stmt).scalars().all())

    overdue_stmt = (
        select(Contact)
        .where(
            Contact.next_action_date.is_not(None),
            Contact.next_action_date < target,
            Contact.status.not_in(("won", "lost")),
        )
        .order_by(Contact.next_action_date.asc())
    )
    overdue_actions = list(db.execute(overdue_stmt).scalars().all())

    today_stmt = (
        select(Contact)
        .where(
            Contact.next_action_date == target,
            Contact.status.not_in(("won", "lost")),
        )
        .order_by(Contact.priority.asc())
    )
    today_actions = list(db.execute(today_stmt).scalars().all())

    return AgendaResponse(
        day=target,
        today_events=[EventRead.model_validate(e) for e in today_events],
        overdue_actions=[ContactRead.model_validate(c) for c in overdue_actions],
        today_actions=[ContactRead.model_validate(c) for c in today_actions],
        cold_leads=[ContactRead.model_validate(c) for c in cold_leads(db)],
    )


def calendar_items(db: Session, start: datetime, end: datetime) -> list[CalendarItem]:
    """Real events in range + implicit reminders from contacts' next_action_date."""
    items: list[CalendarItem] = []

    events_stmt = (
        select(Event)
        .where(Event.start_at >= start, Event.start_at <= end)
        .options(selectinload(Event.contact))
        .order_by(Event.start_at.asc())
    )
    for e in db.execute(events_stmt).scalars().all():
        items.append(
            CalendarItem(
                id=str(e.id),
                kind="event",
                title=e.title,
                start=e.start_at,
                end=e.end_at,
                all_day=e.all_day,
                event_type=EventType(e.event_type),
                status=e.status,
                contact_id=e.contact_id,
                contact_name=e.contact.full_name if e.contact else None,
                location=e.location,
            )
        )

    # Implicit next-action reminders (all-day) for contacts with a date in range.
    na_stmt = select(Contact).where(
        Contact.next_action_date.is_not(None),
        Contact.next_action_date >= start.date(),
        Contact.next_action_date <= end.date(),
        Contact.status.not_in(("won", "lost")),
    )
    for c in db.execute(na_stmt).scalars().all():
        action_dt = datetime.combine(c.next_action_date, time(9, 0), tzinfo=timezone.utc)
        title = c.next_action or "Next action"
        items.append(
            CalendarItem(
                id=f"next-action-{c.id}",
                kind="next_action",
                title=f"⏰ {title} · {c.full_name}",
                start=action_dt,
                end=None,
                all_day=True,
                event_type=EventType.reminder,
                status="scheduled",
                contact_id=c.id,
                contact_name=c.full_name,
                location=None,
            )
        )

    items.sort(key=lambda i: i.start)
    return items
