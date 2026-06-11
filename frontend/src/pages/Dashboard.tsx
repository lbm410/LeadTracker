import {
  ArrowRight,
  CalendarClock,
  Flame,
  Snowflake,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardStats } from '../api/dashboard'
import { EventTypeBadge } from '../components/Badges'
import { PageHeader } from '../components/PageHeader'
import { Card, ErrorState, LoadingState } from '../components/ui'
import { STATUS_META } from '../lib/constants'
import { errorMessage } from '../api/client'
import { formatDateTime } from '../lib/utils'
import type { ContactStatus } from '../types'

function Metric({
  icon,
  label,
  value,
  accent,
  to,
}: {
  icon: ReactNode
  label: string
  value: string | number
  accent: string
  to?: string
}) {
  const inner = (
    <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold leading-none text-slate-900">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats()

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your prospecting at a glance." />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={errorMessage(error, 'Could not load dashboard')} />}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Metric
              icon={<Users className="h-5 w-5 text-brand-600" />}
              label="Total leads"
              value={data.total_contacts}
              accent="bg-brand-50"
              to="/contacts"
            />
            <Metric
              icon={<TrendingUp className="h-5 w-5 text-sky-600" />}
              label="Interactions (7d)"
              value={data.interactions_this_week}
              accent="bg-sky-50"
            />
            <Metric
              icon={<Flame className="h-5 w-5 text-amber-600" />}
              label="Actions due today"
              value={data.actions_due_today}
              accent="bg-amber-50"
              to="/agenda"
            />
            <Metric
              icon={<Snowflake className="h-5 w-5 text-cyan-600" />}
              label="Cold leads"
              value={data.cold_leads_count}
              accent="bg-cyan-50"
              to="/agenda"
            />
            <Metric
              icon={<Target className="h-5 w-5 text-emerald-600" />}
              label="Conversion rate"
              value={`${Math.round(data.conversion_rate * 100)}%`}
              accent="bg-emerald-50"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Pipeline distribution */}
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Pipeline by stage</h2>
                <Link to="/pipeline" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  Open board <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <PipelineBars pipeline={data.pipeline} total={data.total_contacts} />
              <div className="mt-4 flex gap-6 border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-600">
                  Won <strong className="text-emerald-600">{data.won_count}</strong>
                </span>
                <span className="text-slate-600">
                  Lost <strong className="text-rose-600">{data.lost_count}</strong>
                </span>
              </div>
            </Card>

            {/* Upcoming events */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Upcoming events</h2>
                <Link to="/calendar" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                  Calendar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {data.upcoming_events.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Nothing scheduled yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.upcoming_events.map((ev) => (
                    <li key={ev.id} className="flex items-start gap-3">
                      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{ev.title}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(ev.start_at)}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <EventTypeBadge type={ev.event_type} />
                          {ev.contact && (
                            <Link to={`/contacts/${ev.contact.id}`} className="truncate text-xs text-brand-600 hover:underline">
                              {ev.contact.full_name}
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function PipelineBars({
  pipeline,
  total,
}: {
  pipeline: { status: string; count: number }[]
  total: number
}) {
  const max = Math.max(1, ...pipeline.map((p) => p.count))
  return (
    <div className="space-y-2.5">
      {pipeline.map((p) => {
        const meta = STATUS_META[p.status as ContactStatus]
        return (
          <div key={p.status} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-xs font-medium text-slate-600">{meta?.label ?? p.status}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${(p.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">{p.count}</span>
          </div>
        )
      })}
      {total === 0 && <p className="pt-2 text-center text-xs text-slate-400">No leads yet.</p>}
    </div>
  )
}
