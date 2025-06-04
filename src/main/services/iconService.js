import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH, MATERIALS_PATH } from '../utils/pathUtils'
import { readJSONFile } from '../utils/generalPurposeFunctions'
import { shell, nativeImage } from 'electron'
import { gameProviders } from '../../renderer/src/components/GameCodes/gameProviders'
import specialGameProviders from '../specialGameProviders'

const unzipper = require('unzipper')

/////////////////////////////
/* GAMES AND SYMLINKS */
//////////////////////////////
const createFolderLinks = async () => {
  // Create the icons.txt file if it doesn't exist
  if (!fs.existsSync(`${BASE_PATH}/icons.txt`)) fs.writeFileSync(`${BASE_PATH}/icons.txt`, '')
  const json = await readJSONFile(JSON_PATH)
  let fileContent = ''

  // Sort the game codes by provider, alphabetically
  json.sort((a, b) => a.provider.localeCompare(b.provider))
  // keep track of the current provider, if it changes, add a new line with the provider name
  let currentProvider = ''
  json.forEach((gameCode) => {
    if (gameCode.provider !== currentProvider) {
      currentProvider = gameCode.provider
      fileContent += `${currentProvider}\n`
    }

    fileContent += `${gameCode.folderLink}\n`

    // If similar games exist add a space before writing symlinks
    if (gameCode.symlinks.length > 0) {
      fileContent += '\n'
    }

    gameCode.symlinks.forEach((symlink) => {
      fileContent += `${symlink}\n`
    })

    // after each game code object, add a new line
    fileContent += '\n'
  })

  fs.writeFileSync(`${BASE_PATH}/icons.txt`, fileContent)
}

//////////////////////////////
/* MATCH AND TRANSFER ICONS */
//////////////////////////////
const transferIcons = async () => {
  const gameProviderShortcodes = Object.values(gameProviders)

  // gather all folders that should have icons and simplify names to lowercase without the GP part
  const newUploadFolders = await fs.promises.readdir(BASE_PATH)
  const folderMapping = createFolderMapping(newUploadFolders, gameProviderShortcodes)

  // find all maps on desktop/materials path
  const iconFolders = fs.readdirSync(MATERIALS_PATH)
  const parentZipFiles = iconFolders.filter((file) => file.includes('ORYX'))
  await unzipParentFiles(parentZipFiles)

  const normalizeGameNameFromParts = (parts) => {
    return parts
      .flatMap((part) => part.split('.'))
      .slice(0, -1)
      .join('')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^\w\s]/g, '')
      .trim()
  }

  // attempt to extract materials to upload folders
  for (const file of iconFolders) {
    const filePath = path.join(MATERIALS_PATH, file)
    // If zip file has spaces, replace with underscore for consistency
    const normalizedFile = file.replace(/\s+/g, '_')
    const parts = normalizedFile.split('_')

    if (
      (parts.length >= 1 && gameProviderShortcodes.includes(parts[0])) ||
      specialGameProviders.includes(parts[0])
    ) {
      parts.shift()
    }

    // handle MGS versioning
    const lastPart = parts[parts.length - 1].split('.').shift()
    const rtp = Number(lastPart.slice(1, 3))

    if (parts[parts.length - 1].includes('V') && !isNaN(rtp)) {
      parts.pop()
    }

    const gameNameFromParts = normalizeGameNameFromParts(parts)

    const destinationFolder = folderMapping.get(gameNameFromParts)
    if (!destinationFolder) continue

    const destinationPath = path.join(BASE_PATH, destinationFolder, 'launch')

    // Ensure the destination folder exists, ignore json
    if (destinationPath.includes('.json')) continue

    if (!fs.existsSync(destinationPath)) console.log(`Folder ${destinationFolder} not found`)
    if (!fs.existsSync(destinationFolder))
      console.log(`Folder ${destinationFolder} already has icons`)

    if (fs.lstatSync(filePath).isFile() && path.extname(file) === '.zip') {
      await fs
        .createReadStream(filePath)
        .pipe(unzipper.Parse())
        .on('entry', async (entry) => {
          const fileName = path.basename(entry.path)
          const fileExtension = path.extname(fileName).toLowerCase()
          if (fileExtension === '.png' && !fileName.startsWith('._')) {
            const writeStream = fs.createWriteStream(path.join(destinationPath, fileName))
            entry.pipe(writeStream)
            await new Promise((resolve) => writeStream.on('finish', resolve))
          } else {
            entry.autodrain()
          }
        })
        .promise()
    }
  }
}

const createFolderMapping = (folders, gameProviderShortcodes) => {
  const mapping = new Map()

  folders.forEach((folderName) => {
    if (!folderName.includes('_')) return

    const [prefix, ...rest] = folderName.split('_')

    // Check if the last item is a number between 85 and 99
    let partsToUse = [...rest] // Create a copy of the rest of array
    if (gameProviderShortcodes && gameProviderShortcodes.includes(prefix)) {
      // Provider prefix already removed
    } else {
      // If prefix is not a provider, include it in the name
      partsToUse = [prefix, ...rest]
    }

    if (rest.length > 0) {
      const lastPart = rest[rest.length - 1]

      // Extract the last 2 characters if the string is long enough
      const lastTwoChars = lastPart.length >= 2 ? lastPart.slice(-2) : lastPart
      const num = parseInt(lastTwoChars)

      // If the last part is a number between 85 and 99, remove it
      if (!isNaN(num) && num >= 85 && num <= 99) {
        partsToUse = rest.slice(0, -1) // Remove the last element
        console.log(`Removed numeric suffix '${lastPart}' from '${folderName}'`)
      }
    }

    const normalizedName = partsToUse.join('').toLowerCase()
    mapping.set(normalizedName, folderName)
  })
  return mapping
}

const unzipParentFiles = async (parentZipFiles) => {
  for (const file of parentZipFiles) {
    const filePath = path.join(MATERIALS_PATH, file)

    if (fs.lstatSync(filePath).isFile() && path.extname(file) === '.zip') {
      await fs
        .createReadStream(filePath)
        .pipe(unzipper.Extract({ path: MATERIALS_PATH }))
        .promise()
      console.log(`Unzipped successfully, parent file deleted: ${file}`)
      // Delete the zip file after successful unzip
      fs.unlinkSync(filePath)
    }
  }
}

// Check if icons exist in a folder
const checkGameIcons = (folderName) => {
  const uploadFolder = fs.readdirSync(BASE_PATH)
  const folderExists = uploadFolder.includes(folderName)

  if (!folderExists) return false

  const launchFolderPath = path.join(BASE_PATH, folderName, 'launch')
  const launchFolderContent = fs.readdirSync(launchFolderPath)
  const iconExists = launchFolderContent.includes('250x157.png')
  return iconExists
}

const checkIconsInBrowser = async () => {
  if (!fs.existsSync) return
  const gameCodes = await readJSONFile(JSON_PATH)
  const iconUrls = gameCodes.flatMap((gameCode) => [
    `https://cdn.oryxgaming.com/medialib/${gameCode.id}/launch/250x157.png`,
    ...gameCode.similarGames.map(
      (similarGame) => `https://cdn.oryxgaming.com/medialib/${similarGame}/launch/250x157.png`
    )
  ])

  iconUrls.forEach((url) => {
    shell.openExternal(url)
  })
}

// send image paths to frontend
const getImagePaths = () => {
  const newUploadContent = fs.readdirSync(BASE_PATH)
  const gameIconFolders = newUploadContent.filter((folder) => !folder.includes('.'))

  const imagePaths = gameIconFolders
    .map((folder) => {
      const launchFolderPath = path.join(BASE_PATH, folder, 'launch')
      const icons = fs.readdirSync(launchFolderPath).filter((file) => file.endsWith('.png'))
      return icons.map((icon) => {
        const iconPath = path.join(launchFolderPath, icon)
        const image = nativeImage.createFromPath(iconPath)
        return {
          folder,
          path: iconPath,
          dataUrl: image.toDataURL()
        }
      })
    })
    .flat()

  return imagePaths
}

export { createFolderLinks, checkGameIcons, transferIcons, getImagePaths, checkIconsInBrowser }
