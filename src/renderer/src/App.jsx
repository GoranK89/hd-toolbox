import { HashRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar/Navbar'
import Dashboard from './components/Dashboard/Dashboard'
import Games from './components/Games/Games'

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route index path="/" element={<Dashboard />} />
        <Route path="games" element={<Games />} />
      </Routes>
    </HashRouter>
  )
}

export default App
