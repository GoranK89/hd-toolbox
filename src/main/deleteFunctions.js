import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH } from './paths'

const deleteGameCodes = async (gameCodesToDelete) => {
  // Read the game codes from JSON
  const data = await fs.promises.readFile(JSON_PATH, 'utf8')
  let gameCodes = JSON.parse(data)

  // Fiter out the game codes to delete
  const filteredGameCodes = gameCodes.filter((gameCode) => !gameCodesToDelete.includes(gameCode.id))

  // Write the filtered game codes to JSON file
  const newData = JSON.stringify(filteredGameCodes, null, 2)
  fs.writeFileSync(JSON_PATH, newData)
}

const deleteFolders = (folderName) => {
  const folderPath = path.join(BASE_PATH, folderName)
  fs.rmSync(folderPath, { recursive: true, force: true })
}

export { deleteGameCodes, deleteFolders }
