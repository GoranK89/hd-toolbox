import fs from 'fs'
import path from 'path'
import specialGameProviders from '../specialGameProviders'
import {
  readJSONFile,
  writeJSONFile,
  extractRTP,
  normalizeSpecialGameProviders,
  ensureUploadFolderExists
} from '../utils/generalPurposeFunctions'
import { JSON_PATH, BASE_PATH } from '../utils/pathUtils'
import { createGameFolder } from '../services/fileService'
import { checkGameIcons } from '../services/iconService'

async function handleGameCodes(newGameCodes) {
  await ensureUploadFolderExists(BASE_PATH)

  let existingGameCodes = await readExistingGameCodes()
  let errors = []

  for (const newGameCode of newGameCodes) {
    try {
      existingGameCodes = processGameCode(newGameCode, existingGameCodes)
    } catch (error) {
      errors.push({ gameCode: newGameCode, error: error.message })
      continue
    }
  }

  // Update iconsExist property for each game code
  existingGameCodes = existingGameCodes.map((gameCode) => ({
    ...gameCode,
    iconsExist: checkGameIcons(gameCode.id)
  }))

  await storeGameCodes(existingGameCodes)
  await createGameFolders()

  return {
    success: true,
    processedGameCodes: existingGameCodes,
    errors: errors.length > 0 ? errors : null
  }
}

// receives a game code and the existing game codes, compares new game code with existing ones and returns the updated game code object
const processGameCode = (newGameCode, existingGameCodes) => {
  let [gameProvider, ...noGpGameCodeArray] = newGameCode.split('_')
  const gameCodeRTP = extractRTP(noGpGameCodeArray)

  if (specialGameProviders.includes(gameProvider)) {
    gameProvider = normalizeSpecialGameProviders(gameProvider)
  }

  // if game code is PP_GAME_90, pop number to compare with gamecode.name
  if (gameCodeRTP) noGpGameCodeArray.pop()
  const noGpNoRTPGameCode = noGpGameCodeArray.join('_')

  // Pure game name
  const newGameName = noGpGameCodeArray
    .join('_')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  const existingGameCode = existingGameCodes?.find((gameCode) => {
    let noGpId = gameCode.id.split('_')
    let existingGameProvider = noGpId[0]
    let lastElement = Number(noGpId[noGpId.length - 1].slice(-2))
    lastElement >= 85 && lastElement <= 99 ? noGpId.pop() : null

    if (noGpId[0] === 'MGSD' || noGpId[0] === 'MGSM') {
      noGpId[0] = 'MGS'
    }

    if (existingGameProvider === 'MGSD' || existingGameProvider === 'MGSM') {
      existingGameProvider = 'MGS'
    }

    noGpId = noGpId.slice(1).join('_')

    if (existingGameProvider !== gameProvider && noGpId === noGpNoRTPGameCode) {
      console.log('New game is NOT from same gp as existing game. But it has the same name!!')
      return false
    } else {
      return noGpId === noGpNoRTPGameCode
    }
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
    !existingGameCodes.some((existingGameCode) => existingGameCode.id === newGameCode) &&
    !existingGameCodes.some((existingGameCode) =>
      existingGameCode.similarGames.includes(newGameCode)
    )
  ) {
    existingGameCodes.push({
      id: newGameCode,
      name: newGameName,
      provider: gameProvider,
      type: determineGameType(newGameCode),
      similarGames: [],
      iconsExist: false,
      folderLink: `games[]=${gameProvider}/${newGameCode}`,
      symlinks: []
    })
  } else {
    throw new Error(`Duplicate game code: ${newGameCode}`)
  }
  return existingGameCodes
}

const deleteGameCodes = async (gameCodesToDelete) => {
  try {
    const folderPath = path.join(BASE_PATH, gameCodesToDelete)
    // Read the game codes from JSON
    let gameCodes = await readJSONFile(JSON_PATH)
    // Fiter
    const filteredGameCodes = gameCodes.filter(
      (gameCode) => !gameCodesToDelete.includes(gameCode.id)
    )

    // Write the filtered game codes to JSON file
    await writeJSONFile(JSON_PATH, filteredGameCodes)
    // delete folders
    fs.rmSync(folderPath, { recursive: true, force: true })
    // Return the updated state
    return {
      success: true,
      data: filteredGameCodes
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

// BUG: if 2 similar folders have similar names and you delete one of them, both dissapear from the list but one folder remains in the file system
// example: PP_TEST and PP_TEST_2, if you delete PP_TEST_2, both folders dissapear from the list but PP_TEST remains in the file system

/*Utility functions*/

async function storeGameCodes(gameCodes) {
  await writeJSONFile(JSON_PATH, gameCodes)
}

async function createGameFolders() {
  const gameCodesJson = await readJSONFile(JSON_PATH)
  createGameFolder(gameCodesJson)
}

const readExistingGameCodes = async () => {
  try {
    const fileExists = fs.existsSync(JSON_PATH)

    if (!fileExists) {
      await writeJSONFile(JSON_PATH, [])
      return []
    }

    // Read existing file
    const existingGameCodes = await readJSONFile(JSON_PATH)
    return existingGameCodes || [] // Ensure we always return an array
  } catch (error) {
    console.error('Error reading game codes:', error)
    return [] // Always return an array even on error
  }
}

function determineGameType(gameCodes) {
  const cardType = ['BLACKJACK', 'BACCARAT', 'CARD', 'BLACK JACK', 'POKER', 'BJ']
  const tableType = [
    'ROULETE',
    'RULETE',
    'RULETA',
    'ROLETA',
    'RULETKA',
    'SIC BO',
    'BAC BO',
    'FIRST PERSON',
    'KENO'
  ]

  if (cardType.some((keyword) => gameCodes.includes(keyword))) {
    return 'CARD'
  }
  if (tableType.some((keyword) => gameCodes.includes(keyword))) {
    return 'TABLE'
  }

  return 'SLOT'
}

export { readExistingGameCodes, processGameCode, handleGameCodes, deleteGameCodes }
