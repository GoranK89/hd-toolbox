import { useState } from 'react'

import Navbar from './components/Navbar/Navbar'
import Dashboard from './components/Dashboard/Dashboard'
import Games from './components/Games/Games'

function App() {
  const [active, setActive] = useState('dashboard')

  const setNavbarState = (state) => {
    setActive(state)
  }

  // NOTE: the games component has mounting and unmounting issues, react router should solve that, currently this is a workaround
  return (
    <>
      <Navbar onSelect={setNavbarState} />
      {active === 'dashboard' && <Dashboard />}
      <div style={{ display: active === 'games' ? 'block' : 'none' }}>
        <Games />
      </div>
    </>
  )
}

export default App
