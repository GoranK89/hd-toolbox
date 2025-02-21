import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH } from '../utils/pathUtils'
import { readJSONFile, writeJSONFile } from '../utils/generalPurposeFunctions'

const deleteGameCodes = async (gameCodesToDelete) => {
  try {
    // Read the game codes from JSON
    let gameCodes = await readJSONFile(JSON_PATH)
    // Fiter
    const filteredGameCodes = gameCodes.filter(
      (gameCode) => !gameCodesToDelete.includes(gameCode.id)
    )

    // Write the filtered game codes to JSON file
    await writeJSONFile(JSON_PATH, filteredGameCodes)

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

const deleteFolders = (folderName) => {
  const folderPath = path.join(BASE_PATH, folderName)
  fs.rmSync(folderPath, { recursive: true, force: true })
}

export { deleteGameCodes, deleteFolders }
