export const gamesApi = {
  readGameCodes: async () => {
    const gameCodes = await window.api.readGameCodes()
    const withIcons = await window.api.refreshIconStatus()

    // Merge the results
    if (withIcons) {
      return gameCodes.map((code) => ({
        ...code,
        iconsExist: withIcons.find((i) => i.id === code.id)?.iconsExist ?? code.iconsExist
      }))
    }

    return gameCodes
  },
  storeGameCodes: async (gameCodes) => {
    const res = await window.api.storeGameCodes(gameCodes)
    return res
  },
  deleteGameCodes: async (id) => {
    const res = await window.api.deleteGameCodes(id)
    return res
  },
  editGameInfo: async (id, editedValues) => {
    return await window.api.editGameInfo(id, editedValues)
  },
  checkIconsInBrowser: async () => {
    return await window.api.openIconUrls()
  },
  transferIcons: async () => {
    return await window.api.transferIcons()
  },
  getImagePaths: async () => {
    return await window.api.getImagePaths()
  }
}
