import { ipcMain } from 'electron'
import { JSON_PATH } from '../utils/pathUtils.js'
import { readJSONFile, writeJSONFile } from '../utils/generalPurposeFunctions.js'

import {
  transferIcons,
  getImagePaths,
  checkGameIcons,
  checkIconsInBrowser
} from '../services/iconService.js'

export function setupIconHandlers() {
  ipcMain.on('transferIcons', async () => {
    try {
      await transferIcons()
    } catch (error) {
      console.error(`Failed to transfer icons: ${error}`)
    }
  })

  // send icons paths data to frontend
  ipcMain.handle('getImagePaths', async () => {
    return getImagePaths()
  })

  // Check icons on CDN
  ipcMain.handle('openIconUrls', async () => {
    try {
      await checkIconsInBrowser()
    } catch (error) {
      console.error('Error in openIconUrls:', error)
    }
  })

  ipcMain.handle('refreshIconStatus', async () => {
    try {
      let json = await readJSONFile(JSON_PATH)
      json = json.map((gameCode) => ({
        ...gameCode,
        iconsExist: checkGameIcons(gameCode.id)
      }))
      await writeJSONFile(JSON_PATH, json)
      return json
    } catch (error) {
      console.log('Failed to refresh icon status:', error)
      return null
    }
  })
}
