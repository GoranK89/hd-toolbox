import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamesApi } from '../api/gamesApi'

export function useGames() {
  const queryClient = useQueryClient()

  const {
    data: folders = [],
    isLoading,
    error,
    refetch: readFolders
  } = useQuery({
    queryKey: ['folders'],
    queryFn: gamesApi.readGameCodes,
    staleTime: 1000,
    refetchOnWindowFocus: true
  })

  const storeGameCodes = useMutation({
    mutationFn: gamesApi.storeGameCodes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    }
  })

  const deleteFolder = useMutation({
    mutationFn: async (id) => {
      const result = await window.api.deleteGameCodes(id)
      return result.data
    },
    onSuccess: (data) => {
      // Update state with new data
      queryClient.setQueryData(['folders'], data)
    },
    onError: (error) => {
      console.error('Delete failed:', error)
      // show an error here
    }
  })

  const editGameInfo = useMutation({
    mutationFn: ({ id, editedValues }) => gamesApi.editGameInfo(id, editedValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    }
  })

  return {
    folders,
    isLoading,
    error,
    readFolders,
    storeGameCodes: storeGameCodes.mutate,
    deleteFolder: deleteFolder.mutate,
    editGameInfo: (id, editedValues) => editGameInfo.mutate({ id, editedValues }),
    checkIconsInBrowser: window.api.openIconUrls,
    transferIcons: window.api.transferIcons,
    getImagePaths: window.api.getImagePaths
  }
}
