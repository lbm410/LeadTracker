import type {
  ContactSource,
  ContactStatus,
  EventStatus,
  EventType,
  InteractionChannel,
  InteractionDirection,
  InteractionType,
  Priority,
} from '../types'

interface Meta {
  label: string
  /** Tailwind classes for a soft badge (bg + text + ring). */
  badge: string
  /** Solid color (hex) used by the calendar. */
  color?: string
}

export const STATUS_META: Record<ContactStatus, Meta> = {
  new: { label: 'New', badge: 'bg-slate-100 text-slate-700 ring-slate-200' },
  contacted: { label: 'Contacted', badge: 'bg-sky-100 text-sky-700 ring-sky-200' },
  awaiting_reply: { label: 'Awaiting reply', badge: 'bg-amber-100 text-amber-700 ring-amber-200' },
  in_conversation: { label: 'In conversation', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  meeting_scheduled: { label: 'Meeting scheduled', badge: 'bg-violet-100 text-violet-700 ring-violet-200' },
  qualified: { label: 'Qualified', badge: 'bg-teal-100 text-teal-700 ring-teal-200' },
  won: { label: 'Won', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  lost: { label: 'Lost', badge: 'bg-rose-100 text-rose-700 ring-rose-200' },
  on_hold: { label: 'On hold', badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
}

// Order shown on the kanban board.
export const PIPELINE_STATUSES: ContactStatus[] = [
  'new',
  'contacted',
  'awaiting_reply',
  'in_conversation',
  'meeting_scheduled',
  'qualified',
  'won',
  'lost',
  'on_hold',
]

export const PRIORITY_META: Record<Priority, Meta> = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-600 ring-slate-200' },
  medium: { label: 'Medium', badge: 'bg-amber-100 text-amber-700 ring-amber-200' },
  high: { label: 'High', badge: 'bg-rose-100 text-rose-700 ring-rose-200' },
}

export const SOURCE_META: Record<ContactSource, Meta> = {
  linkedin: { label: 'LinkedIn', badge: 'bg-sky-100 text-sky-700 ring-sky-200' },
  email: { label: 'Email', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  whatsapp: { label: 'WhatsApp', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  referral: { label: 'Referral', badge: 'bg-teal-100 text-teal-700 ring-teal-200' },
  event: { label: 'Event', badge: 'bg-violet-100 text-violet-700 ring-violet-200' },
  cold: { label: 'Cold', badge: 'bg-slate-100 text-slate-600 ring-slate-200' },
  other: { label: 'Other', badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
}

export const CHANNEL_META: Record<InteractionChannel, Meta> = {
  linkedin: { label: 'LinkedIn', badge: 'bg-sky-100 text-sky-700 ring-sky-200' },
  email: { label: 'Email', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  whatsapp: { label: 'WhatsApp', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  call: { label: 'Call', badge: 'bg-amber-100 text-amber-700 ring-amber-200' },
  meeting: { label: 'Meeting', badge: 'bg-violet-100 text-violet-700 ring-violet-200' },
  other: { label: 'Other', badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
}

export const DIRECTION_META: Record<InteractionDirection, Meta> = {
  outbound: { label: 'Outbound', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  inbound: { label: 'Inbound', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
}

export const INTERACTION_TYPE_META: Record<InteractionType, Meta> = {
  connection_request: { label: 'Connection request', badge: 'bg-sky-100 text-sky-700 ring-sky-200' },
  first_message: { label: 'First message', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  follow_up: { label: 'Follow-up', badge: 'bg-amber-100 text-amber-700 ring-amber-200' },
  reply: { label: 'Reply', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  call: { label: 'Call', badge: 'bg-violet-100 text-violet-700 ring-violet-200' },
  meeting: { label: 'Meeting', badge: 'bg-teal-100 text-teal-700 ring-teal-200' },
  note: { label: 'Note', badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200' },
}

export const EVENT_TYPE_META: Record<EventType, Meta> = {
  meeting: { label: 'Meeting', badge: 'bg-violet-100 text-violet-700 ring-violet-200', color: '#7c3aed' },
  call: { label: 'Call', badge: 'bg-sky-100 text-sky-700 ring-sky-200', color: '#0284c7' },
  reminder: { label: 'Reminder', badge: 'bg-amber-100 text-amber-700 ring-amber-200', color: '#d97706' },
  follow_up: { label: 'Follow-up', badge: 'bg-teal-100 text-teal-700 ring-teal-200', color: '#0d9488' },
  task: { label: 'Task', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200', color: '#4f46e5' },
}

export const EVENT_STATUS_META: Record<EventStatus, Meta> = {
  scheduled: { label: 'Scheduled', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-200' },
  completed: { label: 'Completed', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
  cancelled: { label: 'Cancelled', badge: 'bg-rose-100 text-rose-700 ring-rose-200' },
}

// Helpers to build <option> lists from the meta maps.
export function options<T extends string>(meta: Record<T, Meta>): { value: T; label: string }[] {
  return (Object.keys(meta) as T[]).map((value) => ({ value, label: meta[value].label }))
}

export const SOURCE_OPTIONS = options(SOURCE_META)
export const STATUS_OPTIONS = options(STATUS_META)
export const PRIORITY_OPTIONS = options(PRIORITY_META)
export const CHANNEL_OPTIONS = options(CHANNEL_META)
export const DIRECTION_OPTIONS = options(DIRECTION_META)
export const INTERACTION_TYPE_OPTIONS = options(INTERACTION_TYPE_META)
export const EVENT_TYPE_OPTIONS = options(EVENT_TYPE_META)
export const EVENT_STATUS_OPTIONS = options(EVENT_STATUS_META)
