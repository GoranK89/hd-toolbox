import fs from 'fs'

// check if the last part of the game code is a number between 88 and 98 (RTP)
function extractRTP(gameCode) {
  let lastPart = gameCode[gameCode.length - 1]
  let lastTwoChars = lastPart.slice(-2)
  Number(lastTwoChars)
  if (lastTwoChars >= 84 && lastTwoChars <= 99) {
    return lastTwoChars
  }
}

async function ensureUploadFolderExists(path) {
  try {
    await fs.promises.access(path)
  } catch (error) {
    await fs.promises.mkdir(path)
  }
}

function normalizeSpecialGameProviders(gameProvider) {
  // NOTE: so far mobile game codes all work like this, and no regular GP ends with M
  // Remove the last letter from the game provider if it is 'M' or 'D' - needs retinking, how to store special cases
  const gameProviderLastLetter = gameProvider[gameProvider.length - 1]
  if (gameProviderLastLetter === 'M' && gameProvider !== 'TOM') {
    gameProvider = gameProvider.slice(0, -1)
    // the very special cases are handled bellow
  } else if (gameProvider === 'MGSD') {
    gameProvider = 'MGS'
  } else if (gameProvider === 'NETEE') {
    gameProvider = 'NETE'
  } else if (gameProvider === 'EVOLD' || gameProvider === 'EVOLDM') {
    gameProvider = 'EVOL'
  }

  return gameProvider
}

async function readJSONFile(path) {
  try {
    const data = await fs.promises.readFile(path, 'utf8')
    if (!data) {
      console.warn(`File at ${path} is empty. Returning an empty array.`)
      return []
    }
    return JSON.parse(data)
  } catch (error) {
    console.error(`Failed to read or parse file at ${path}:`, error)
    throw error
  }
}

async function writeJSONFile(path, data) {
  try {
    const jsonData = JSON.stringify(data, null, 2)
    await fs.promises.writeFile(path, jsonData)
  } catch (error) {
    console.error(`Failed to write file at ${path}:`, error)
    throw error
  }
}

export {
  extractRTP,
  ensureUploadFolderExists,
  readJSONFile,
  writeJSONFile,
  normalizeSpecialGameProviders
}
