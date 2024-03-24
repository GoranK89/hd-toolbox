import fs from 'fs'
import path from 'path'
import { BASE_PATH } from './paths'

function checkGameIcons(folderName) {
  const uploadFolder = fs.readdirSync(BASE_PATH)
  const folderExists = uploadFolder.includes(folderName)

  if (!folderExists) return false

  const launchFolderPath = path.join(BASE_PATH, folderName, 'launch')
  const launchFolderContent = fs.readdirSync(launchFolderPath)
  const iconExists = launchFolderContent.includes('250x157.png')
  return iconExists
}

function readSymlinks(gameCode) {
  const symlinkFile = path.join(BASE_PATH, 'icons.txt')
  const symlinkData = fs.readFileSync(symlinkFile, 'utf8').split('\n')
  const symlinkDataFiltered = symlinkData.filter((item) => {
    return item.includes(gameCode)
  })
  return symlinkDataFiltered
}

export { readSymlinks, checkGameIcons }
