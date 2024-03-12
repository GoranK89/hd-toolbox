import { HashRouter, Routes, Route } from 'react-router-dom'

import { UploadFolderProvider } from './contexts/UploadFolderContext'

import Navbar from './components/Navbar/Navbar'
import Dashboard from './components/Dashboard/Dashboard'
import Games from './components/Games/Games'

function App() {
  return (
    <UploadFolderProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route index path="/" element={<Dashboard />} />
          <Route path="games" element={<Games />} />
        </Routes>
      </HashRouter>
    </UploadFolderProvider>
  )
}

export default App
