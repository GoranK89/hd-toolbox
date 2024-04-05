import fs from 'fs'
import { BASE_PATH, JSON_PATH } from './paths'
import { readJSONFile } from './generalPurposeFunctions'

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

export default createFolderLinks
