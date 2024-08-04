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

  // calls the main process to store the game codes, create folders
  async function storeGameCodes(gameCodes) {
    await window.api.storeGameCodes(gameCodes)
    // cant find a better way to update state immediately for now...
    setTimeout(readFolders, 1000)
  }

  // calls the main process to delete the folder, then updates the state
  async function deleteFolder(folderName) {
    await window.api.deleteGameCodes(folderName)
    dispatch({ type: 'folderDelete', payload: folderName })
  }

  async function readFolders() {
    const gameCodes = await window.api.readGameCodes()

    const stateIds = state.map((game) => game.id)
    const gameCodeIds = gameCodes.map((game) => game.id)

    console.log(stateIds, gameCodeIds)

    const isDifferent =
      gameCodeIds.some((id) => !stateIds.includes(id)) ||
      stateIds.some((id) => !gameCodeIds.includes(id))

    if (isDifferent) {
      dispatch({ type: 'foldersRead', payload: gameCodes })
    }
  }

  async function checkIconsInBrowser() {
    await window.api.openIconUrls()
  }

  async function editGameInfo(id, editedValues) {
    await window.api.editGameInfo(id, editedValues)
  }

  return (
    <UploadFolderContext.Provider
      value={{
        state,
        storeGameCodes,
        deleteFolder,
        readFolders,
        checkIconsInBrowser,
        editGameInfo
      }}
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
