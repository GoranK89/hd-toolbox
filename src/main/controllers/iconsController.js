import fs from 'fs'
import path from 'path'
import { BASE_PATH, JSON_PATH, MATERIALS_PATH } from '../utils/pathUtils'
import { readJSONFile } from '../utils/generalPurposeFunctions'
const unzipper = require('unzipper')

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

const transferIcons = async () => {
  // gather all folders that should have icons and simplify names to lowercase without the GP part
  const newUploadFolders = fs.readdirSync(BASE_PATH)
  const lowerCaseFolderNames = newUploadFolders
    .map((folderName) => {
      if (folderName.includes('_')) return folderName.split('_')
    })
    .filter(Boolean)
    .map((folder) => folder.slice(1).join('').toLowerCase())

  // find all maps on desktop/materials path
  const iconFolders = fs.readdirSync(MATERIALS_PATH)
  const parentZipFiles = iconFolders.filter((file) => file.includes('ORYX'))

  // Unzip parent zip files (ORYX-12345)
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

  // attempt to extract materials to upload folders
  for (const file of iconFolders) {
    const filePath = path.join(MATERIALS_PATH, file)
    const zipFileName = file
      .split('_')
      .flatMap((part) => part.split('.'))
      .slice(0, -1)
      .join('')
      .toLowerCase()

    if (lowerCaseFolderNames.includes(zipFileName)) {
      const destinationFolder = newUploadFolders[lowerCaseFolderNames.indexOf(zipFileName)]
      const destinationPath = path.join(BASE_PATH, destinationFolder, 'launch')

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

export { createFolderLinks, checkGameIcons, transferIcons }
