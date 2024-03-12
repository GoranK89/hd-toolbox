import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  receiveGameCodes: (gameCodes) => {
    return ipcRenderer.invoke('receiveGameCodes', gameCodes)
  },
  deleteGameCodes: (gameCodes) => {
    ipcRenderer.send('deleteGameCodes', gameCodes)
  },
  uploadFolderContent: () => {
    return ipcRenderer.invoke('uploadFolderContent')
  },
  readSymLinks: (gameCode) => {
    return ipcRenderer.invoke('readSymLinks', gameCode)
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
