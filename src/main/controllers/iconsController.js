import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH } from '../utils/pathUtils'
import { readJSONFile } from '../utils/generalPurposeFunctions'

const createFolderLinks = async () => {
  // Create the icons.txt file if it doesn't exist
  if (!fs.existsSync(`${BASE_PATH}/icons.txt`)) fs.writeFileSync(`${BASE_PATH}/icons.txt`, '')
  const json = await readJSONFile(JSON_PATH)
  let fileContent = ''

  // Sort the game codes by provider, alphabetically
  json.sort((a, b) => a.provider.localeCompare(b.provider))
  // keep track of the current provider, if it changes, add a new line with the provider name
  let currentProvider = ''
  json.forEach((gameCode) => {
    if (gameCode.provider !== currentProvider) {
      currentProvider = gameCode.provider
      fileContent += `${currentProvider}\n`
    }

    fileContent += `${gameCode.folderLink}\n`

    // If similar games exist add a space before writing symlinks
    if (gameCode.symlinks.length > 0) {
      fileContent += '\n'
    }

    gameCode.symlinks.forEach((symlink) => {
      fileContent += `${symlink}\n`
    })

    // after each game code object, add a new line
    fileContent += '\n'
  })

  fs.writeFileSync(`${BASE_PATH}/icons.txt`, fileContent)
}

// Check if icons exist in a folder

const checkGameIcons = (folderName) => {
  const uploadFolder = fs.readdirSync(BASE_PATH)
  const folderExists = uploadFolder.includes(folderName)

  if (!folderExists) return false

  const launchFolderPath = path.join(BASE_PATH, folderName, 'launch')
  const launchFolderContent = fs.readdirSync(launchFolderPath)
  const iconExists = launchFolderContent.includes('250x157.png')
  return iconExists
}

export { createFolderLinks, checkGameIcons }
