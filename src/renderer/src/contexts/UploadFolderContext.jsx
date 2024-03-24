import { createContext, useContext, useReducer } from 'react'

const UploadFolderContext = createContext()

const initialState = []

function reducer(state, action) {
  switch (action.type) {
    case 'foldersRead':
      return [...action.payload]

    case 'folderDelete':
      return state.filter((folder) => folder.folder !== action.payload)

    default:
      throw new Error('Unknown action type')
  }
}

function UploadFolderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // calls the main process to store the game codes, create folders and also receive folder contents
  async function storeGameCodes(gameCodes) {
    await window.api.storeGameCodes(gameCodes)
  }

  async function readGameCodes() {
    const gameCodes = await window.api.readGameCodes()
    dispatch({ type: 'foldersRead', payload: gameCodes })
  }

  // calls the main process to delete the folder, then updates the state
  async function deleteFolder(folderName) {
    await window.api.deleteGameCodes(folderName)
    dispatch({ type: 'folderDelete', payload: folderName })
  }

  async function checkIconsInBrowser() {
    await window.api.openIconUrls()
  }

  return (
    <UploadFolderContext.Provider
      value={{ state, storeGameCodes, readGameCodes, deleteFolder, checkIconsInBrowser }}
    >
      {children}
    </UploadFolderContext.Provider>
  )
}

function useUploadFolder() {
  const context = useContext(UploadFolderContext)
  if (context === undefined) throw new Error('UploadFolderContext was used outside of its provider')
  return context
}

export { UploadFolderProvider, useUploadFolder }
