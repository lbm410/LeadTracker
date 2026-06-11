import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/** Parse an ISO string safely; returns null if invalid/empty. */
function parse(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = parseISO(value)
  return isValid(d) ? d : null
}

export function formatDate(value: string | null | undefined): string {
  const d = parse(value)
  return d ? format(d, 'd MMM yyyy') : '—'
}

export function formatDateTime(value: string | null | undefined): string {
  const d = parse(value)
  return d ? format(d, "d MMM yyyy · HH:mm") : '—'
}

export function formatTime(value: string | null | undefined): string {
  const d = parse(value)
  return d ? format(d, 'HH:mm') : '—'
}

export function fromNow(value: string | null | undefined): string {
  const d = parse(value)
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

/** Convert an ISO datetime to a value usable by <input type="datetime-local">. */
export function toLocalInput(value: string | null | undefined): string {
  const d = parse(value)
  if (!d) return ''
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

/** Convert a datetime-local input value to an ISO string (UTC). */
export function fromLocalInput(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  return isValid(d) ? d.toISOString() : null
}

/** Today's date as a yyyy-MM-dd string (local). */
export function todayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/** Number of whole days since an ISO datetime (or null). */
export function daysSince(value: string | null | undefined): number | null {
  const d = parse(value)
  if (!d) return null
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
}
