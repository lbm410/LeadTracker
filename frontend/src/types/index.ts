// Domain types mirroring the backend API.

export type ContactSource =
  | 'linkedin'
  | 'email'
  | 'whatsapp'
  | 'referral'
  | 'event'
  | 'cold'
  | 'other'

export type ContactStatus =
  | 'new'
  | 'contacted'
  | 'awaiting_reply'
  | 'in_conversation'
  | 'meeting_scheduled'
  | 'qualified'
  | 'won'
  | 'lost'
  | 'on_hold'

export type Priority = 'low' | 'medium' | 'high'

export type InteractionChannel = 'linkedin' | 'email' | 'whatsapp' | 'call' | 'meeting' | 'other'
export type InteractionDirection = 'outbound' | 'inbound'
export type InteractionType =
  | 'connection_request'
  | 'first_message'
  | 'follow_up'
  | 'reply'
  | 'call'
  | 'meeting'
  | 'note'

export type EventType = 'meeting' | 'call' | 'reminder' | 'follow_up' | 'task'
export type EventStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Contact {
  id: string
  full_name: string
  company: string | null
  role: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  source: ContactSource
  status: ContactStatus
  priority: Priority
  tags: string[]
  notes: string | null
  next_action: string | null
  next_action_date: string | null
  last_contacted_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactSummary {
  id: string
  full_name: string
  company: string | null
  status: ContactStatus
  priority: Priority
}

export interface Interaction {
  id: string
  contact_id: string
  channel: InteractionChannel
  direction: InteractionDirection
  interaction_type: InteractionType
  content: string | null
  outcome: string | null
  occurred_at: string
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  contact_id: string | null
  title: string
  description: string | null
  event_type: EventType
  start_at: string
  end_at: string | null
  all_day: boolean
  location: string | null
  status: EventStatus
  reminder_minutes_before: number | null
  created_at: string
  updated_at: string
  contact: ContactSummary | null
}

export interface CalendarItem {
  id: string
  kind: 'event' | 'next_action'
  title: string
  start: string
  end: string | null
  all_day: boolean
  event_type: EventType
  status: string
  contact_id: string | null
  contact_name: string | null
  location: string | null
}

export interface StageConversion {
  status: string
  count: number
}

export interface DashboardStats {
  total_contacts: number
  leads_by_status: Record<ContactStatus, number>
  leads_by_priority: Record<Priority, number>
  interactions_this_week: number
  upcoming_events: CalendarEvent[]
  cold_leads_count: number
  actions_due_today: number
  won_count: number
  lost_count: number
  conversion_rate: number
  pipeline: StageConversion[]
}

export interface AgendaResponse {
  day: string
  today_events: CalendarEvent[]
  overdue_actions: Contact[]
  today_actions: Contact[]
  cold_leads: Contact[]
}

// --- Payloads ---

export interface ContactInput {
  full_name: string
  company?: string | null
  role?: string | null
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  source: ContactSource
  status: ContactStatus
  priority: Priority
  tags: string[]
  notes?: string | null
  next_action?: string | null
  next_action_date?: string | null
}

export interface InteractionInput {
  channel: InteractionChannel
  direction: InteractionDirection
  interaction_type: InteractionType
  content?: string | null
  outcome?: string | null
  occurred_at: string
}

export interface EventInput {
  contact_id?: string | null
  title: string
  description?: string | null
  event_type: EventType
  start_at: string
  end_at?: string | null
  all_day: boolean
  location?: string | null
  status: EventStatus
  reminder_minutes_before?: number | null
  update_contact_status?: boolean
}

export interface ContactFilters {
  status?: ContactStatus
  source?: ContactSource
  priority?: Priority
  tag?: string
  q?: string
  sort?: string
}
