import { HashRouter, Routes, Route } from 'react-router-dom'

import { UploadFolderProvider } from './contexts/UploadFolderContext'
import { AuthProvider } from './contexts/AuthContext'

import Login from './pages/Login'
import ProtectedRoute from './pages/ProtectedRoute'
import AppLayout from './pages/AppLayout'
import Dashboard from './components/Dashboard/Dashboard'
import Games from './components/Games/Games'
import GameCodes from './components/GameCodes/GameCodes'
import WeeklyReport from './components/WeeklyReport/WeeklyReport'

function App() {
  return (
    <AuthProvider>
      <UploadFolderProvider>
        <HashRouter>
          <Routes>
            <Route index path="/" element={<Login />} />
            <Route
              path="app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard replace to="dashboard" />} />
              <Route index path="dashboard" element={<Dashboard />} />
              <Route path="games" element={<Games />} />
              <Route path="gameCodes" element={<GameCodes />} />
              <Route path="weeklyReport" element={<WeeklyReport />} />
            </Route>
          </Routes>
        </HashRouter>
      </UploadFolderProvider>
    </AuthProvider>
  )
}

export default App
