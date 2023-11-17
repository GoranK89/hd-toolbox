import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import icon from '../../resources/icon.png?asset'
import { BASE_PATH, NEW_UPLOAD_PATH, JSON_PATH } from './paths'
import { createGameFolder } from './gameFolders'
import { getFolderData } from './readFolderData'
import createLinks from './generateIconLinks'

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

// store game codes and create folders and files
ipcMain.on('storeGameCodes', async (event, newGameCodes) => {
  // Create the folder for new upload
  try {
    await fs.promises.access(BASE_PATH)
  } catch (error) {
    await fs.promises.mkdir(NEW_UPLOAD_PATH)
    console.log('New upload folder created')
  }

  let gameCodes = {}

  // Create JSON file if it doesn't exist
  try {
    await fs.promises.access(JSON_PATH)
    const data = await fs.promises.readFile(JSON_PATH, 'utf8')
    gameCodes = JSON.parse(data)
  } catch (error) {
    // If the file is not accessible, create it
    await fs.promises.writeFile(JSON_PATH, JSON.stringify(gameCodes, null, 2))
    console.log('JSON file created')
  }

  // loop over the new game codes
  newGameCodes.forEach((newGameCode) => {
    let [gameProvider] = newGameCode.split('_')

    // If game provider is not in the object, add it
    if (!gameCodes[gameProvider]) {
      gameCodes[gameProvider] = []
    }
    // If game code is not in the array, add it or log duplicates
    if (!gameCodes[gameProvider].includes(newGameCode)) {
      gameCodes[gameProvider].push(newGameCode)
    } else {
      console.log(`Duplicate game code: ${newGameCode}`)
    }

    // Write the added game codes to JSON file
    const data = JSON.stringify(gameCodes, null, 2)
    fs.writeFileSync(JSON_PATH, data)

    // Create the folders with JSON data
    createGameFolder(NEW_UPLOAD_PATH, data)
  })

  // Create the links
  const allGameCodes = Object.values(gameCodes).flat()
  createLinks(NEW_UPLOAD_PATH, allGameCodes)
})

// send folder data to renderer
ipcMain.handle('uploadFolderContent', async () => {
  try {
    const folderData = getFolderData()
    console.log('Folder data sent to renderer')
    return folderData
  } catch (error) {
    console.error(`Failed to handle 'uploadFolderData':`, error)
  }
})

ipcMain.on('deleteGameCodes', async (event, gameCodesToDelete) => {
  try {
    const data = await fs.promises.readFile(JSON_PATH, 'utf8')
    let gameCodes = JSON.parse(data)

    // Delete code from JSON
    let [gameProvider] = gameCodesToDelete.split('_')
    let index = gameCodes[gameProvider].indexOf(gameCodesToDelete)
    gameCodes[gameProvider].splice(index, 1)

    // Write the changed data to JSON
    const newData = JSON.stringify(gameCodes, null, 2)
    fs.writeFileSync(JSON_PATH, newData)

    // Delete the folder
    const folderPath = path.join(NEW_UPLOAD_PATH, gameCodesToDelete)
    fs.rmSync(folderPath, { recursive: true, force: true })
  } catch (error) {
    console.error(`Failed to handle 'deleteGameCodes':`, error)
  }
})

// create a database of game providers (short name and full name) and link it to storing game codes
// folders and links should be also deleted with a button
// implement an overview of all created folders and links, which can be edited from inside the app (expandable box bellow game code - see links option)
// connect to google sheets API to get game names and types
