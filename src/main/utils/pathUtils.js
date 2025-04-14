import { app } from 'electron'
import path from 'path'

const desktopPath = app.getPath('desktop')
const downloadsPath = app.getPath('downloads')
const BASE_PATH = path.join(desktopPath, 'New Upload')
const JSON_PATH = path.join(BASE_PATH, 'gameCodes.json')
const MATERIALS_PATH = path.join(downloadsPath)

const RECON_PATH = path.join(desktopPath, 'Recon')

export { MATERIALS_PATH, BASE_PATH, JSON_PATH, RECON_PATH }
