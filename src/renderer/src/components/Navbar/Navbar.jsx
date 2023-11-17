import { useState } from 'react'

function Navbar(props) {
  const [active, setActive] = useState('dashboard')

  const toggleActive = (item) => {
    setActive(item)
    props.onSelect(item)
  }

  return (
    <ul className="navbar">
      <li
        className={`navbar__item ${active === 'dashboard' ? 'navbar__item--active' : ''}`}
        onClick={() => toggleActive('dashboard')}
      >
        Dashboard
      </li>
      <li
        className={`navbar__item ${active === 'games' ? 'navbar__item--active' : ''}`}
        onClick={() => toggleActive('games')}
      >
        Games
      </li>
      <li
        className={`navbar__item ${active === 'other' ? 'navbar__item--active' : ''}`}
        onClick={() => toggleActive('other')}
      >
        Another one
      </li>
    </ul>
  )
}

export default Navbar
