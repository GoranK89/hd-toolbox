import { app } from 'electron'
import path from 'path'

const desktopPath = app.getPath('desktop')
const BASE_PATH = path.join(desktopPath, 'New Upload')
const NEW_UPLOAD_PATH = BASE_PATH
const JSON_PATH = path.join(BASE_PATH, 'gameCodes.json')

export { BASE_PATH, NEW_UPLOAD_PATH, JSON_PATH }
