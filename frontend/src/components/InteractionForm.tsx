import { useState } from 'react'
import { Button, Field, Input, Select, Textarea } from './ui'
import {
  CHANNEL_OPTIONS,
  DIRECTION_OPTIONS,
  INTERACTION_TYPE_OPTIONS,
} from '../lib/constants'
import { fromLocalInput, toLocalInput } from '../lib/utils'
import type { InteractionInput } from '../types'

interface Props {
  onSubmit: (payload: InteractionInput) => void
  onCancel: () => void
  loading?: boolean
}

export function InteractionForm({ onSubmit, onCancel, loading }: Props) {
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
        <Field label="Channel" htmlFor="channel">
          <Select id="channel" options={CHANNEL_OPTIONS} value={channel} onChange={(e) => setChannel(e.target.value as InteractionInput['channel'])} />
        </Field>
        <Field label="Direction" htmlFor="direction">
          <Select id="direction" options={DIRECTION_OPTIONS} value={direction} onChange={(e) => setDirection(e.target.value as InteractionInput['direction'])} />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" options={INTERACTION_TYPE_OPTIONS} value={interactionType} onChange={(e) => setInteractionType(e.target.value as InteractionInput['interaction_type'])} />
        </Field>
      </div>

      <Field label="When *" htmlFor="occurred_at">
        <Input id="occurred_at" type="datetime-local" required value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
      </Field>

      <Field label="Content / summary" htmlFor="content">
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="What was said or sent…" />
      </Field>

      <Field label="Outcome" htmlFor="outcome">
        <Input id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Replied, booked a call…" />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Log interaction
        </Button>
      </div>
    </form>
  )
}
