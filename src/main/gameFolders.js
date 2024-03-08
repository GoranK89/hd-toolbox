import fs from 'fs'
import path from 'path'

const generatePureGameCode = (gameCode) => {
  // cut away the game provider
  const gameCodeParts = gameCode.split('_')
  gameCodeParts.shift()
  // check if the last part is a number and recognize if it is a version (RTP)
  const lastPart = gameCodeParts[gameCodeParts.length - 1]
  const last2Letters = lastPart.slice(-2)
  const last2Numbers = Number(last2Letters)
  const isVersion = last2Numbers > 80 && last2Numbers < 100 ? last2Numbers : null
  // pop the last part if it is a version (RTP)
  if (isVersion) {
    gameCodeParts.pop()
  }

  const pureGameCode = gameCodeParts.join('_')
  return pureGameCode
}

function createGameFolder(basePath, gameCode) {
  let jsonData = JSON.parse(gameCode)
  const uniqueFolderNames = new Set()

  for (let game of jsonData) {
    const pureGameCode = generatePureGameCode(game.id)
    let gameName = game.id.split('_').slice(1).join(' ')
    gameName = gameName
      .toLowerCase()
      .split(' ')
      .map((word) => (word === 'and' ? word : word.charAt(0).toUpperCase() + word.substring(1)))
      .join(' ')

    // Check if the last two characters are a number between 80 and 100
    const lastTwoChars = gameName.slice(-2)
    const lastTwoCharsAsNumber = parseInt(lastTwoChars, 10)

    if (lastTwoCharsAsNumber >= 80 && lastTwoCharsAsNumber < 100) {
      gameName = gameName.slice(0, -2).trim()
    }

    if (!uniqueFolderNames.has(pureGameCode)) {
      uniqueFolderNames.add(pureGameCode)

      const gameCodePath = path.join(basePath, game.id)
      const iconsPath = path.join(gameCodePath, 'launch')
      const originalPath = path.join(gameCodePath, 'original')
      const gameIniPath = path.join(gameCodePath, 'game_en.ini')

      try {
        if (!fs.existsSync(gameCodePath)) {
          fs.mkdirSync(gameCodePath)
          fs.mkdirSync(iconsPath)
          fs.mkdirSync(originalPath)
          fs.writeFileSync(gameIniPath, `type=SLOT\ntitle=${gameName}\ncontent=${gameName}`)
        }
      } catch (error) {
        console.error(`Failed to create folder or write file for game code ${game.id}:`, error)
      }
    }
  }
}

export { createGameFolder }
