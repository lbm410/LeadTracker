import { useMemo, useState } from 'react'
import { useContacts } from '../api/contacts'
import { optionsFor, useI18n } from '../i18n'
import { EVENT_STATUS_VALUES, EVENT_TYPE_VALUES } from '../lib/constants'
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
  const { t } = useI18n()
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
      <Field label={t('form.title_field')} htmlFor="title">
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('form.title_ph')} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('form.event_type')} htmlFor="event_type">
          <Select id="event_type" options={optionsFor(t, EVENT_TYPE_VALUES, 'enum.event_type')} value={eventType} onChange={(e) => setEventType(e.target.value as EventInput['event_type'])} />
        </Field>
        <Field label={t('form.event_status')} htmlFor="event_status">
          <Select id="event_status" options={optionsFor(t, EVENT_STATUS_VALUES, 'enum.event_status')} value={status} onChange={(e) => setStatus(e.target.value as EventInput['status'])} />
        </Field>
      </div>

      <Field label={t('form.linked_contact')} htmlFor="contact">
        <Select
          id="contact"
          options={contactOptions}
          placeholder={t('common.none')}
          value={contactId}
          disabled={lockContact}
          onChange={(e) => setContactId(e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
        {t('form.all_day_event')}
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('form.start')} htmlFor="start_at">
          <Input id="start_at" type="datetime-local" required value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </Field>
        {!allDay && (
          <Field label={t('form.end')} htmlFor="end_at">
            <Input id="end_at" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('form.location')} htmlFor="location">
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('form.location_ph')} />
        </Field>
        <Field label={t('form.reminder')} htmlFor="reminder">
          <Input id="reminder" type="number" min={0} value={reminder} onChange={(e) => setReminder(e.target.value)} placeholder={t('form.reminder_ph')} />
        </Field>
      </div>

      <Field label={t('form.description')} htmlFor="description">
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      {offerStatusBump && (
        <label className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={updateStatus} onChange={(e) => setUpdateStatus(e.target.checked)} />
          {t('form.bump_status')}
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? t('common.save_changes') : t('form.create_event')}
        </Button>
      </div>
    </form>
  )
}
