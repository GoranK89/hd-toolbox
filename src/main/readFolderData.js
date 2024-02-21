import fs from 'fs'
import path from 'path'
import { BASE_PATH } from './paths'

function getFolderData() {
  if (!fs.existsSync(BASE_PATH)) {
    return []
  }

  const mainFolder = fs.readdirSync(BASE_PATH)
  const foldersOnly = mainFolder.filter((item) => {
    const extension = item.split('.').pop()
    return extension !== 'json' && extension !== 'txt'
  })

  const gameFoldersData = foldersOnly.map((folder) => {
    const launchFolderPath = path.join(BASE_PATH, folder, 'launch')
    const gameEnPath = path.join(BASE_PATH, folder, 'game_en.ini')

    if (fs.existsSync(launchFolderPath) || gameEnPath) {
      const launchFolderContent = fs.readdirSync(launchFolderPath)
      const gameEnText = fs.readFileSync(gameEnPath, 'utf8').split('\n')
      const iconExists = launchFolderContent.includes('250x157.png')
      return { folder, iconExists, gameEnText }
    }
  })

  return gameFoldersData
}

function readSymlinks(gameCode) {
  const symlinkFile = path.join(BASE_PATH, 'icons.txt')
  const symlinkData = fs.readFileSync(symlinkFile, 'utf8').split('\n')
  const symlinkDataFiltered = symlinkData.filter((item) => {
    return item.includes(gameCode)
  })
  return symlinkDataFiltered
}

export { getFolderData, readSymlinks }
