import fs from 'fs'
import path from 'path'
import { NEW_UPLOAD_PATH } from './paths'

function getFolderData() {
  const mainFolder = fs.readdirSync(NEW_UPLOAD_PATH)
  const foldersOnly = mainFolder.filter((item) => {
    const extension = item.split('.').pop()
    return extension !== 'json' && extension !== 'txt'
  })

  const gameFoldersData = foldersOnly.map((folder) => {
    const launchFolderPath = path.join(NEW_UPLOAD_PATH, folder, 'launch')
    const gameEnPath = path.join(NEW_UPLOAD_PATH, folder, 'game_en.ini')

    if (fs.existsSync(launchFolderPath) || gameEnPath) {
      const launchFolderContent = fs.readdirSync(launchFolderPath)
      const gameEnText = fs.readFileSync(gameEnPath, 'utf8').split('\n')
      const iconExists = launchFolderContent.includes('250x157.png')
      return { folder, iconExists, gameEnText }
    }
  })

  return gameFoldersData
}

export { getFolderData }
