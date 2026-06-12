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

// Visual styling per enum value (Tailwind badge classes). Human-readable
// labels live in the i18n dictionaries (keyed "enum.<group>.<value>").

export const STATUS_STYLES: Record<ContactStatus, string> = {
  new: 'bg-slate-100 text-slate-700 ring-slate-200',
  contacted: 'bg-sky-100 text-sky-700 ring-sky-200',
  awaiting_reply: 'bg-amber-100 text-amber-700 ring-amber-200',
  in_conversation: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  meeting_scheduled: 'bg-violet-100 text-violet-700 ring-violet-200',
  qualified: 'bg-teal-100 text-teal-700 ring-teal-200',
  won: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  lost: 'bg-rose-100 text-rose-700 ring-rose-200',
  on_hold: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
}

// Order shown on the kanban board and the dashboard funnel.
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
export const STATUS_VALUES = PIPELINE_STATUSES

export const PRIORITY_VALUES: Priority[] = ['low', 'medium', 'high']
export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600 ring-slate-200',
  medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  high: 'bg-rose-100 text-rose-700 ring-rose-200',
}

export const SOURCE_VALUES: ContactSource[] = [
  'linkedin',
  'email',
  'whatsapp',
  'referral',
  'event',
  'cold',
  'other',
]
export const SOURCE_STYLES: Record<ContactSource, string> = {
  linkedin: 'bg-sky-100 text-sky-700 ring-sky-200',
  email: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  whatsapp: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  referral: 'bg-teal-100 text-teal-700 ring-teal-200',
  event: 'bg-violet-100 text-violet-700 ring-violet-200',
  cold: 'bg-slate-100 text-slate-600 ring-slate-200',
  other: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
}

export const CHANNEL_VALUES: InteractionChannel[] = [
  'linkedin',
  'email',
  'whatsapp',
  'call',
  'meeting',
  'other',
]
export const CHANNEL_STYLES: Record<InteractionChannel, string> = {
  linkedin: 'bg-sky-100 text-sky-700 ring-sky-200',
  email: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  whatsapp: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  call: 'bg-amber-100 text-amber-700 ring-amber-200',
  meeting: 'bg-violet-100 text-violet-700 ring-violet-200',
  other: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
}

export const DIRECTION_VALUES: InteractionDirection[] = ['outbound', 'inbound']
export const DIRECTION_STYLES: Record<InteractionDirection, string> = {
  outbound: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  inbound: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
}

export const INTERACTION_TYPE_VALUES: InteractionType[] = [
  'connection_request',
  'first_message',
  'follow_up',
  'reply',
  'call',
  'meeting',
  'note',
]
export const INTERACTION_TYPE_STYLES: Record<InteractionType, string> = {
  connection_request: 'bg-sky-100 text-sky-700 ring-sky-200',
  first_message: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  follow_up: 'bg-amber-100 text-amber-700 ring-amber-200',
  reply: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  call: 'bg-violet-100 text-violet-700 ring-violet-200',
  meeting: 'bg-teal-100 text-teal-700 ring-teal-200',
  note: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
}

export const EVENT_TYPE_VALUES: EventType[] = ['meeting', 'call', 'reminder', 'follow_up', 'task']
export const EVENT_TYPE_STYLES: Record<EventType, string> = {
  meeting: 'bg-violet-100 text-violet-700 ring-violet-200',
  call: 'bg-sky-100 text-sky-700 ring-sky-200',
  reminder: 'bg-amber-100 text-amber-700 ring-amber-200',
  follow_up: 'bg-teal-100 text-teal-700 ring-teal-200',
  task: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
}
export const EVENT_TYPE_COLOR: Record<EventType, string> = {
  meeting: '#7c3aed',
  call: '#0284c7',
  reminder: '#d97706',
  follow_up: '#0d9488',
  task: '#4f46e5',
}

export const EVENT_STATUS_VALUES: EventStatus[] = ['scheduled', 'completed', 'cancelled']
export const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  scheduled: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 ring-rose-200',
}
