import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { contactKeys } from './contacts'
import type { Interaction, InteractionInput } from '../types'

export function useCreateInteraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contactId, payload }: { contactId: string; payload: InteractionInput }) =>
      (await api.post<Interaction>(`/contacts/${contactId}/interactions`, payload)).data,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: contactKeys.interactions(vars.contactId) })
      qc.invalidateQueries({ queryKey: contactKeys.detail(vars.contactId) })
      qc.invalidateQueries({ queryKey: contactKeys.all })
    },
  })
}

export function useUpdateInteraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      contactId: string
      payload: Partial<InteractionInput>
    }) => (await api.patch<Interaction>(`/interactions/${id}`, payload)).data,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: contactKeys.interactions(vars.contactId) })
      qc.invalidateQueries({ queryKey: contactKeys.detail(vars.contactId) })
    },
  })
}

export function useDeleteInteraction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; contactId: string }) => {
      await api.delete(`/interactions/${id}`)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: contactKeys.interactions(vars.contactId) })
      qc.invalidateQueries({ queryKey: contactKeys.detail(vars.contactId) })
    },
  })
}
