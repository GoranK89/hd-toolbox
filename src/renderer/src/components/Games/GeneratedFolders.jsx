import { FaTrash, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import { useUploadFolder } from '../../contexts/UploadFolderContext'
import { useEffect, useState } from 'react'

const GeneratedFolders = () => {
  const { state, deleteFolder, readFolders, editGameInfo } = useUploadFolder()
  const [editedValues, setEditedValues] = useState({})
  const [editingId, setEditingId] = useState(null)

  function handleInputChange(id, key, value) {
    setEditedValues((previousValues) => ({
      ...previousValues,
      [id]: {
        ...previousValues[id],
        [key]: value
      }
    }))
  }

  useEffect(() => {
    readFolders()
  }, [state])

  console.log('reloading game folders...')

  function handleEdit(id) {
    setEditingId(id)
  }

  async function handleSave(id) {
    await editGameInfo(id, editedValues[id])
    console.log(`Game info for game code ${id} saved:`, editedValues[id])
    setEditingId(null)
  }

  return (
    <div className="generated-folders">
      {state?.map((item) => (
        <div className="generated-folders__container" key={item.id}>
          <div className="generated-folders__container-description">
            <h2>{item.id}</h2>
            {editingId === item.id ? (
              <>
                <input
                  type="text"
                  value={editedValues[item.id]?.name || item.name}
                  onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                />
                <input
                  type="text"
                  value={editedValues[item.id]?.type || item.type}
                  onChange={(e) => handleInputChange(item.id, 'type', e.target.value)}
                />
                <button onClick={() => handleSave(item.id)}>SAVE</button>
              </>
            ) : (
              <>
                <p>{item.name}</p>
                <p>{item.type}</p>
                <button onClick={() => handleEdit(item.id)}>EDIT</button>
              </>
            )}

            <p className={item.iconsExist ? 'icons-ok' : 'icons-check'}>
              {item.iconsExist ? 'Icons OK' : 'Icons missing'}
            </p>
          </div>
          <button className="btn-delete" onClick={() => deleteFolder(item.id)}>
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  )
}

export default GeneratedFolders
