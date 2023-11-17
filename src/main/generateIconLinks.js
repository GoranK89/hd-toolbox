import fs from 'fs'
import specialGameProviders from './specialGameProviders'

// still robust, does not work for game codes with string suffixes like NOBB
const cutGpAndSuffix = (gameCode) => {
  const gameCodeParts = gameCode.split('_')
  gameCodeParts.shift()
  const lastPart = gameCodeParts[gameCodeParts.length - 1]
  const last2Letters = lastPart.slice(-2)
  const last2Numbers = Number(last2Letters)
  const isVersion = last2Numbers > 80 && last2Numbers < 100 ? last2Numbers : null
  // pop the last part if it is a version (RTP)
  if (isVersion) {
    gameCodeParts.pop()
  }
  const noGpNoSuffixGameCode = gameCodeParts.join('_')
  return noGpNoSuffixGameCode
}

const createGameLink = (gameCode) => {
  const gameProvider = gameCode.split('_')[0]
  const normalGameLink = `games[]=${gameProvider}/${gameCode}`

  // NOTE: very specific solution based on game providers
  if (specialGameProviders.includes(gameProvider)) {
    let pureGP = gameProvider.replace(/[DMEH]$/, '')

    if (gameProvider === 'WD') {
      pureGP = 'WD'
    } else if (gameProvider === 'TOM') {
      pureGP = 'TOM'
    }

    return `games[]=${pureGP}/${gameCode}`
  } else {
    return normalGameLink
  }
}

const createSymlink = (gameCode, existingLinks) => {
  const gameProvider = gameCode.split('_')[0]
  const gameCodeName = cutGpAndSuffix(gameCode)

  const matchingGameLink = existingLinks.find((item) => item.includes(gameCodeName))

  const foundGameProvider = matchingGameLink.split('/')[0]
  const bindTo = matchingGameLink.replace(foundGameProvider, gameProvider)

  const baseSymlink = `symlinks[]=${gameProvider}/${gameCode},${bindTo}`

  if (specialGameProviders.includes(gameProvider)) {
    let pureGP = gameProvider.replace(/[DMEH]$/, '')
    if (gameProvider === 'WD') {
      pureGP = 'WD'
    } else if (gameProvider === 'TOM') {
      pureGP = 'TOM'
    }
    const bindTo = matchingGameLink.replace(foundGameProvider, pureGP)
    return `symlinks[]=${pureGP}/${gameCode},${bindTo}`
  } else {
    return baseSymlink
  }
}

const createLinks = (path, gameCodes) => {
  if (!fs.existsSync(`${path}/icons.txt`)) fs.writeFileSync(`${path}/icons.txt`, '')

  const gameLinks = []
  const symLinks = []

  gameCodes.forEach((gameCode) => {
    const noGpNoSuffixGameCode = cutGpAndSuffix(gameCode)
    const gameProvider = gameCode.split('_')[0]

    // NOTE: refactor, not readable
    if (gameProvider === 'WD' || gameProvider === 'TOM') {
      if (!gameLinks.some((item) => item.includes(noGpNoSuffixGameCode))) {
        gameLinks.push(createGameLink(gameCode))
        return
      }
    } else if (gameProvider === 'WDM' || gameProvider === 'TOMM') {
      symLinks.push(createSymlink(gameCode, gameLinks))
      return
    }

    if (
      !gameLinks.some((item) => item.includes(noGpNoSuffixGameCode)) &&
      specialGameProviders.includes(gameProvider) &&
      gameProvider.endsWith('D' || 'E' || 'H')
    ) {
      gameLinks.push(createGameLink(gameCode))
      return
    }

    if (!gameLinks.some((item) => item.includes(noGpNoSuffixGameCode))) {
      gameLinks.push(createGameLink(gameCode))
    } else {
      symLinks.push(createSymlink(gameCode, gameLinks))
    }
  })

  // read icons.txt, check for duplicates, append links
  const existingLinks = fs.readFileSync(`${path}/icons.txt`, 'utf8').split('\n')

  gameLinks.forEach((gameLink) => {
    if (!existingLinks.includes(gameLink)) {
      fs.appendFileSync(`${path}/icons.txt`, `${gameLink}\n`)
    }
  })

  symLinks.forEach((symLink) => {
    if (!existingLinks.includes(symLink)) {
      fs.appendFileSync(`${path}/icons.txt`, `${symLink}\n`)
    }
  })

  ///// SORTING the created links //////
  const groupedLinks = []

  existingLinks?.forEach((link) => {
    const gameProvider = link.split('/')[0].replace(/(games\[\]=|symlinks\[\]=)/, '')

    const group = groupedLinks.find((g) => g.gameProvider === gameProvider)
    if (group) {
      group.links.push(link)
    } else {
      groupedLinks.push({
        gameProvider,
        links: [link]
      })
    }
  })

  const stream = fs.createWriteStream(`${path}/sorted-icons.txt`)
  groupedLinks.forEach((group) => {
    stream.write(`Game Provider: ${group.gameProvider}\n`)
    group.links.forEach((link, index) => {
      stream.write(`${link}\n`)
      if (index === group.links.length - 1) {
        stream.write('\n')
      }
    })
  })
  stream.end()
}

export default createLinks
