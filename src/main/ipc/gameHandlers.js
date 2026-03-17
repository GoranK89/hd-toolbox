import fs from 'fs'
import { ipcMain } from 'electron'
import { readJSONFile, writeJSONFile } from '../utils/generalPurposeFunctions'
import { JSON_PATH } from '../utils/pathUtils'
import { handleGameCodes, deleteGameCodes } from '../services/gameCodeService'
import { editGameIniFile } from '../services/fileService'
import { createFolderLinks } from '../services/iconService'

export function setupGameHandlers() {
  ipcMain.handle('storeGameCodes', async (event, newGameCodes) => {
    try {
      const result = await handleGameCodes(newGameCodes)
      await createFolderLinks()

      return {
        success: true,
        errors: result.errors
      }
    } catch (err) {
      console.log(err.message)
      return {
        success: false,
        error: err.message
      }
    }
  })

  ipcMain.handle('readGameCodes', async (event) => {
    try {
      if (!fs.existsSync(JSON_PATH)) {
        return []
      }
      const json = await readJSONFile(JSON_PATH)
      return json
    } catch (err) {
      console.log(err.message)
      return {
        success: false,
        error: err.message
      }
    }
  })

  ipcMain.handle('deleteGameCodes', async (event, gameCodesToDelete) => {
    try {
      const result = await deleteGameCodes(gameCodesToDelete)
      // read the game codes from JSON and create a new TXT
      await createFolderLinks()
      return result
    } catch (err) {
      console.log(err.message)
      return {
        success: false,
        error: err.message
      }
    }
  })

  // after the change identical game codes get added to similar games
  ipcMain.handle('editGameInfo', async (event, id, editedValues) => {
    try {
      let gameCodes = await readJSONFile(JSON_PATH)
      let gameCodeIndex = gameCodes.findIndex((gameCode) => gameCode.id === id)
      gameCodes[gameCodeIndex] = { ...gameCodes[gameCodeIndex], ...editedValues }
      editGameIniFile(
        gameCodes[gameCodeIndex].id,
        gameCodes[gameCodeIndex].type,
        gameCodes[gameCodeIndex].name
      )
      await writeJSONFile(JSON_PATH, gameCodes)

      const freshJsonData = await readJSONFile(JSON_PATH)
      return freshJsonData
    } catch (err) {
      return {
        success: false,
        error: err.message
      }
    }
  })
}
