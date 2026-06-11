import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useContacts, useCreateContact, useUpdateContact } from '../api/contacts'
import { PriorityBadge, SourceBadge } from '../components/Badges'
import { ContactForm } from '../components/ContactForm'
import { PageHeader } from '../components/PageHeader'
import { Button, ErrorState, LoadingState, Modal } from '../components/ui'
import { PIPELINE_STATUSES, STATUS_META } from '../lib/constants'
import { initials } from '../lib/utils'
import type { Contact, ContactStatus } from '../types'

export function Pipeline() {
  const { data: contacts, isLoading, isError, error } = useContacts({ sort: '-updated_at' })
  const updateContact = useUpdateContact()
  const createContact = useCreateContact()
  const navigate = useNavigate()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const grouped = useMemo(() => {
    const map: Record<ContactStatus, Contact[]> = Object.fromEntries(
      PIPELINE_STATUSES.map((s) => [s, []]),
    ) as Record<ContactStatus, Contact[]>
    for (const c of contacts ?? []) map[c.status]?.push(c)
    return map
  }, [contacts])

  const activeContact = contacts?.find((c) => c.id === activeId) ?? null

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const contact = contacts?.find((c) => c.id === String(active.id))
    const target = String(over.id) as ContactStatus
    if (!contact || contact.status === target) return

    updateContact.mutate(
      { id: contact.id, payload: { status: target } },
      {
        onSuccess: () => toast.success(`Moved to “${STATUS_META[target].label}”`),
        onError: (err) => toast.error(errorMessage(err)),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="Pipeline"
        subtitle="Drag leads between stages to update their status."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New contact
          </Button>
        }
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={errorMessage(error, 'Could not load pipeline')} />}

      {contacts && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                contacts={grouped[status]}
                onCardClick={(id) => navigate(`/contacts/${id}`)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeContact ? <CardBody contact={activeContact} dragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New contact" size="lg">
        <ContactForm
          loading={createContact.isPending}
          onCancel={() => setCreateOpen(false)}
          onSubmit={(payload) =>
            createContact.mutate(payload, {
              onSuccess: () => {
                toast.success('Contact created')
                setCreateOpen(false)
              },
              onError: (err) => toast.error(errorMessage(err)),
            })
          }
        />
      </Modal>
    </div>
  )
}

function Column({
  status,
  contacts,
  onCardClick,
}: {
  status: ContactStatus
  contacts: Contact[]
  onCardClick: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ring-1 ring-inset ${meta.badge}`}>
            {contacts.length}
          </span>
          {meta.label}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl border-2 border-dashed p-2 transition-colors ${
          isOver ? 'border-brand-400 bg-brand-50/60' : 'border-slate-200 bg-slate-100/40'
        }`}
      >
        {contacts.map((c) => (
          <DraggableCard key={c.id} contact={c} onClick={() => onCardClick(c.id)} />
        ))}
        {contacts.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-slate-400">Drop here</p>
        )}
      </div>
    </div>
  )
}

function DraggableCard({ contact, onClick }: { contact: Contact; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: contact.id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={isDragging ? 'opacity-30' : ''}
      style={{ touchAction: 'none' }}
    >
      <CardBody contact={contact} />
    </div>
  )
}

function CardBody({ contact, dragging }: { contact: Contact; dragging?: boolean }) {
  return (
    <div
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing ${
        dragging ? 'rotate-1 shadow-lg ring-2 ring-brand-300' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {initials(contact.full_name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">{contact.full_name}</p>
          {contact.company && <p className="truncate text-xs text-slate-500">{contact.company}</p>}
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={contact.priority} />
        <SourceBadge source={contact.source} />
      </div>
    </div>
  )
}
