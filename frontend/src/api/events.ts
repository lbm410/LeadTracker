import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { contactKeys } from './contacts'
import type { CalendarEvent, CalendarItem, EventInput } from '../types'

export const eventKeys = {
  all: ['events'] as const,
  calendar: (start: string, end: string) => ['calendar', start, end] as const,
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>, contactId?: string | null) {
  qc.invalidateQueries({ queryKey: eventKeys.all })
  qc.invalidateQueries({ queryKey: ['calendar'] })
  qc.invalidateQueries({ queryKey: ['dashboard'] })
  qc.invalidateQueries({ queryKey: ['agenda'] })
  if (contactId) {
    qc.invalidateQueries({ queryKey: contactKeys.events(contactId) })
    qc.invalidateQueries({ queryKey: contactKeys.detail(contactId) })
  }
  qc.invalidateQueries({ queryKey: contactKeys.all })
}

export function useCalendarItems(start: string, end: string) {
  return useQuery({
    queryKey: eventKeys.calendar(start, end),
    queryFn: async () =>
      (await api.get<CalendarItem[]>('/calendar/items', { params: { start, end } })).data,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: async () => (await api.get<CalendarEvent>(`/events/${id}`)).data,
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: EventInput) => (await api.post<CalendarEvent>('/events', payload)).data,
    onSuccess: (event) => invalidateAll(qc, event.contact_id),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<EventInput> }) =>
      (await api.patch<CalendarEvent>(`/events/${id}`, payload)).data,
    onSuccess: (event) => invalidateAll(qc, event.contact_id),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; contactId?: string | null }) => {
      await api.delete(`/events/${id}`)
    },
    onSuccess: (_data, vars) => invalidateAll(qc, vars.contactId),
  })
}
