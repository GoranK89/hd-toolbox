import { useState, useEffect } from 'react'

const GeneratedFolders = ({ storedGameCodes }) => {
  const [folderData, setFolderData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.api.uploadFolderContent()
      setFolderData(data)
    }

    fetchData()
  }, [storedGameCodes])

  const deleteHandler = async () => {
    console.log('DELETE folder')
  }

  return (
    <div className="generated-folders">
      {folderData.map((item, index) => (
        <div className="generated-folders__container" key={index}>
          <div className="generated-folders__container-description">
            <h2>{item.folder}</h2>
            <p>{item.gameEnText[1].split('=').pop()}</p>
            <p className={item.iconExists ? 'icons-ok' : 'icons-check'}>
              {item.iconExists ? 'Icons OK' : 'Check icons'}
            </p>
          </div>
          <button className="btn-delete" onClick={deleteHandler}>
            DELETE
          </button>
        </div>
      ))}
    </div>
  )
}

export default GeneratedFolders
