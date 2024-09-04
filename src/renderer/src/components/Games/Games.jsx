import GameCodesForm from './GameCodesForm'
import GeneratedFolders from './GeneratedFolders'
import backgroundImage from '../../assets/backgroundMuted.png'

function Games() {
  return (
    <div className="games-grid" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <GameCodesForm />
      <GeneratedFolders />
    </div>
  )
}

export default Games
