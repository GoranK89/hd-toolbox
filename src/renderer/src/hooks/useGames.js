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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      return data
    }
  })

  const deleteFolder = useMutation({
    mutationFn: gamesApi.deleteGameCodes,
    onSuccess: ({ data }) => {
      queryClient.setQueryData(['folders'], data)
    }
  })

  const editGameInfo = useMutation({
    mutationFn: ({ id, editedValues }) => {
      return gamesApi.editGameInfo(id, editedValues)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['folders'], data)
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
    checkIconsInBrowser: gamesApi.checkIconsInBrowser,
    transferIcons: gamesApi.transferIcons,
    getImagePaths: gamesApi.getImagePaths
  }
}
