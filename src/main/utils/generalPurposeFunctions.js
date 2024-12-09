import fs from 'fs'

// check if the last part of the game code is a number between 88 and 98 (RTP)
function extractRTP(gameCode) {
  let lastPart = gameCode[gameCode.length - 1]
  let lastTwoChars = lastPart.slice(-2)
  Number(lastTwoChars)
  if (lastTwoChars >= 85 && lastTwoChars <= 99) {
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

export { extractRTP, ensureUploadFolderExists, readJSONFile, writeJSONFile }
