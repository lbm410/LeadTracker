import { Plus, Search, Users } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useContacts, useCreateContact } from '../api/contacts'
import { PriorityBadge, SourceBadge, StatusBadge } from '../components/Badges'
import { ContactForm } from '../components/ContactForm'
import { PageHeader } from '../components/PageHeader'
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, Select } from '../components/ui'
import {
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
} from '../lib/constants'
import { fromNow, initials } from '../lib/utils'
import type { ContactFilters } from '../types'

const SORT_OPTIONS = [
  { value: '-updated_at', label: 'Recently updated' },
  { value: 'full_name', label: 'Name (A–Z)' },
  { value: '-full_name', label: 'Name (Z–A)' },
  { value: '-created_at', label: 'Newest first' },
  { value: '-last_contacted_at', label: 'Last contacted' },
]

export function Contacts() {
  const [filters, setFilters] = useState<ContactFilters>({ sort: '-updated_at' })
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: contacts, isLoading, isError, error } = useContacts(filters)
  const createContact = useCreateContact()

  function applySearch(e: React.FormEvent) {
    e.preventDefault()
    setFilters((f) => ({ ...f, q: search || undefined }))
  }

  function update<K extends keyof ContactFilters>(key: K, value: string) {
    setFilters((f) => ({ ...f, [key]: value || undefined }))
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="All your leads in one searchable list."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New contact
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form onSubmit={applySearch} className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search name, company, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Select options={STATUS_OPTIONS} placeholder="All statuses" value={filters.status ?? ''} onChange={(e) => update('status', e.target.value)} />
            <Select options={SOURCE_OPTIONS} placeholder="All sources" value={filters.source ?? ''} onChange={(e) => update('source', e.target.value)} />
            <Select options={PRIORITY_OPTIONS} placeholder="All priorities" value={filters.priority ?? ''} onChange={(e) => update('priority', e.target.value)} />
            <Select options={SORT_OPTIONS} value={filters.sort ?? '-updated_at'} onChange={(e) => update('sort', e.target.value)} />
          </div>
        </div>
      </Card>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message={errorMessage(error, 'Could not load contacts')} />}

      {contacts && contacts.length === 0 && (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No contacts found"
          description="Adjust your filters, or add your first lead to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New contact
            </Button>
          }
        />
      )}

      {contacts && contacts.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Last contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <tr key={c.id} className="group hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/contacts/${c.id}`} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {initials(c.full_name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-slate-800 group-hover:text-brand-700">{c.full_name}</span>
                          <span className="block truncate text-xs text-slate-500">
                            {[c.role, c.company].filter(Boolean).join(' · ') || '—'}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3"><SourceBadge source={c.source} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t}</span>
                        ))}
                        {c.tags.length > 3 && <span className="text-xs text-slate-400">+{c.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fromNow(c.last_contacted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
