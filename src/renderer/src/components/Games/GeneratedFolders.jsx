import { useState, useEffect } from 'react'

const GeneratedFolders = () => {
  const [folderData, setFolderData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.api.uploadFolderContent()
      setFolderData(data)
    }

    fetchData()

    const fileChangeHandler = () => {
      fetchData()
    }

    console.log('Subscribing to jsonFileChanged')
    window.api.subscribeToJsonChanges(fileChangeHandler)

    // clean up listener
    return () => {
      console.log('Unsubscribing from jsonFileChanged')
      window.api.unsubscribeToJsonChanges(fileChangeHandler)
      console.log('GeneratedFolders unmounted')
    }
  }, [])

  const deleteHandler = async (folderName) => {
    window.api.deleteGameCodes(folderName)
  }

  return (
    <div className="generated-folders">
      {folderData.map((item, index) => (
        <div className="generated-folders__container" key={index}>
          <div className="generated-folders__container-description">
            <h2>{item.folder}</h2>
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
