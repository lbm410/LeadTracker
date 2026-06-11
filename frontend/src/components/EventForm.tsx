import { useMemo, useState } from 'react'
import { useContacts } from '../api/contacts'
import { EVENT_STATUS_OPTIONS, EVENT_TYPE_OPTIONS } from '../lib/constants'
import { fromLocalInput, toLocalInput } from '../lib/utils'
import type { CalendarEvent, EventInput } from '../types'
import { Button, Field, Input, Select, Textarea } from './ui'

interface Props {
  initial?: CalendarEvent
  defaultContactId?: string | null
  defaultStart?: string // ISO
  lockContact?: boolean
  onSubmit: (payload: EventInput) => void
  onCancel: () => void
  loading?: boolean
}

export function EventForm({
  initial,
  defaultContactId,
  defaultStart,
  lockContact,
  onSubmit,
  onCancel,
  loading,
}: Props) {
  const { data: contacts = [] } = useContacts({ sort: 'full_name' })

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [eventType, setEventType] = useState<EventInput['event_type']>(initial?.event_type ?? 'meeting')
  const [startAt, setStartAt] = useState(
    toLocalInput(initial?.start_at ?? defaultStart ?? new Date().toISOString()),
  )
  const [endAt, setEndAt] = useState(toLocalInput(initial?.end_at ?? null))
  const [allDay, setAllDay] = useState(initial?.all_day ?? false)
  const [location, setLocation] = useState(initial?.location ?? '')
  const [status, setStatus] = useState<EventInput['status']>(initial?.status ?? 'scheduled')
  const [reminder, setReminder] = useState<string>(
    initial?.reminder_minutes_before != null ? String(initial.reminder_minutes_before) : '',
  )
  const [contactId, setContactId] = useState<string>(initial?.contact_id ?? defaultContactId ?? '')
  const [updateStatus, setUpdateStatus] = useState(false)

  const contactOptions = useMemo(
    () => contacts.map((c) => ({ value: c.id, label: c.company ? `${c.full_name} · ${c.company}` : c.full_name })),
    [contacts],
  )

  const offerStatusBump = !initial && (eventType === 'meeting' || eventType === 'call') && !!contactId

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      title,
      description: description || null,
      event_type: eventType,
      start_at: fromLocalInput(startAt) ?? new Date().toISOString(),
      end_at: allDay ? null : fromLocalInput(endAt),
      all_day: allDay,
      location: location || null,
      status,
      reminder_minutes_before: reminder ? Number(reminder) : null,
      contact_id: contactId || null,
      update_contact_status: offerStatusBump ? updateStatus : false,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title *" htmlFor="title">
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Discovery call" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="event_type">
          <Select id="event_type" options={EVENT_TYPE_OPTIONS} value={eventType} onChange={(e) => setEventType(e.target.value as EventInput['event_type'])} />
        </Field>
        <Field label="Status" htmlFor="event_status">
          <Select id="event_status" options={EVENT_STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value as EventInput['status'])} />
        </Field>
      </div>

      <Field label="Linked contact" htmlFor="contact">
        <Select
          id="contact"
          options={contactOptions}
          placeholder="— None —"
          value={contactId}
          disabled={lockContact}
          onChange={(e) => setContactId(e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
        All-day event
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Start *" htmlFor="start_at">
          <Input id="start_at" type="datetime-local" required value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </Field>
        {!allDay && (
          <Field label="End" htmlFor="end_at">
            <Input id="end_at" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Location / link" htmlFor="location">
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Teams/Meet link or room" />
        </Field>
        <Field label="Reminder (minutes before)" htmlFor="reminder">
          <Input id="reminder" type="number" min={0} value={reminder} onChange={(e) => setReminder(e.target.value)} placeholder="15" />
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      {offerStatusBump && (
        <label className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={updateStatus} onChange={(e) => setUpdateStatus(e.target.checked)} />
          Move this contact to <strong>“Meeting scheduled”</strong>
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </form>
  )
}
