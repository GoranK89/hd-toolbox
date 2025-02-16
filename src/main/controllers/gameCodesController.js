import fs from 'fs'
import specialGameProviders from '../specialGameProviders'
import {
  readJSONFile,
  writeJSONFile,
  extractRTP,
  handleSpecialGameProviders,
  ensureUploadFolderExists
} from '../utils/generalPurposeFunctions'
import { JSON_PATH, BASE_PATH } from '../utils/pathUtils'
import { createGameFolder } from '../controllers/fileController'
import { checkGameIcons } from '../controllers/iconsController'

const readExistingGameCodes = async () => {
  let existingGameCodes = []

  try {
    const fileExists = fs.existsSync(JSON_PATH)

    if (!fileExists) {
      // Create new file with empty array
      await writeJSONFile(JSON_PATH, existingGameCodes)
      return existingGameCodes
    }

    // Read existing file
    existingGameCodes = await readJSONFile(JSON_PATH)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File ${JSON_PATH} does not exist, creating a new one.`)
      await writeJSONFile(JSON_PATH, [])
      return []
    }

    throw new Error(`Failed to read game codes file: ${error.message}`)
  }
}

// receives a game code and the existing game codes, compares new game code with existing ones and returns the updated game code object
const processGameCode = (newGameCode, existingGameCodes) => {
  let [gameProvider, ...noGpGameCodeArray] = newGameCode.split('_')
  const gameCodeRTP = extractRTP(noGpGameCodeArray)

  if (specialGameProviders.includes(gameProvider)) {
    gameProvider = handleSpecialGameProviders(gameProvider)
  }

  // if game code is PP_GAME_90, pop number to compare with gamecode.name
  if (gameCodeRTP) noGpGameCodeArray.pop()
  const noGpNoRTPGameCode = noGpGameCodeArray.join('_')
  // just formated for the game name purposes
  const noGpNoRTPGameCodeFormated = noGpGameCodeArray
    .join('_')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  const existingGameCode = existingGameCodes?.find((gameCode) => {
    let noGpId = gameCode.id.split('_')

    // extract last 2 characters from the game code and convert to number
    let lastElement = Number(noGpId[noGpId.length - 1].slice(-2))
    // if last 2 characters are between 85 and 99, pop them
    lastElement >= 85 && lastElement <= 99 ? noGpId.pop() : null

    noGpId = noGpId.slice(1).join('_')
    return noGpId === noGpNoRTPGameCode
  })

  if (
    existingGameCode &&
    existingGameCode?.id !== newGameCode &&
    !existingGameCode?.similarGames.includes(newGameCode)
  ) {
    existingGameCode.similarGames.push(newGameCode)
    existingGameCode.symlinks.push(
      `symlinks[]=${gameProvider}/${newGameCode},${gameProvider}/${existingGameCode.id}`
    )
    return existingGameCodes
  }

  // if game code is not present in JSON, add it else log the duplicate
  if (
    !existingGameCodes.some((gameCode) => gameCode.id === newGameCode) &&
    !existingGameCodes.some((gameCode) => gameCode.similarGames.includes(newGameCode))
  ) {
    existingGameCodes.push({
      id: newGameCode,
      name: noGpNoRTPGameCodeFormated,
      provider: gameProvider,
      type: 'SLOT',
      similarGames: [],
      iconsExist: false,
      folderLink: `games[]=${gameProvider}/${newGameCode}`,
      symlinks: []
    })
  } else {
    console.log(`Duplicate game code: ${newGameCode}`)
  }
  return existingGameCodes
}

async function storeGameCodes(gameCodes) {
  await writeJSONFile(JSON_PATH, gameCodes)
}

async function createGameFolders() {
  const gameCodesJson = await readJSONFile(JSON_PATH)
  createGameFolder(gameCodesJson)
}

// Receives new game codes, reads existing game codes, processes/compares them and stores them in JSON, creates according folders
async function handleGameCodes(newGameCodes) {
  await ensureUploadFolderExists(BASE_PATH)

  let existingGameCodes = await readExistingGameCodes()

  newGameCodes.forEach((newGameCode) => {
    existingGameCodes = processGameCode(newGameCode, existingGameCodes)
  })

  // Update iconsExist property for each game code
  existingGameCodes = existingGameCodes.map((gameCode) => ({
    ...gameCode,
    iconsExist: checkGameIcons(gameCode.id)
  }))

  await storeGameCodes(existingGameCodes)
  await createGameFolders()
}

export { readExistingGameCodes, processGameCode, handleGameCodes }
