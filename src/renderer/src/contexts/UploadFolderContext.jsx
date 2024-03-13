import { createContext, useContext, useEffect, useReducer } from 'react'

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
    const uploadFolderData = await window.api.receiveGameCodes(gameCodes)
    dispatch({ type: 'foldersRead', payload: uploadFolderData })
  }

  // calls the main process to delete the folder, then updates the state
  async function deleteFolder(folderName) {
    await window.api.deleteGameCodes(folderName)
    dispatch({ type: 'folderDelete', payload: folderName })
  }

  return (
    <UploadFolderContext.Provider value={{ state, storeGameCodes, deleteFolder }}>
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
