import { useState } from 'react'
import { optionsFor, useI18n } from '../i18n'
import { CHANNEL_VALUES, DIRECTION_VALUES, INTERACTION_TYPE_VALUES } from '../lib/constants'
import { fromLocalInput, toLocalInput } from '../lib/utils'
import type { InteractionInput } from '../types'
import { Button, Field, Input, Select, Textarea } from './ui'

interface Props {
  onSubmit: (payload: InteractionInput) => void
  onCancel: () => void
  loading?: boolean
}

export function InteractionForm({ onSubmit, onCancel, loading }: Props) {
  const { t } = useI18n()
  const [channel, setChannel] = useState<InteractionInput['channel']>('linkedin')
  const [direction, setDirection] = useState<InteractionInput['direction']>('outbound')
  const [interactionType, setInteractionType] = useState<InteractionInput['interaction_type']>('first_message')
  const [content, setContent] = useState('')
  const [outcome, setOutcome] = useState('')
  const [occurredAt, setOccurredAt] = useState(toLocalInput(new Date().toISOString()))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      channel,
      direction,
      interaction_type: interactionType,
      content: content || null,
      outcome: outcome || null,
      occurred_at: fromLocalInput(occurredAt) ?? new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={t('form.channel')} htmlFor="channel">
          <Select id="channel" options={optionsFor(t, CHANNEL_VALUES, 'enum.channel')} value={channel} onChange={(e) => setChannel(e.target.value as InteractionInput['channel'])} />
        </Field>
        <Field label={t('form.direction')} htmlFor="direction">
          <Select id="direction" options={optionsFor(t, DIRECTION_VALUES, 'enum.direction')} value={direction} onChange={(e) => setDirection(e.target.value as InteractionInput['direction'])} />
        </Field>
        <Field label={t('form.type')} htmlFor="type">
          <Select id="type" options={optionsFor(t, INTERACTION_TYPE_VALUES, 'enum.interaction_type')} value={interactionType} onChange={(e) => setInteractionType(e.target.value as InteractionInput['interaction_type'])} />
        </Field>
      </div>

      <Field label={t('form.when')} htmlFor="occurred_at">
        <Input id="occurred_at" type="datetime-local" required value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
      </Field>

      <Field label={t('form.content')} htmlFor="content">
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('form.content_ph')} />
      </Field>

      <Field label={t('form.outcome')} htmlFor="outcome">
        <Input id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder={t('form.outcome_ph')} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {t('form.submit_interaction')}
        </Button>
      </div>
    </form>
  )
}
