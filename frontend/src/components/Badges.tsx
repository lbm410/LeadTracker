import { Badge } from './ui'
import {
  CHANNEL_META,
  DIRECTION_META,
  EVENT_STATUS_META,
  EVENT_TYPE_META,
  INTERACTION_TYPE_META,
  PRIORITY_META,
  SOURCE_META,
  STATUS_META,
} from '../lib/constants'
import type {
  ContactSource,
  ContactStatus,
  EventStatus,
  EventType,
  InteractionChannel,
  InteractionDirection,
  InteractionType,
  Priority,
} from '../types'

export function StatusBadge({ status }: { status: ContactStatus }) {
  const meta = STATUS_META[status]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority]
  const dot =
    priority === 'high' ? 'bg-rose-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
  return (
    <Badge className={meta.badge}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {meta.label}
    </Badge>
  )
}

export function SourceBadge({ source }: { source: ContactSource }) {
  const meta = SOURCE_META[source]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

export function ChannelBadge({ channel }: { channel: InteractionChannel }) {
  const meta = CHANNEL_META[channel]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

export function DirectionBadge({ direction }: { direction: InteractionDirection }) {
  const meta = DIRECTION_META[direction]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

export function InteractionTypeBadge({ type }: { type: InteractionType }) {
  const meta = INTERACTION_TYPE_META[type]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const meta = EVENT_TYPE_META[type]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const meta = EVENT_STATUS_META[status]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}
