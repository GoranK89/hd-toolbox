import { FaTrash } from 'react-icons/fa'
import { useState, useMemo } from 'react'
import { useGames } from '../../hooks/useGames'

const GeneratedFolders = () => {
  const { folders, deleteFolder, editGameInfo } = useGames()
  const [editedValues, setEditedValues] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [showMissingIcons, setShowMissingIcons] = useState(false)

  function handleInputChange(id, key, value) {
    setEditedValues((previousValues) => ({
      ...previousValues,
      [id]: {
        ...previousValues[id],
        [key]: value
      }
    }))
  }

  function handleEdit(id) {
    setEditingId(id)
  }

  function handleSave(id) {
    editGameInfo(id, editedValues[id])
    setEditingId(null)
  }

  function toggleIconFilter() {
    setShowMissingIcons(!showMissingIcons)
  }

  // Use useMemo to calculate filtered folders only when needed
  const displayedFolders = useMemo(() => {
    if (!showMissingIcons) {
      return folders // Show all folders
    }
    // Only show folders with missing icons
    return folders?.filter((item) => item.iconsExist !== true)
  }, [folders, showMissingIcons])

  return (
    <div>
      <button
        className={`button button--small ${
          showMissingIcons ? 'button--secondary' : 'button--tertiary'
        }`}
        onClick={toggleIconFilter}
      >
        {showMissingIcons ? 'Show All Folders' : 'Show Missing Icons Only'}
      </button>
      <div className="generated-folders">
        {displayedFolders?.map((item) => (
          <div
            className={
              item.iconsExist
                ? 'generated-folders__background--ok'
                : 'generated-folders__background--missing'
            }
            key={item.id}
          >
            <div className="generated-folders__container">
              <div className="generated-folders__container-description">
                <h2>{item.id}</h2>
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editedValues[item.id]?.name || item.name}
                      onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                    />
                    <select
                      value={editedValues[item.id]?.type || item.type}
                      onChange={(e) => handleInputChange(item.id, 'type', e.target.value)}
                    >
                      <option value="SLOT">SLOT</option>
                      <option value="SIMPLE">SIMPLE</option>
                      <option value="CARD">CARD</option>
                      <option value="TABLE">TABLE</option>
                    </select>
                    <button
                      className="button button--small button--primary"
                      onClick={() => handleSave(item.id)}
                    >
                      SAVE
                    </button>
                  </>
                ) : (
                  <>
                    <p>{item.name}</p>
                    <p>{item.type}</p>
                    <button
                      className="button button--small button--primary"
                      onClick={() => handleEdit(item.id)}
                    >
                      EDIT
                    </button>
                  </>
                )}

                <p className={item.iconsExist ? 'icons-ok' : 'icons-check'}>
                  {item.iconsExist ? 'Icons OK' : 'Icons missing'}
                </p>
              </div>
              <button
                className="button button--small button--delete"
                onClick={() => deleteFolder(item.id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GeneratedFolders
