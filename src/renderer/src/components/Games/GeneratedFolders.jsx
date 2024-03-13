import { FaTrash, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import { useUploadFolder } from '../../contexts/UploadFolderContext'

const GeneratedFolders = () => {
  const { state, deleteFolder } = useUploadFolder()

  return (
    <div className="generated-folders">
      {state.map((item, index) => (
        <div className="generated-folders__container" key={index}>
          <div className="generated-folders__container-description">
            <span>
              <h2>{item.folder}</h2>
            </span>
            <p>{item.gameEnText[1].split('=').pop()}</p>
            <p className={item.iconExists ? 'icons-ok' : 'icons-check'}>
              {item.iconExists ? 'Icons OK' : 'Icons missing'}
            </p>
          </div>
          <button className="btn-delete" onClick={() => deleteFolder(item.folder)}>
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  )
}

export default GeneratedFolders
