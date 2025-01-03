import { useEffect, useState } from 'react'
import { useUploadFolder } from '../../contexts/UploadFolderContext'

function Dashboard() {
  const { getImagePaths } = useUploadFolder()
  const [imagePaths, setImagePaths] = useState([])

  useEffect(() => {
    const fetchImagePaths = async () => {
      const paths = await getImagePaths()
      setImagePaths(paths)
    }

    fetchImagePaths()
  }, [])

  // Group images by folder
  const groupedImages = imagePaths.reduce((acc, image) => {
    if (!acc[image.folder]) {
      acc[image.folder] = []
    }
    acc[image.folder].push(image)
    return acc
  }, {})

  return (
    <div className="dashboard">
      <h2>Game Icons Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Folder</th>
            <th>Icons</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedImages).map((folder) => (
            <tr key={folder}>
              <td>{folder}</td>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {groupedImages[folder].map((image, index) => (
                    <img
                      key={index}
                      src={image.dataUrl}
                      alt={`Game Icon ${index}`}
                      style={{ margin: '5px', width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard
