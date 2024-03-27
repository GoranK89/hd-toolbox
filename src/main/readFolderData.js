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

export { checkGameIcons }
