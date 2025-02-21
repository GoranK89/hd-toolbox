export const gamesApi = {
  readGameCodes: async () => {
    const gameCodes = await window.api.readGameCodes()
    return gameCodes
  },
  storeGameCodes: async (gameCodes) => {
    const result = await window.api.storeGameCodes(gameCodes)
    return result
  },
  deleteGameCodes: async (id) => {
    console.log('delete ' + id)
    return await window.api.deleteGameCodes(id)
  },
  editGameInfo: async (id, editedValues) => {
    return await window.api.editGameInfo(id, editedValues)
  }
}
