import fs from 'fs'
import path from 'path'

function createGameFolder(basePath, gameCodes) {
  gameCodes.forEach((gameCode) => {
    const gameCodePath = path.join(basePath, gameCode.id)
    const iconsPath = path.join(gameCodePath, 'launch')
    const originalPath = path.join(gameCodePath, 'original')
    const gameIniPath = path.join(gameCodePath, 'game_en.ini')

    const gameName = gameCode.name

    try {
      if (!fs.existsSync(gameCodePath)) {
        fs.mkdirSync(gameCodePath)
        fs.mkdirSync(iconsPath)
        fs.mkdirSync(originalPath)
        fs.writeFileSync(gameIniPath, `type=SLOT\ntitle=${gameName}\ncontent=${gameName}`)
      }
    } catch (error) {
      console.error(`Failed to create folder or write file for game code ${gameCode.id}`)
    }
  })
}

export { createGameFolder }
