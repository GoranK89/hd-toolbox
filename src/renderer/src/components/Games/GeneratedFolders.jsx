import { FaTrash, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import { useUploadFolder } from '../../contexts/UploadFolderContext'
import { useEffect } from 'react'

const GeneratedFolders = () => {
  const { state, deleteFolder, readGameCodes } = useUploadFolder()

  // reload component when state changes
  useEffect(() => {
    readGameCodes()
  }, [state])

  return (
    <div className="generated-folders">
      {state.map((item) => (
        <div className="generated-folders__container" key={item.id}>
          <div className="generated-folders__container-description">
            <span>
              <h2>{item.id}</h2>
            </span>
            <p>{item.name}</p>
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
