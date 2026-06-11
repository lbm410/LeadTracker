import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type {
  CalendarEvent,
  Contact,
  ContactFilters,
  ContactInput,
  Interaction,
} from '../types'

export const contactKeys = {
  all: ['contacts'] as const,
  list: (filters: ContactFilters) => ['contacts', 'list', filters] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
  interactions: (id: string) => ['contacts', id, 'interactions'] as const,
  events: (id: string) => ['contacts', id, 'events'] as const,
  cold: (days?: number) => ['contacts', 'cold', days ?? null] as const,
}

async function fetchContacts(filters: ContactFilters): Promise<Contact[]> {
  const params: Record<string, string> = {}
  if (filters.status) params.status = filters.status
  if (filters.source) params.source = filters.source
  if (filters.priority) params.priority = filters.priority
  if (filters.tag) params.tag = filters.tag
  if (filters.q) params.q = filters.q
  if (filters.sort) params.sort = filters.sort
  const { data } = await api.get<Contact[]>('/contacts', { params })
  return data
}

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({ queryKey: contactKeys.list(filters), queryFn: () => fetchContacts(filters) })
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: contactKeys.detail(id ?? ''),
    queryFn: async () => (await api.get<Contact>(`/contacts/${id}`)).data,
    enabled: !!id,
  })
}

export function useContactInteractions(id: string | undefined) {
  return useQuery({
    queryKey: contactKeys.interactions(id ?? ''),
    queryFn: async () => (await api.get<Interaction[]>(`/contacts/${id}/interactions`)).data,
    enabled: !!id,
  })
}

export function useContactEvents(id: string | undefined) {
  return useQuery({
    queryKey: contactKeys.events(id ?? ''),
    queryFn: async () => (await api.get<CalendarEvent[]>(`/contacts/${id}/events`)).data,
    enabled: !!id,
  })
}

export function useColdLeads(days?: number) {
  return useQuery({
    queryKey: contactKeys.cold(days),
    queryFn: async () =>
      (await api.get<Contact[]>('/contacts/cold', { params: days ? { days } : {} })).data,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ContactInput) =>
      (await api.post<Contact>('/contacts', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ContactInput> }) =>
      (await api.patch<Contact>(`/contacts/${id}`, payload)).data,
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: contactKeys.all })
      qc.invalidateQueries({ queryKey: contactKeys.detail(contact.id) })
    },
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contacts/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contactKeys.all }),
  })
}
