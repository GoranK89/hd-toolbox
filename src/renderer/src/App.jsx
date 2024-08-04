import { HashRouter, Routes, Route } from 'react-router-dom'

import { UploadFolderProvider } from './contexts/UploadFolderContext'

import AppLayout from './pages/AppLayout'
import Games from './components/Games/Games'
import GameCodes from './components/GameCodes/GameCodes'
import TaskHelper from './components/TaskHelper/TaskHelper'

function App() {
  return (
    <UploadFolderProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index path="app" element={<Games />} />
            <Route index element={<Games replace to="games" />} />
            <Route path="games" element={<Games />} />
            <Route path="gameCodes" element={<GameCodes />} />
            <Route path="taskHelper" element={<TaskHelper />} />
          </Route>
        </Routes>
      </HashRouter>
    </UploadFolderProvider>
  )
}

export default App
