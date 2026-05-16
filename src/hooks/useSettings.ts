import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../services/api'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
    staleTime: 10 * 60_000,
  })
}
