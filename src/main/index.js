import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'

import { JSON_PATH } from './utils/pathUtils.js'
import { readJSONFile, writeJSONFile } from './utils/generalPurposeFunctions.js'

import { handleGameCodes } from './controllers/gameCodesController.js'
import { editGameIniFile } from './controllers/fileController.js'
import {
  createFolderLinks,
  transferIcons,
  getImagePaths,
  checkIconsInBrowser
} from './controllers/iconsController.js'
import { deleteGameCodes, deleteFolders } from './controllers/deleteController.js'

import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
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

/////////////////////////////////////////////////////////////////////
/////////////////////////// **  IPC HANDLERS ** /////////////////////
/////////////////////////////////////////////////////////////////////

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

    // read the game codes from JSON and create a new TXT
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
    editGameIniFile(
      gameCodes[gameCodeIndex].id,
      gameCodes[gameCodeIndex].type,
      gameCodes[gameCodeIndex].name
    )
    await writeJSONFile(JSON_PATH, gameCodes)
  } catch (error) {
    console.error(`Failed to handle 'editGameInfo':`, error)
  }
})

// copy icons from materials folder to new upload foldrs
ipcMain.on('transferIcons', async () => {
  try {
    await transferIcons()
  } catch (error) {
    console.error(`Failed to transfer icons: ${error}`)
  }
})

// send icons paths data to frontend
ipcMain.handle('getImagePaths', async () => {
  return getImagePaths()
})

// Check icons on CDN
ipcMain.handle('openIconUrls', async () => {
  try {
    await checkIconsInBrowser()
  } catch (error) {
    console.error('Error in openIconUrls:', error)
  }
})
// connect to google sheets API to get game names and types

/*
 TODO: YGG and YAT games
 TOM, TOMM and TH2 games
 add if checks I guess
*/

// add more validation checks to game codes input

// return and display errors

// show icons in game card (actualy rework how data is sent to frontend entirely)
