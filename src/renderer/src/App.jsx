import { HashRouter, Routes, Route } from 'react-router-dom'

import { UploadFolderProvider } from './contexts/UploadFolderContext'
import { AuthProvider } from './contexts/AuthContext'

import AppLayout from './pages/AppLayout'
import Dashboard from './components/Dashboard/Dashboard'
import Games from './components/Games/Games'
import Login from './pages/Login'
import ProtectedRoute from './pages/ProtectedRoute'

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
            </Route>
          </Routes>
        </HashRouter>
      </UploadFolderProvider>
    </AuthProvider>
  )
}

export default App
