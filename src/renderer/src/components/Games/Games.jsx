import { useState } from 'react'
import GameCodesForm from './GameCodesForm'
import GeneratedFolders from './GeneratedFolders'

function Games() {
  const [storedGameCodes, setStoredGameCodes] = useState([])

  const handleSubmitedGameCodes = (codes) => {
    setStoredGameCodes(codes)
  }

  return (
    <div className="games-grid">
      <GameCodesForm onGameCodesSubmit={handleSubmitedGameCodes} />
      <GeneratedFolders storedGameCodes={storedGameCodes} />
    </div>
  )
}

export default Games
