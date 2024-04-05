import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  storeGameCodes: (gameCodes) => {
    ipcRenderer.send('storeGameCodes', gameCodes)
  },
  deleteGameCodes: (gameCodes) => {
    ipcRenderer.send('deleteGameCodes', gameCodes)
  },
  readGameCodes: () => {
    return ipcRenderer.invoke('readGameCodes')
  },
  openIconUrls: () => {
    return ipcRenderer.invoke('openIconUrls')
  },
  editGameInfo: (id, editedValues) => {
    ipcRenderer.send('editGameInfo', id, editedValues)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
