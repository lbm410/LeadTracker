import { AlertCircle, CalendarClock, CheckCircle2, MapPin, Snowflake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAgenda } from '../api/dashboard'
import { EventTypeBadge, PriorityBadge, StatusBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { Card, EmptyState, ErrorState, LoadingState } from '../components/ui'
import { formatDate, formatTime, fromNow } from '../lib/utils'
import type { Contact } from '../types'

export function Agenda() {
  const { data, isLoading, isError, error } = useAgenda()

  return (
    <div>
      <PageHeader title="Today / Agenda" subtitle="What needs your attention right now." />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={errorMessage(error, 'Could not load your agenda')} />}

      {data && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's events */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarClock className="h-4 w-4 text-brand-600" /> Today's schedule
            </h2>
            {data.today_events.length === 0 ? (
              <EmptyState icon={<CalendarClock className="h-7 w-7" />} title="Nothing today" description="No meetings or calls scheduled." />
            ) : (
              <ul className="space-y-3">
                {data.today_events.map((ev) => (
                  <li key={ev.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {ev.all_day ? 'All day' : formatTime(ev.start_at)}
                      </span>
                      <EventTypeBadge type={ev.event_type} />
                    </div>
                    <p className="mt-1 font-medium text-slate-800">{ev.title}</p>
                    {ev.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {ev.location}
                      </p>
                    )}
                    {ev.contact && (
                      <Link to={`/contacts/${ev.contact.id}`} className="mt-1 inline-block text-xs text-brand-600 hover:underline">
                        {ev.contact.full_name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Follow-ups */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-amber-600" /> Follow-ups
            </h2>

            {data.overdue_actions.length === 0 && data.today_actions.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-7 w-7" />} title="All caught up" description="No actions due." />
            ) : (
              <div className="space-y-4">
                {data.overdue_actions.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600">
                      <AlertCircle className="h-3.5 w-3.5" /> Overdue ({data.overdue_actions.length})
                    </p>
                    <ul className="space-y-2">
                      {data.overdue_actions.map((c) => (
                        <ActionRow key={c.id} contact={c} overdue />
                      ))}
                    </ul>
                  </div>
                )}
                {data.today_actions.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due today ({data.today_actions.length})
                    </p>
                    <ul className="space-y-2">
                      {data.today_actions.map((c) => (
                        <ActionRow key={c.id} contact={c} />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Cold leads */}
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Snowflake className="h-4 w-4 text-cyan-600" /> Cold leads to recover
            </h2>
            {data.cold_leads.length === 0 ? (
              <EmptyState icon={<Snowflake className="h-7 w-7" />} title="No cold leads" description="Every active lead has been contacted recently." />
            ) : (
              <ul className="space-y-2">
                {data.cold_leads.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/contacts/${c.id}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">{c.full_name}</span>
                        <span className="block truncate text-xs text-slate-500">{c.company ?? '—'}</span>
                      </span>
                      <span className="shrink-0 text-right text-xs text-slate-400">
                        {c.last_contacted_at ? `Last: ${fromNow(c.last_contacted_at)}` : 'Never contacted'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

function ActionRow({ contact, overdue }: { contact: Contact; overdue?: boolean }) {
  return (
    <li>
      <Link
        to={`/contacts/${contact.id}`}
        className={`block rounded-lg border px-3 py-2 hover:bg-slate-50 ${overdue ? 'border-rose-100 bg-rose-50/40' : 'border-slate-100'}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-slate-800">{contact.full_name}</span>
          <PriorityBadge priority={contact.priority} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-slate-600">{contact.next_action ?? 'Follow up'}</span>
          <span className={`shrink-0 text-xs ${overdue ? 'font-medium text-rose-600' : 'text-slate-400'}`}>
            {formatDate(contact.next_action_date)}
          </span>
        </div>
        <div className="mt-1.5">
          <StatusBadge status={contact.status} />
        </div>
      </Link>
    </li>
  )
}
