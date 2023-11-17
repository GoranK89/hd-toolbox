import { useState } from 'react'

import Navbar from './components/Navbar/Navbar'
import Dashboard from './components/Dashboard/Dashboard'
import Games from './components/Games/Games'

function App() {
  const [active, setActive] = useState('dashboard')

  const setNavbarState = (state) => {
    setActive(state)
  }

  return (
    <>
      <Navbar onSelect={setNavbarState} />
      {active === 'dashboard' && <Dashboard />}
      {active === 'games' && <Games />}
    </>
  )
}

export default App
