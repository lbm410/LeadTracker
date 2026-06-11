import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { AgendaResponse, DashboardStats } from '../types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
  })
}

export function useAgenda(day?: string) {
  return useQuery({
    queryKey: ['agenda', day ?? 'today'],
    queryFn: async () =>
      (await api.get<AgendaResponse>('/agenda/today', { params: day ? { day } : {} })).data,
  })
}
