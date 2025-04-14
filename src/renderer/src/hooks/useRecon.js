import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reconApi } from '../api/reconApi'

export function useRecon() {
  const queryClient = useQueryClient()

  const {
    data: recon = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['recon'],
    // queryFn: () => reconApi.reconFormatSheet(), // fetches data from ipc main - triggers automatically
    // refetchInterval: 2000,
    staleTime: 1000,
    refetchOnWindowFocus: true,
    keepPreviousData: true
  })

  // Mutation for formatting sheet
  const { mutate: formatSheet, mutateAsync: formatSheetAsync } = useMutation({
    mutationFn: () => reconApi.reconFormatSheet(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recon'] })
      return data
    }
  })

  return {
    recon,
    isLoading,
    error,
    refetch,
    formatSheet,
    formatSheetAsync
  }
}
