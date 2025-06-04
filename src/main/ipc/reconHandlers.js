import { ipcMain } from 'electron'
import { formatReconSheet, createReconFolder } from '../services/reconService'

export function setupReconHandlers() {
  ipcMain.handle('reconFormatSheet', async () => {
    try {
      // 1.) create folder
      await createReconFolder()
      // 2.) split & format sheet
      await formatReconSheet()
      // 3.) create folders for env & create new sheets
    } catch (err) {
      console.log(err.message)
      return {
        success: false,
        error: err.message
      }
    }
  })
}

// insert action column
// insert "CLOSE_ROUND" or "CANCEL_ROUND" for Playson GP
// Offer controls/switches to do classic recon or custom recon (keep certain GPs)
// Split sheet into new sheets by game providers, after desired settings. Create a folder with environment and previous month name. Move split sheets into the folder.
