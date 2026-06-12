import { useI18n } from '../i18n'
import {
  CHANNEL_STYLES,
  DIRECTION_STYLES,
  EVENT_STATUS_STYLES,
  EVENT_TYPE_STYLES,
  INTERACTION_TYPE_STYLES,
  PRIORITY_STYLES,
  SOURCE_STYLES,
  STATUS_STYLES,
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
import { Badge } from './ui'

export function StatusBadge({ status }: { status: ContactStatus }) {
  const { t } = useI18n()
  return <Badge className={STATUS_STYLES[status]}>{t(`enum.status.${status}`)}</Badge>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useI18n()
  const dot =
    priority === 'high' ? 'bg-rose-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
  return (
    <Badge className={PRIORITY_STYLES[priority]}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {t(`enum.priority.${priority}`)}
    </Badge>
  )
}

export function SourceBadge({ source }: { source: ContactSource }) {
  const { t } = useI18n()
  return <Badge className={SOURCE_STYLES[source]}>{t(`enum.source.${source}`)}</Badge>
}

export function ChannelBadge({ channel }: { channel: InteractionChannel }) {
  const { t } = useI18n()
  return <Badge className={CHANNEL_STYLES[channel]}>{t(`enum.channel.${channel}`)}</Badge>
}

export function DirectionBadge({ direction }: { direction: InteractionDirection }) {
  const { t } = useI18n()
  return <Badge className={DIRECTION_STYLES[direction]}>{t(`enum.direction.${direction}`)}</Badge>
}

export function InteractionTypeBadge({ type }: { type: InteractionType }) {
  const { t } = useI18n()
  return <Badge className={INTERACTION_TYPE_STYLES[type]}>{t(`enum.interaction_type.${type}`)}</Badge>
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const { t } = useI18n()
  return <Badge className={EVENT_TYPE_STYLES[type]}>{t(`enum.event_type.${type}`)}</Badge>
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { t } = useI18n()
  return <Badge className={EVENT_STATUS_STYLES[status]}>{t(`enum.event_status.${status}`)}</Badge>
}
