import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs'

import { JSON_PATH, RECON_PATH } from './utils/pathUtils.js'
import { readJSONFile, writeJSONFile } from './utils/generalPurposeFunctions.js'

import { handleGameCodes } from './controllers/gameCodesController.js'
import { editGameIniFile } from './controllers/fileController.js'
import {
  createFolderLinks,
  transferIcons,
  getImagePaths,
  checkGameIcons,
  checkIconsInBrowser
} from './controllers/iconsController.js'
import { deleteGameCodes } from './controllers/deleteController.js'

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

ipcMain.handle('storeGameCodes', async (event, newGameCodes) => {
  try {
    const result = await handleGameCodes(newGameCodes)
    await createFolderLinks()
    return {
      success: true,
      errors: result.errors
    }
  } catch (err) {
    console.log(err.message)
    return {
      success: false,
      error: err.message
    }
  }
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

ipcMain.handle('deleteGameCodes', async (event, gameCodesToDelete) => {
  try {
    const result = await deleteGameCodes(gameCodesToDelete)
    // read the game codes from JSON and create a new TXT
    await createFolderLinks()
    return result
  } catch (error) {
    console.error(`Failed to handle 'deleteGameCodes':`, error)
  }
})

// after the change identical game codes get added to similar games
ipcMain.handle('editGameInfo', async (event, id, editedValues) => {
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

    const freshJsonData = await readJSONFile(JSON_PATH)
    return freshJsonData
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

ipcMain.handle('refreshIconStatus', async () => {
  try {
    let json = await readJSONFile(JSON_PATH)
    json = json.map((gameCode) => ({
      ...gameCode,
      iconsExist: checkGameIcons(gameCode.id)
    }))
    await writeJSONFile(JSON_PATH, json)
    return json
  } catch (error) {
    console.log('Failed to refresh icon status:', error)
    return null
  }
})

////////////////////////////
/* RECON FUNCTIONALITIES */
////////////////////////////

ipcMain.handle('reconFormatSheet', async () => {
  // 1.) create recon folder on desktop
  if (!fs.existsSync(RECON_PATH)) {
    console.log('no recon folder found, creating it..')
    try {
      fs.mkdirSync(RECON_PATH, { recursive: true })
      console.log('Recon folder created successfully at:', RECON_PATH)
      // message for frontend
      return {
        success: true,
        message: 'Recon folder is ready, add your .csv file to the folder.',
        path: RECON_PATH
      }
    } catch (error) {
      console.error('Error creating recon folder:', error)
      throw new Error(`Failed to create recon folder: ${error.message}`)
    }
  }

  // 2.) Look for recon files in Recon folder
  const files = fs.readdirSync(RECON_PATH)
  const reconFiles = files.filter((file) => {
    return file.includes('.csv')
  })

  if (reconFiles.length === 0) {
    return {
      success: false,
      message: 'No recon files found in the recon folder. Please add files.',
      path: RECON_PATH
    }
  }

  const date = new Date()
  const prevMonth = new Date(date.setMonth(date.getMonth() - 1))
  const monthName = prevMonth.toLocaleString('default', { month: 'long' })
  const year = prevMonth.getFullYear()

  // Process each file individually
  const results = []

  for (const reconFile of reconFiles) {
    const filePath = path.join(RECON_PATH, reconFile)
    try {
      console.log(`Processing file: ${reconFile}`)
      const csvContent = fs.readFileSync(filePath, 'utf-8')

      // Parse CSV content
      const rows = csvContent.split('\n').filter((row) => row.trim().length > 0)
      const headers = rows[0].split(',')

      // Find index of columns
      const winColumnIndex = headers.indexOf('Win')
      const playerIdColumnIndex = headers.indexOf('Rgs player id')

      if (playerIdColumnIndex === -1) {
        console.error('Could not find Rgs player id column in file:', reconFile)
        results.push({
          file: reconFile,
          success: false,
          message: 'Could not find Rgs player id column'
        })
        continue
      }

      // Determine environment suffix based on player IDs
      let envSuffix = 'OTHER'
      let playerIdSamples = []

      // Get a sample of player IDs to determine environment
      for (let i = 1; i < Math.min(rows.length, 10); i++) {
        const cells = rows[i].split(',')
        if (cells.length > playerIdColumnIndex) {
          const playerId = cells[playerIdColumnIndex].trim()
          playerIdSamples.push(playerId)
        }
      }

      // Determine environment from player ID patterns
      if (playerIdSamples.some((id) => id.startsWith('808-'))) {
        envSuffix = 'PROD_JVHR'
      } else if (playerIdSamples.some((id) => id.startsWith('1127-'))) {
        envSuffix = 'PROD_ICHR'
      } else if (playerIdSamples.some((id) => id.startsWith('1008-'))) {
        envSuffix = 'PROD_CAHR'
      }

      // Create output directory with environment and date information
      const outputDir = path.join(RECON_PATH, `${envSuffix}_Recon_${monthName}_${year}`)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Recon Data')

      // Add headers
      const headerRow = worksheet.addRow(headers)
      headerRow.font = { bold: true }

      // Add data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(',')
        worksheet.addRow(cells)
      }

      // Format columns for better readability
      worksheet.columns.forEach((column) => {
        column.width = Math.max(15, column.header ? column.header.length + 2 : 15)
      })

      // Add action column
      headers.push('Action')
      worksheet.getCell(1, headers.length).value = 'Action'
      worksheet.getCell(1, headers.length).font = { bold: true }

      // Fill action column based on game provider and win amount
      for (let i = 2; i <= rows.length; i++) {
        const gameProvider = worksheet.getCell(i, 1).value
        const winAmount = parseFloat(worksheet.getCell(i, winColumnIndex + 1).value || 0)

        if (gameProvider === 'Playson') {
          // For Playson: CLOSE_ROUND if win > 0, CANCEL_ROUND if win = 0
          worksheet.getCell(i, headers.length).value = 'CLOSE_ROUND'
        } else {
          // For other providers, leave the action column empty
          worksheet.getCell(i, headers.length).value = ''
        }
      }

      // Group data by game provider and create separate files
      const gameProviders = new Set()
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split(',')
        gameProviders.add(cells[0])
      }

      for (const provider of gameProviders) {
        const providerWorkbook = new ExcelJS.Workbook()

        // Sanitize provider name for Excel worksheet name
        const sanitizedProviderName = provider.replace(/[\*\?\:\/\\\[\]]/g, '_')
        const worksheetName =
          sanitizedProviderName.length > 31
            ? sanitizedProviderName.substring(0, 31)
            : sanitizedProviderName

        const providerSheet = providerWorkbook.addWorksheet(`${worksheetName} Recon`)

        // Add headers
        const providerHeaderRow = providerSheet.addRow([...headers])
        providerHeaderRow.font = { bold: true }

        // Add rows for this provider
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].split(',')
          if (cells[0] === provider) {
            const rowData = [...cells]

            providerSheet.addRow(rowData)
          }
        }

        // Format columns
        providerSheet.columns.forEach((column) => {
          column.width = Math.max(15, column.header ? column.header.length + 2 : 15)
        })

        // Save provider-specific file
        const sanitizedFileProvider = provider
          .replace(/[\*\?\:\/\\\[\]]/g, '_')
          .replace(/\s+/g, '_')
        const providerFilePath = path.join(outputDir, `${sanitizedFileProvider}_recon.xlsx`)
        await providerWorkbook.xlsx.writeFile(providerFilePath)
      }

      results.push({
        file: reconFile,
        success: true,
        message: `Processed and saved to ${outputDir}`,
        path: outputDir
      })
    } catch (error) {
      console.error(`Error processing file ${reconFile}:`, error)
      results.push({
        file: reconFile,
        success: false,
        message: `Error: ${error.message}`
      })
    }
  }

  return {
    success: results.every((r) => r.success),
    message: `Processed ${results.length} file(s). ${
      results.filter((r) => r.success).length
    } successful.`,
    details: results
  }
})

// insert action column
// insert "CLOSE_ROUND" or "CANCEL_ROUND" for Playson GP
// Offer controls/switches to do classic recon or custom recon (keep certain GPs)
// Split sheet into new sheets by game providers, after desired settings. Create a folder with environment and previous month name. Move split sheets into the folder.

// connect to google sheets API to get game names and types

/*
 TODO: YGG and YAT games
 TOM, TOMM and TH2 games
 add if checks I guess
*/

// add more validation checks to game codes input

// return and display errors

// show icons in game card (actualy rework how data is sent to frontend entirely)
