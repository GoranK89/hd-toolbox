import fs from 'fs'

const createLinks = (path, gameCodes) => {
  // Create the icons.txt file if it doesn't exist
  if (!fs.existsSync(`${path}/icons.txt`)) fs.writeFileSync(`${path}/icons.txt`, '')
  let fileContent = ''

  // Sort the game codes by provider, alphabetically
  gameCodes.sort((a, b) => a.provider.localeCompare(b.provider))
  // keep track of the current provider, if it changes, add a new line with the provider name
  let currentProvider = ''
  gameCodes.forEach((gameCode) => {
    if (gameCode.provider !== currentProvider) {
      currentProvider = gameCode.provider
      fileContent += `${currentProvider}\n`
    }

    fileContent += `games[]=${gameCode.provider}/${gameCode.id}\n`

    // If similar games exist add a space before writing symlinks
    if (gameCode.similarGames.length > 0) {
      fileContent += '\n'
    }

    gameCode.similarGames.forEach((similarGame) => {
      fileContent += `symlinks[]=${gameCode.provider}/${similarGame},${gameCode.provider}/${gameCode.id}\n`
    })

    // after each game code object, add a new line
    fileContent += '\n'
  })

  fs.writeFileSync(`${path}/icons.txt`, fileContent)
}

export default createLinks
