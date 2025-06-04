import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs'
import { RECON_PATH } from '../utils/pathUtils.js'

async function createReconFolder() {
  try {
    if (!fs.existsSync(RECON_PATH)) {
      console.log('Recon folder not found, creating it...')
      fs.mkdirSync(RECON_PATH, { recursive: true })
      console.log('Recon folder created successfully at:', RECON_PATH)
      return {
        success: true,
        message: 'Recon folder created and is ready.',
        path: RECON_PATH,
        created: true
      }
    } else {
      console.log('Recon folder already exists at:', RECON_PATH)
      return {
        success: true,
        message: 'Recon folder already exists and is ready.',
        path: RECON_PATH,
        created: false
      }
    }
  } catch (error) {
    console.error('Error accessing or creating recon folder:', error)
    throw new Error(`Failed to create or access recon folder at ${RECON_PATH}: ${error.message}`)
  }
}

async function formatReconSheet() {
  const inputFiles = fs.readdirSync(RECON_PATH)
  const reconFiles = inputFiles.filter((file) => file.toLowerCase().includes('.csv'))

  if (reconFiles.length === 0) {
    return {
      success: false,
      message: `No .csv files found in the recon folder: ${RECON_PATH}. Please add CSV files.`,
      data: {
        reconPath: RECON_PATH,
        totalFilesAttempted: 0,
        successfulFiles: 0,
        failedFiles: 0,
        generatedProviderSheets: []
      }
    }
  }

  const overallProcessingStats = {
    reconPath: RECON_PATH,
    totalFilesAttempted: reconFiles.length,
    successfulFiles: 0,
    failedFiles: 0,
    generatedProviderSheets: [],
    errors: []
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
      } else if (playerIdSamples.some((id) => id.startsWith('809-'))) {
        envSuffix = 'PROD_BEHR'
      } else if (playerIdSamples.some((id) => id.startsWith('979-'))) {
        envSuffix = 'PROD_BNHR'
      } else if (playerIdSamples.some((id) => id.startsWith('978-'))) {
        envSuffix = 'PROD_COHR'
      } else if (playerIdSamples.some((id) => id.startsWith('848-'))) {
        envSuffix = 'PROD_CRHR'
      } else if (playerIdSamples.some((id) => id.startsWith('911-'))) {
        envSuffix = 'PROD_MEHR'
      } else if (playerIdSamples.some((id) => id.startsWith('1270-'))) {
        envSuffix = 'PROD_KBHR'
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
        const providerFilePath = path.join(
          outputDir,
          `${sanitizedFileProvider}_${monthName}_${year}_recon.csv`
        )
        await providerWorkbook.csv.writeFile(providerFilePath)
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
}

export { createReconFolder, formatReconSheet }
