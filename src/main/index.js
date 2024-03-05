import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import { BASE_PATH, JSON_PATH } from './paths'
import { createGameFolder } from './gameFolders'
import { getFolderData, readSymlinks } from './readFolderData'
import createLinks from './generateIconLinks'
import deleteGameCodes from './deleteFunctionality'
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

// Helper functions
async function readJSONFile(path) {
  const data = await fs.promises.readFile(path, 'utf8')
  return JSON.parse(data)
}

async function writeJSONFile(path, data) {
  const jsonData = JSON.stringify(data, null, 2)
  await fs.promises.writeFile(path, jsonData)
}

// STORE game codes to JSON file
async function storeGameCodes(newGameCodes) {
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

  newGameCodes.forEach((newGameCode) => {
    let [gameProvider] = newGameCode.split('_')

    // Remove the last letter from the game provider if it is 'M' or 'D' - needs retinking, how to store special cases
    if (specialGameProviders.includes(gameProvider)) {
      const gameProviderLastLetter = gameProvider[gameProvider.length - 1]
      if (gameProviderLastLetter === 'M') {
        gameProvider = gameProvider.slice(0, -1)
      } else if (gameProvider === 'MGSD') {
        gameProvider = 'MGS'
      }
    }

    // if game code is not present in JSON, add it else log the duplicate
    if (!existingGameCodes.some((gameCode) => gameCode.id === newGameCode)) {
      existingGameCodes.push({
        id: newGameCode,
        name: newGameCode,
        provider: gameProvider,
        similarGames: []
      })
    } else {
      console.log(`Duplicate game code: ${newGameCode}`)
    }

    // Write the added game codes to JSON file
    const data = JSON.stringify(existingGameCodes, null, 2)
    fs.writeFileSync(JSON_PATH, data)

    // Create the folders with JSON data
    createGameFolder(BASE_PATH, data)
  })
}

// store game codes and create folders and files
ipcMain.on('storeGameCodes', async (event, newGameCodes) => {
  // Create the folder for new upload
  try {
    await fs.promises.access(BASE_PATH)
  } catch (error) {
    await fs.promises.mkdir(BASE_PATH)
  }

  // Store the game codes
  storeGameCodes(newGameCodes)

  // Create the folder links for icons
  const json = await fs.promises.readFile(JSON_PATH, 'utf8')
  const currentGameCodes = JSON.parse(json).map((game) => game.id)
  createLinks(BASE_PATH, currentGameCodes)
})

// send folder data to renderer
ipcMain.handle('uploadFolderContent', async () => {
  try {
    const folderData = getFolderData()
    return folderData
  } catch (error) {
    console.error(`Failed to handle 'uploadFolderData':`, error)
  }
})

// delete game codes and folders
ipcMain.on('deleteGameCodes', async (event, gameCodesToDelete) => {
  try {
    await deleteGameCodes(gameCodesToDelete)
  } catch (error) {
    console.error(`Failed to handle 'deleteGameCodes':`, error)
  }
})

// send symlinks to renderer
ipcMain.handle('readSymLinks', async (event, gameCode) => {
  try {
    return readSymlinks(gameCode)
  } catch (error) {
    console.error(`Failed to handle 'readSymLinks':`, error)
  }
})

// Watch for changes in the JSON file and send a message to the renderer
//TODO: if the JSON does not exist, watcher does not work
if (fs.existsSync(JSON_PATH)) {
  fs.watch(JSON_PATH, (eventType, filename) => {
    if (filename && eventType === 'change') {
      const windows = BrowserWindow.getAllWindows()
      windows.forEach((win) => {
        win.webContents.send('jsonFileChanged')
      })
    }
  })
} else {
  console.log(`File ${JSON_PATH} does not exist`)
}

// implement an overview of all created folders and links, which can be edited from inside the app (expandable box bellow game code - see links option)
// connect to google sheets API to get game names and types
