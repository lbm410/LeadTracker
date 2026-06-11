"""Seed the database with sample data.

Usage:
    python -m app.seed            # always insert sample data
    python -m app.seed --if-empty # only seed when there are no contacts yet
"""
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select

from app.database import SessionLocal
from app.models import Contact, Event, Interaction


def _now() -> datetime:
    return datetime.now(timezone.utc)


def seed(if_empty: bool = False) -> None:
    db = SessionLocal()
    try:
        existing = db.execute(select(func.count(Contact.id))).scalar_one()
        if if_empty and existing > 0:
            print(f"[seed] Database already has {existing} contacts — skipping.")
            return

        now = _now()

        ana = Contact(
            full_name="Ana Torres",
            company="Innovatech Solutions",
            role="Head of Operations",
            email="ana.torres@innovatech.example",
            phone="+34 600 111 222",
            linkedin_url="https://www.linkedin.com/in/ana-torres-example",
            source="linkedin",
            status="in_conversation",
            priority="high",
            tags=["saas", "warm", "decision-maker"],
            notes="Interested in automating their onboarding flow. Budget confirmed for Q3.",
            next_action="Send tailored proposal",
            next_action_date=(now + timedelta(days=1)).date(),
        )
        carlos = Contact(
            full_name="Carlos Méndez",
            company="LogiPro Logistics",
            role="CTO",
            email="carlos.mendez@logipro.example",
            phone="+34 600 333 444",
            linkedin_url="https://www.linkedin.com/in/carlos-mendez-example",
            source="referral",
            status="meeting_scheduled",
            priority="high",
            tags=["logistics", "referral"],
            notes="Referred by Ana. Technical buyer, cares about API quality.",
            next_action="Prepare technical demo",
            next_action_date=(now + timedelta(days=2)).date(),
        )
        lucia = Contact(
            full_name="Lucía Fernández",
            company="GreenMarket",
            role="Marketing Manager",
            email="lucia.fernandez@greenmarket.example",
            source="event",
            status="awaiting_reply",
            priority="medium",
            tags=["ecommerce"],
            notes="Met at the SaaS Summit. Sent a connection request and a first message.",
            next_action="Follow up if no reply",
            next_action_date=(now - timedelta(days=2)).date(),  # overdue
        )
        # A deliberately cold lead (no recent interaction).
        diego = Contact(
            full_name="Diego Ramírez",
            company="BuildWorks",
            role="Procurement Lead",
            email="diego.ramirez@buildworks.example",
            source="cold",
            status="contacted",
            priority="low",
            tags=["construction"],
            notes="Cold outreach, no answer yet.",
        )
        diego.last_contacted_at = now - timedelta(days=21)

        db.add_all([ana, carlos, lucia, diego])
        db.flush()  # assign IDs

        interactions = [
            Interaction(
                contact_id=ana.id,
                channel="linkedin",
                direction="outbound",
                interaction_type="connection_request",
                content="Sent a connection request mentioning their recent funding round.",
                outcome="Accepted",
                occurred_at=now - timedelta(days=10),
            ),
            Interaction(
                contact_id=ana.id,
                channel="linkedin",
                direction="outbound",
                interaction_type="first_message",
                content="Intro message about onboarding automation.",
                outcome="Replied, interested",
                occurred_at=now - timedelta(days=8),
            ),
            Interaction(
                contact_id=ana.id,
                channel="call",
                direction="outbound",
                interaction_type="call",
                content="Discovery call: confirmed pain points and budget.",
                outcome="Positive, asked for a proposal",
                occurred_at=now - timedelta(days=2),
            ),
            Interaction(
                contact_id=carlos.id,
                channel="email",
                direction="outbound",
                interaction_type="first_message",
                content="Intro email referencing Ana's recommendation.",
                outcome="Booked a meeting",
                occurred_at=now - timedelta(days=3),
            ),
            Interaction(
                contact_id=lucia.id,
                channel="linkedin",
                direction="outbound",
                interaction_type="first_message",
                content="Followed up after meeting at the summit.",
                outcome="No reply yet",
                occurred_at=now - timedelta(days=5),
            ),
        ]
        db.add_all(interactions)
        # Keep last_contacted_at consistent with the most recent interaction.
        ana.last_contacted_at = now - timedelta(days=2)
        carlos.last_contacted_at = now - timedelta(days=3)
        lucia.last_contacted_at = now - timedelta(days=5)

        events = [
            Event(
                contact_id=carlos.id,
                title="Technical demo — LogiPro",
                description="Walk through the API and integration options.",
                event_type="meeting",
                start_at=(now + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0),
                end_at=(now + timedelta(days=2)).replace(hour=11, minute=0, second=0, microsecond=0),
                all_day=False,
                location="Google Meet — https://meet.example/logipro-demo",
                status="scheduled",
                reminder_minutes_before=30,
            ),
            Event(
                contact_id=ana.id,
                title="Proposal review call — Innovatech",
                description="Review the tailored proposal and next steps.",
                event_type="call",
                start_at=(now + timedelta(days=4)).replace(hour=16, minute=30, second=0, microsecond=0),
                end_at=(now + timedelta(days=4)).replace(hour=17, minute=0, second=0, microsecond=0),
                all_day=False,
                location="Phone",
                status="scheduled",
                reminder_minutes_before=15,
            ),
            Event(
                title="Weekly prospecting block",
                description="Time-boxed outbound prospecting.",
                event_type="task",
                start_at=(now + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0),
                end_at=(now + timedelta(days=1)).replace(hour=10, minute=30, second=0, microsecond=0),
                all_day=False,
                status="scheduled",
            ),
        ]
        db.add_all(events)

        db.commit()
        print("[seed] Inserted 4 contacts, 5 interactions and 3 events.")
    finally:
        db.close()


if __name__ == "__main__":
    seed(if_empty="--if-empty" in sys.argv)
