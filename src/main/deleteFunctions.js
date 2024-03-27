import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH } from './paths'
import { readJSONFile, writeJSONFile } from './generalPurposeFunctions'

const deleteGameCodes = async (gameCodesToDelete) => {
  // Read the game codes from JSON

  let gameCodes = await readJSONFile(JSON_PATH)
  // Fiter out the game codes to delete
  const filteredGameCodes = gameCodes.filter((gameCode) => !gameCodesToDelete.includes(gameCode.id))

  // Write the filtered game codes to JSON file
  await writeJSONFile(JSON_PATH, filteredGameCodes)
}

const deleteFolders = (folderName) => {
  const folderPath = path.join(BASE_PATH, folderName)
  fs.rmSync(folderPath, { recursive: true, force: true })
}

export { deleteGameCodes, deleteFolders }
