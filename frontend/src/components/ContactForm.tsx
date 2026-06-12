import { useState } from 'react'
import { optionsFor, useI18n } from '../i18n'
import { PRIORITY_VALUES, SOURCE_VALUES, STATUS_VALUES } from '../lib/constants'
import type { Contact, ContactInput } from '../types'
import { Button, Field, Input, Select, Textarea } from './ui'

interface Props {
  initial?: Contact
  onSubmit: (payload: ContactInput) => void
  onCancel: () => void
  loading?: boolean
}

export function ContactForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useI18n()
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
    onSubmit({ ...form, tags, next_action_date: form.next_action_date || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={t('form.full_name')} htmlFor="full_name">
        <Input
          id="full_name"
          required
          value={form.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder={t('form.full_name_ph')}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('form.company')} htmlFor="company">
          <Input id="company" value={form.company ?? ''} onChange={(e) => set('company', e.target.value)} />
        </Field>
        <Field label={t('form.role')} htmlFor="role">
          <Input id="role" value={form.role ?? ''} onChange={(e) => set('role', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('form.email')} htmlFor="email">
          <Input id="email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label={t('form.phone')} htmlFor="phone">
          <Input id="phone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        </Field>
      </div>

      <Field label={t('form.linkedin_url')} htmlFor="linkedin_url">
        <Input
          id="linkedin_url"
          value={form.linkedin_url ?? ''}
          onChange={(e) => set('linkedin_url', e.target.value)}
          placeholder={t('form.linkedin_ph')}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={t('form.source')} htmlFor="source">
          <Select id="source" options={optionsFor(t, SOURCE_VALUES, 'enum.source')} value={form.source} onChange={(e) => set('source', e.target.value as ContactInput['source'])} />
        </Field>
        <Field label={t('form.status')} htmlFor="status">
          <Select id="status" options={optionsFor(t, STATUS_VALUES, 'enum.status')} value={form.status} onChange={(e) => set('status', e.target.value as ContactInput['status'])} />
        </Field>
        <Field label={t('form.priority')} htmlFor="priority">
          <Select id="priority" options={optionsFor(t, PRIORITY_VALUES, 'enum.priority')} value={form.priority} onChange={(e) => set('priority', e.target.value as ContactInput['priority'])} />
        </Field>
      </div>

      <Field label={t('form.tags')} htmlFor="tags">
        <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder={t('form.tags_ph')} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('form.next_action')} htmlFor="next_action">
          <Input id="next_action" value={form.next_action ?? ''} onChange={(e) => set('next_action', e.target.value)} placeholder={t('form.next_action_ph')} />
        </Field>
        <Field label={t('form.next_action_date')} htmlFor="next_action_date">
          <Input id="next_action_date" type="date" value={form.next_action_date ?? ''} onChange={(e) => set('next_action_date', e.target.value)} />
        </Field>
      </div>

      <Field label={t('form.notes')} htmlFor="notes">
        <Textarea id="notes" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? t('common.save_changes') : t('common.create_contact')}
        </Button>
      </div>
    </form>
  )
}
