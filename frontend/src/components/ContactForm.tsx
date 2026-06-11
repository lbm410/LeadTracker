import { useState } from 'react'
import { Button, Field, Input, Select, Textarea } from './ui'
import { PRIORITY_OPTIONS, SOURCE_OPTIONS, STATUS_OPTIONS } from '../lib/constants'
import type { Contact, ContactInput } from '../types'

interface Props {
  initial?: Contact
  onSubmit: (payload: ContactInput) => void
  onCancel: () => void
  loading?: boolean
}

export function ContactForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<ContactInput>({
    full_name: initial?.full_name ?? '',
    company: initial?.company ?? '',
    role: initial?.role ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    linkedin_url: initial?.linkedin_url ?? '',
    source: initial?.source ?? 'linkedin',
    status: initial?.status ?? 'new',
    priority: initial?.priority ?? 'medium',
    tags: initial?.tags ?? [],
    notes: initial?.notes ?? '',
    next_action: initial?.next_action ?? '',
    next_action_date: initial?.next_action_date ?? '',
  })
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '))

  function set<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSubmit({
      ...form,
      tags,
      next_action_date: form.next_action_date || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name *" htmlFor="full_name">
        <Input
          id="full_name"
          required
          value={form.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder="Jane Doe"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company" htmlFor="company">
          <Input id="company" value={form.company ?? ''} onChange={(e) => set('company', e.target.value)} />
        </Field>
        <Field label="Role" htmlFor="role">
          <Input id="role" value={form.role ?? ''} onChange={(e) => set('role', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        </Field>
      </div>

      <Field label="LinkedIn URL" htmlFor="linkedin_url">
        <Input
          id="linkedin_url"
          value={form.linkedin_url ?? ''}
          onChange={(e) => set('linkedin_url', e.target.value)}
          placeholder="https://www.linkedin.com/in/…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Source" htmlFor="source">
          <Select id="source" options={SOURCE_OPTIONS} value={form.source} onChange={(e) => set('source', e.target.value as ContactInput['source'])} />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => set('status', e.target.value as ContactInput['status'])} />
        </Field>
        <Field label="Priority" htmlFor="priority">
          <Select id="priority" options={PRIORITY_OPTIONS} value={form.priority} onChange={(e) => set('priority', e.target.value as ContactInput['priority'])} />
        </Field>
      </div>

      <Field label="Tags (comma separated)" htmlFor="tags">
        <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="saas, warm, decision-maker" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Next action" htmlFor="next_action">
          <Input id="next_action" value={form.next_action ?? ''} onChange={(e) => set('next_action', e.target.value)} placeholder="Send proposal" />
        </Field>
        <Field label="Next action date" htmlFor="next_action_date">
          <Input id="next_action_date" type="date" value={form.next_action_date ?? ''} onChange={(e) => set('next_action_date', e.target.value)} />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Save changes' : 'Create contact'}
        </Button>
      </div>
    </form>
  )
}
