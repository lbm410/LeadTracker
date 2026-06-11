import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  Linkedin,
  Mail,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '../api/client'
import {
  useContact,
  useContactEvents,
  useContactInteractions,
  useDeleteContact,
  useUpdateContact,
} from '../api/contacts'
import { useCreateEvent, useDeleteEvent } from '../api/events'
import { useCreateInteraction, useDeleteInteraction } from '../api/interactions'
import {
  ChannelBadge,
  DirectionBadge,
  EventStatusBadge,
  EventTypeBadge,
  InteractionTypeBadge,
  PriorityBadge,
  SourceBadge,
  StatusBadge,
} from '../components/Badges'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ContactForm } from '../components/ContactForm'
import { EventForm } from '../components/EventForm'
import { InteractionForm } from '../components/InteractionForm'
import { Button, Card, EmptyState, ErrorState, LoadingState, Modal, Select } from '../components/ui'
import { STATUS_OPTIONS } from '../lib/constants'
import { formatDate, formatDateTime, fromNow, initials } from '../lib/utils'

export function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: contact, isLoading, isError, error } = useContact(id)
  const { data: interactions = [] } = useContactInteractions(id)
  const { data: events = [] } = useContactEvents(id)

  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const createInteraction = useCreateInteraction()
  const createEvent = useCreateEvent()
  const deleteEvent = useDeleteEvent()
  const deleteInteraction = useDeleteInteraction()

  const [editOpen, setEditOpen] = useState(false)
  const [interactionOpen, setInteractionOpen] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return <LoadingState />
  if (isError || !contact)
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorState message={errorMessage(error, 'Contact not found')} />
      </div>
    )

  const now = Date.now()
  const upcomingEvents = events.filter((e) => new Date(e.start_at).getTime() >= now)
  const pastEvents = events.filter((e) => new Date(e.start_at).getTime() < now)

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Header card */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-700">
              {initials(contact.full_name)}
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{contact.full_name}</h1>
              <p className="text-sm text-slate-500">
                {[contact.role, contact.company].filter(Boolean).join(' · ') || 'No company'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={contact.status} />
                <PriorityBadge priority={contact.priority} />
                <SourceBadge source={contact.source} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setInteractionOpen(true)}>
              <MessageSquarePlus className="h-4 w-4" /> Log interaction
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEventOpen(true)}>
              <CalendarPlus className="h-4 w-4" /> Schedule
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        </div>

        {/* Quick status changer */}
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-500">Move to stage:</span>
          <Select
            className="w-52"
            options={STATUS_OPTIONS}
            value={contact.status}
            onChange={(e) =>
              updateContact.mutate(
                { id: contact.id, payload: { status: e.target.value as never } },
                {
                  onSuccess: () => toast.success('Status updated'),
                  onError: (err) => toast.error(errorMessage(err)),
                },
              )
            }
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Details</h2>
            <dl className="space-y-3 text-sm">
              <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-brand-600 hover:underline">{contact.email}</a>
                ) : '—'}
              </DetailRow>
              <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
                {contact.phone ?? '—'}
              </DetailRow>
              <DetailRow icon={<Linkedin className="h-4 w-4" />} label="LinkedIn">
                {contact.linkedin_url ? (
                  <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    Profile
                  </a>
                ) : '—'}
              </DetailRow>
              <DetailRow icon={<CalendarClock className="h-4 w-4" />} label="Last contacted">
                {fromNow(contact.last_contacted_at)}
              </DetailRow>
            </dl>

            {contact.tags.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-medium text-slate-500">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((t) => (
                    <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {(contact.next_action || contact.next_action_date) && (
            <Card className="border-amber-200 bg-amber-50/60 p-5">
              <h2 className="mb-1 text-sm font-semibold text-amber-800">Next action</h2>
              <p className="text-sm text-amber-900">{contact.next_action ?? '—'}</p>
              {contact.next_action_date && (
                <p className="mt-1 text-xs font-medium text-amber-700">Due {formatDate(contact.next_action_date)}</p>
              )}
            </Card>
          )}

          {contact.notes && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Notes</h2>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{contact.notes}</p>
            </Card>
          )}
        </div>

        {/* Right: events + interactions */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming events</h2>
              <Button size="sm" variant="secondary" onClick={() => setEventOpen(true)}>
                <CalendarPlus className="h-4 w-4" /> Schedule
              </Button>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No upcoming events.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <EventTypeBadge type={ev.event_type} />
                        <EventStatusBadge status={ev.status} />
                      </div>
                      <p className="mt-1 font-medium text-slate-800">{ev.title}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(ev.start_at)}</p>
                      {ev.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" /> {ev.location}
                        </p>
                      )}
                    </div>
                    <button
                      className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                      onClick={() =>
                        deleteEvent.mutate(
                          { id: ev.id, contactId: contact.id },
                          { onSuccess: () => toast.success('Event removed') },
                        )
                      }
                      aria-label="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Interaction history</h2>
              <Button size="sm" onClick={() => setInteractionOpen(true)}>
                <MessageSquarePlus className="h-4 w-4" /> Log
              </Button>
            </div>
            {interactions.length === 0 ? (
              <EmptyState
                icon={<MessageSquarePlus className="h-7 w-7" />}
                title="No interactions yet"
                description="Log your first touch to start building the history."
              />
            ) : (
              <ol className="relative space-y-5 border-l border-slate-200 pl-5">
                {interactions.map((it) => (
                  <li key={it.id} className="relative">
                    <span className="absolute -left-[1.65rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-brand-500" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <ChannelBadge channel={it.channel} />
                          <DirectionBadge direction={it.direction} />
                          <InteractionTypeBadge type={it.interaction_type} />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{formatDateTime(it.occurred_at)}</p>
                        {it.content && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{it.content}</p>}
                        {it.outcome && (
                          <p className="mt-1 text-sm text-slate-500">
                            <span className="font-medium text-slate-600">Outcome:</span> {it.outcome}
                          </p>
                        )}
                      </div>
                      <button
                        className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                        onClick={() =>
                          deleteInteraction.mutate(
                            { id: it.id, contactId: contact.id },
                            { onSuccess: () => toast.success('Interaction removed') },
                          )
                        }
                        aria-label="Delete interaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {pastEvents.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Past events</h2>
              <ul className="space-y-2">
                {pastEvents.map((ev) => (
                  <li key={ev.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <EventTypeBadge type={ev.event_type} />
                      <span className="text-slate-700">{ev.title}</span>
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(ev.start_at)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit contact" size="lg">
        <ContactForm
          initial={contact}
          loading={updateContact.isPending}
          onCancel={() => setEditOpen(false)}
          onSubmit={(payload) =>
            updateContact.mutate(
              { id: contact.id, payload },
              {
                onSuccess: () => {
                  toast.success('Contact updated')
                  setEditOpen(false)
                },
                onError: (err) => toast.error(errorMessage(err)),
              },
            )
          }
        />
      </Modal>

      <Modal open={interactionOpen} onClose={() => setInteractionOpen(false)} title="Log interaction">
        <InteractionForm
          loading={createInteraction.isPending}
          onCancel={() => setInteractionOpen(false)}
          onSubmit={(payload) =>
            createInteraction.mutate(
              { contactId: contact.id, payload },
              {
                onSuccess: () => {
                  toast.success('Interaction logged')
                  setInteractionOpen(false)
                },
                onError: (err) => toast.error(errorMessage(err)),
              },
            )
          }
        />
      </Modal>

      <Modal open={eventOpen} onClose={() => setEventOpen(false)} title="Schedule event" size="lg">
        <EventForm
          defaultContactId={contact.id}
          lockContact
          loading={createEvent.isPending}
          onCancel={() => setEventOpen(false)}
          onSubmit={(payload) =>
            createEvent.mutate(payload, {
              onSuccess: () => {
                toast.success('Event scheduled')
                setEventOpen(false)
              },
              onError: (err) => toast.error(errorMessage(err)),
            })
          }
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete contact"
        message={`This permanently deletes ${contact.full_name} along with all their interactions and events.`}
        loading={deleteContact.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteContact.mutate(contact.id, {
            onSuccess: () => {
              toast.success('Contact deleted')
              navigate('/contacts')
            },
            onError: (err) => toast.error(errorMessage(err)),
          })
        }
      />
    </div>
  )
}

function BackLink() {
  return (
    <Link to="/contacts" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
      <ArrowLeft className="h-4 w-4" /> Back to contacts
    </Link>
  )
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 truncate text-slate-700">{children}</span>
    </div>
  )
}
