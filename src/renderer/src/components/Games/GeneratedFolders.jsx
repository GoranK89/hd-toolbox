import { useState, useEffect } from 'react'
import { FaTrash, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'

const GeneratedFolders = () => {
  const [folderData, setFolderData] = useState([])
  const [symlinkData, setSymlinkData] = useState([])
  const [openModalIndex, setOpenModalIndex] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.api.uploadFolderContent()
      setFolderData(data)
    }

    fetchData()

    const fileChangeHandler = () => {
      fetchData()
    }

    window.api.subscribeToJsonChanges(fileChangeHandler)

    // clean up listener
    return () => {
      window.api.unsubscribeToJsonChanges(fileChangeHandler)
    }
  }, [])

  const deleteHandler = async (folderName) => {
    window.api.deleteGameCodes(folderName)
  }

  // Modal handling
  const openModal = (index) => {
    setOpenModalIndex(index)
  }

  const closeModal = () => {
    setOpenModalIndex(null)
  }

  const associatedLinksHandler = async (index, folderName) => {
    openModal(index)
    const data = await window.api.readSymLinks(folderName)
    setSymlinkData(data)
  }

  return (
    <div className="generated-folders">
      {folderData.map((item, index) => (
        <div className="generated-folders__container" key={index}>
          <div className="generated-folders__container-description">
            <span>
              <h2>{item.folder}</h2>
              <a href="#" onClick={() => associatedLinksHandler(index, item.folder)}>
                <FaExternalLinkAlt />
              </a>
              {openModalIndex === index && (
                <div className="modal">
                  <div className="modal__title">
                    <h4>Links & Symlinks:</h4>
                    <button onClick={closeModal}>
                      <FaTimes />
                    </button>
                  </div>
                  <ul>
                    {symlinkData.map((item, index) => (
                      <li key={index}>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </span>
            <p>{item.gameEnText[1].split('=').pop()}</p>
            <p className={item.iconExists ? 'icons-ok' : 'icons-check'}>
              {item.iconExists ? 'Icons OK' : 'Icons missing'}
            </p>
          </div>
          <button className="btn-delete" onClick={() => deleteHandler(item.folder)}>
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  )
}

export default GeneratedFolders
