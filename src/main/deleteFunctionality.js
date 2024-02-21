import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH } from './paths'
import specialGameProviders from './specialGameProviders'
import { readSymlinks } from './readFolderData'

// TODO: delete the game links and symlinks too
const deleteGameCodes = async (gameCodesToDelete) => {
  try {
    const data = await fs.promises.readFile(JSON_PATH, 'utf8')
    let gameCodes = JSON.parse(data)

    let [gameProvider, ...gameCode] = gameCodesToDelete.split('_')
    let lastTwoChars = parseInt(gameCode[gameCode.length - 1].slice(-2), 10)
    let pureGameCode = gameCode.join('_')

    if (specialGameProviders.includes(gameProvider)) {
      const gameProviderLastLetter = gameProvider[gameProvider.length - 1]
      if (gameProviderLastLetter === 'M') {
        gameProvider = gameProvider.slice(0, -1)
      } else if (gameProvider === 'MGSD') {
        gameProvider = 'MGS'
      }
    }

    // Check if the last two characters are a number
    if (!isNaN(lastTwoChars)) {
      pureGameCode = gameCode.slice(0, -1).join('_')
    }

    // Filter all game codes by the pure game code
    gameCodes[gameProvider] = gameCodes[gameProvider].filter((code) => {
      let [codeProvider, ...codeParts] = code.split('_')
      let codePrefix = codeParts.join('_')
      return !codePrefix.startsWith(pureGameCode)
    })

    // Write the changed data to JSON
    const newData = JSON.stringify(gameCodes, null, 2)
    fs.writeFileSync(JSON_PATH, newData)

    // Delete links
    const linksPath = path.join(BASE_PATH, 'icons.txt')
    const linksForDeleting = await readSymlinks(gameCodesToDelete)
    const linksToKeep = fs
      .readFileSync(linksPath, 'utf8')
      .split('\n')
      .filter((link) => Boolean(link) && !linksForDeleting.includes(link))

    fs.writeFileSync(linksPath, linksToKeep.join('\n'))

    // Delete the folder
    const folderPath = path.join(BASE_PATH, gameCodesToDelete)
    fs.rmSync(folderPath, { recursive: true, force: true })
  } catch (error) {
    console.error(`Failed to handle 'deleteGameCodes':`, error)
  }
}

export default deleteGameCodes
