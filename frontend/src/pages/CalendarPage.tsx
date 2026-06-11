import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { DatesSetArg, EventClickArg, EventInput as FcEventInput } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { addDays, subDays } from 'date-fns'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useCalendarItems, useCreateEvent, useDeleteEvent, useEvent, useUpdateEvent } from '../api/events'
import { EventForm } from '../components/EventForm'
import { PageHeader } from '../components/PageHeader'
import { Button, Card, LoadingState, Modal } from '../components/ui'
import { EVENT_TYPE_META } from '../lib/constants'
import type { CalendarItem } from '../types'

export function CalendarPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [range, setRange] = useState({
    start: subDays(now, 35).toISOString(),
    end: addDays(now, 35).toISOString(),
  })
  const { data: items = [], isLoading } = useCalendarItems(range.start, range.end)

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [createOpen, setCreateOpen] = useState(false)
  const [createStart, setCreateStart] = useState<string | undefined>(undefined)
  const [editId, setEditId] = useState<string | null>(null)

  const fcEvents = useMemo<FcEventInput[]>(
    () =>
      items.map((item) => {
        const color = EVENT_TYPE_META[item.event_type].color ?? '#4f46e5'
        const cancelled = item.status === 'cancelled'
        return {
          id: item.id,
          title: item.title,
          start: item.start,
          end: item.end ?? undefined,
          allDay: item.all_day,
          backgroundColor: cancelled ? '#cbd5e1' : color,
          borderColor: cancelled ? '#cbd5e1' : color,
          editable: item.kind === 'event',
          extendedProps: { item },
        }
      }),
    [items],
  )

  function handleDatesSet(arg: DatesSetArg) {
    setRange({ start: arg.start.toISOString(), end: arg.end.toISOString() })
  }

  function handleDateClick(arg: DateClickArg) {
    setCreateStart(arg.date.toISOString())
    setCreateOpen(true)
  }

  function handleEventClick(arg: EventClickArg) {
    const item = arg.event.extendedProps.item as CalendarItem
    if (item.kind === 'next_action') {
      if (item.contact_id) navigate(`/contacts/${item.contact_id}`)
      return
    }
    setEditId(item.id)
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Meetings, calls and reminders — plus implicit next-action due dates."
        actions={
          <Button
            onClick={() => {
              setCreateStart(undefined)
              setCreateOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> New event
          </Button>
        }
      />

      <Card className="p-3 sm:p-4">
        {isLoading && items.length === 0 && <LoadingState />}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="auto"
          firstDay={1}
          nowIndicator
          dayMaxEvents={3}
          events={fcEvents}
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </Card>

      <Legend />

      {/* Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New event" size="lg">
        <EventForm
          defaultStart={createStart}
          loading={createEvent.isPending}
          onCancel={() => setCreateOpen(false)}
          onSubmit={(payload) =>
            createEvent.mutate(payload, {
              onSuccess: () => {
                toast.success('Event created')
                setCreateOpen(false)
              },
              onError: (err) => toast.error(errorMessage(err)),
            })
          }
        />
      </Modal>

      {/* Edit */}
      {editId && (
        <EditEventModal
          eventId={editId}
          onClose={() => setEditId(null)}
          onSave={(payload) =>
            updateEvent.mutate(
              { id: editId, payload },
              {
                onSuccess: () => {
                  toast.success('Event updated')
                  setEditId(null)
                },
                onError: (err) => toast.error(errorMessage(err)),
              },
            )
          }
          saving={updateEvent.isPending}
          onDelete={(contactId) =>
            deleteEvent.mutate(
              { id: editId, contactId },
              {
                onSuccess: () => {
                  toast.success('Event deleted')
                  setEditId(null)
                },
                onError: (err) => toast.error(errorMessage(err)),
              },
            )
          }
          deleting={deleteEvent.isPending}
        />
      )}
    </div>
  )
}

function EditEventModal({
  eventId,
  onClose,
  onSave,
  saving,
  onDelete,
  deleting,
}: {
  eventId: string
  onClose: () => void
  onSave: (payload: import('../types').EventInput) => void
  saving: boolean
  onDelete: (contactId: string | null) => void
  deleting: boolean
}) {
  const { data: event, isLoading } = useEvent(eventId)

  return (
    <Modal open onClose={onClose} title="Event details" size="lg">
      {isLoading || !event ? (
        <LoadingState />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {event.contact ? (
              <Link to={`/contacts/${event.contact.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                <ExternalLink className="h-4 w-4" /> {event.contact.full_name}
              </Link>
            ) : (
              <span className="text-sm text-slate-400">No linked contact</span>
            )}
            <Button size="sm" variant="ghost" loading={deleting} onClick={() => onDelete(event.contact_id)}>
              <Trash2 className="h-4 w-4 text-rose-500" /> Delete
            </Button>
          </div>
          <EventForm initial={event} loading={saving} onCancel={onClose} onSubmit={onSave} />
        </div>
      )}
    </Modal>
  )
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
      {Object.entries(EVENT_TYPE_META).map(([key, meta]) => (
        <span key={key} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
          {meta.label}
        </span>
      ))}
    </div>
  )
}
