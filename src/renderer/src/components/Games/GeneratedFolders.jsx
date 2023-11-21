import { useState, useEffect } from 'react'

const GeneratedFolders = () => {
  const [folderData, setFolderData] = useState([])
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

  const associatedLinksHandler = (index) => {
    openModal(index)
  }

  return (
    <div className="generated-folders">
      {folderData.map((item, index) => (
        <div className="generated-folders__container" key={index}>
          <div className="generated-folders__container-description">
            <span>
              <h2>{item.folder}</h2>
              <a href="#" onClick={() => associatedLinksHandler(index)}>
                SL
              </a>
              {openModalIndex === index && (
                <div className="modal">
                  <button onClick={closeModal}>Close</button>
                  <div>Modal content goes here</div>
                </div>
              )}
            </span>
            <p>{item.gameEnText[1].split('=').pop()}</p>
            <p className={item.iconExists ? 'icons-ok' : 'icons-check'}>
              {item.iconExists ? 'Icons OK' : 'Icons missing'}
            </p>
          </div>
          <button className="btn-delete" onClick={() => deleteHandler(item.folder)}>
            DELETE
          </button>
        </div>
      ))}
    </div>
  )
}

export default GeneratedFolders
