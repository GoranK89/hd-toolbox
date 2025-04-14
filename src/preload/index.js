import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  storeGameCodes: (gameCodes) => {
    return ipcRenderer.invoke('storeGameCodes', gameCodes)
  },
  deleteGameCodes: (gameCodes) => {
    return ipcRenderer.invoke('deleteGameCodes', gameCodes)
  },
  readGameCodes: () => {
    return ipcRenderer.invoke('readGameCodes')
  },
  openIconUrls: () => {
    return ipcRenderer.invoke('openIconUrls')
  },
  editGameInfo: (id, editedValues) => {
    return ipcRenderer.invoke('editGameInfo', id, editedValues)
  },
  transferIcons: () => {
    ipcRenderer.send('transferIcons')
  },
  getImagePaths: () => {
    return ipcRenderer.invoke('getImagePaths')
  },
  refreshIconStatus: () => {
    return ipcRenderer.invoke('refreshIconStatus')
  },
  reconFormatSheet: () => {
    return ipcRenderer.invoke('reconFormatSheet')
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
