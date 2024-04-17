import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import { BASE_PATH, JSON_PATH } from './paths'
import {
  extractRTP,
  ensureUploadFolderExists,
  readJSONFile,
  writeJSONFile
} from './generalPurposeFunctions'
import { createGameFolder } from './gameFolders'
import { checkGameIcons } from './readFolderData'
import { deleteGameCodes, deleteFolders } from './deleteFunctions'
import createFolderLinks from './generateIconLinks'
import specialGameProviders from './specialGameProviders'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
async function checkIconsInBrowser() {
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

async function readExistingGameCodes() {
  let existingGameCodes = []

  // Read existing game codes, if cannot read, create a new JSON file
  try {
    existingGameCodes = await readJSONFile(JSON_PATH)
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File ${JSON_PATH} does not exist, creating a new one.`)
      await writeJSONFile(JSON_PATH, existingGameCodes)
    } else {
      // If the error is not because the file doesn't exist, rethrow it.
      throw error
    }
  }

  return existingGameCodes
}

function handleSpecialGameProviders(gameProvider) {
  // NOTE: so far mobile game codes all work like this, and no regular GP ends with M
  // Remove the last letter from the game provider if it is 'M' or 'D' - needs retinking, how to store special cases
  const gameProviderLastLetter = gameProvider[gameProvider.length - 1]
  if (gameProviderLastLetter === 'M') {
    gameProvider = gameProvider.slice(0, -1)
    // the very special cases are handled bellow
  } else if (gameProvider === 'MGSD') {
    gameProvider = 'MGS'
  } else if (gameProvider === 'NETEE') {
    gameProvider = 'NETE'
  } else if (gameProvider === 'EVOLD' || gameProvider === 'EVOLDM') {
    gameProvider = 'EVOL'
  }

  return gameProvider
}

// receives a game code and the existing game codes, compares new game code with existing ones and returns the updated game code object
function processGameCode(newGameCode, existingGameCodes) {
  let [gameProvider, ...noGpGameCodeArray] = newGameCode.split('_')
  const gameCodeRTP = extractRTP(noGpGameCodeArray)

  if (specialGameProviders.includes(gameProvider)) {
    gameProvider = handleSpecialGameProviders(gameProvider)
  }

  // if game code is PP_GAME_90, pop number to compare with gamecode.name
  if (gameCodeRTP) noGpGameCodeArray.pop()
  // const noGpNoRTPGameCode = noGpGameCodeArray
  //   .join(' ')
  //   .toLowerCase()
  //   .split(' ')
  //   .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
  //   .join(' ')
  // 1. no gp no rtp game code
  const noGpNoRTPGameCode = noGpGameCodeArray.join('_')

  const existingGameCode = existingGameCodes?.find((gameCode) => {
    let noGpId = gameCode.id.split('_')
    noGpId = noGpId.slice(1).join('_')
    return noGpId === noGpNoRTPGameCode
  })

  if (
    existingGameCode &&
    existingGameCode?.id !== newGameCode &&
    !existingGameCode?.similarGames.includes(newGameCode)
  ) {
    existingGameCode.similarGames.push(newGameCode)
    existingGameCode.symlinks.push(
      `symlinks[]=${gameProvider}/${newGameCode},${gameProvider}/${existingGameCode.id}`
    )
    return existingGameCodes
  }

  // if game code is not present in JSON, add it else log the duplicate
  if (
    !existingGameCodes.some((gameCode) => gameCode.id === newGameCode) &&
    !existingGameCodes.some((gameCode) => gameCode.similarGames.includes(newGameCode))
  ) {
    existingGameCodes.push({
      id: newGameCode,
      name: noGpNoRTPGameCode,
      provider: gameProvider,
      type: 'SLOT',
      similarGames: [],
      iconsExist: false,
      folderLink: `games[]=${gameProvider}/${newGameCode}`,
      symlinks: []
    })
  } else {
    console.log(`Duplicate game code: ${newGameCode}`)
  }

  return existingGameCodes
}

async function storeGameCodes(gameCodes) {
  await writeJSONFile(JSON_PATH, gameCodes)
}

async function createGameFolders() {
  const gameCodesJson = await readJSONFile(JSON_PATH)
  createGameFolder(BASE_PATH, gameCodesJson)
}

// Receives new game codes, reads existing game codes, processes/compares them and stores them in JSON, creates according folders
async function handleGameCodes(newGameCodes) {
  await ensureUploadFolderExists(BASE_PATH)

  let existingGameCodes = await readExistingGameCodes()

  newGameCodes.forEach((newGameCode) => {
    existingGameCodes = processGameCode(newGameCode, existingGameCodes)
  })

  // Update iconsExist property for each game code
  existingGameCodes = existingGameCodes.map((gameCode) => ({
    ...gameCode,
    iconsExist: checkGameIcons(gameCode.id)
  }))

  await storeGameCodes(existingGameCodes)
  await createGameFolders()
}

// write symlinks into json file

/////////////////////////// IPC Handlers ///////////////////////////
ipcMain.on('storeGameCodes', async (event, newGameCodes) => {
  await handleGameCodes(newGameCodes)
  await createFolderLinks()
})

ipcMain.handle('readGameCodes', async (event) => {
  try {
    if (!fs.existsSync(JSON_PATH)) return []
    const json = await readJSONFile(JSON_PATH)
    return json
  } catch (error) {
    console.error(`Failed to handle 'readGameCodes':`, error)
  }
})

ipcMain.on('deleteGameCodes', async (event, gameCodesToDelete) => {
  try {
    await deleteGameCodes(gameCodesToDelete)
    deleteFolders(gameCodesToDelete)

    // read the game codes from JSON and regenerate icons txt file
    await createFolderLinks()
  } catch (error) {
    console.error(`Failed to handle 'deleteGameCodes':`, error)
  }
})

// after the change identical game codes get added to similar games
ipcMain.on('editGameInfo', async (event, id, editedValues) => {
  try {
    let gameCodes = await readJSONFile(JSON_PATH)
    let gameCodeIndex = gameCodes.findIndex((gameCode) => gameCode.id === id)
    gameCodes[gameCodeIndex] = { ...gameCodes[gameCodeIndex], ...editedValues }
    await writeJSONFile(JSON_PATH, gameCodes)
  } catch (error) {
    console.error(`Failed to handle 'editGameInfo':`, error)
  }
})

ipcMain.handle('openIconUrls', async () => {
  try {
    await checkIconsInBrowser()
  } catch (error) {
    console.error('Error in openIconUrls:', error)
  }
})

// implement an overview of all created folders and links, which can be edited from inside the app (expandable box bellow game code - see links option)
// connect to google sheets API to get game names and types
