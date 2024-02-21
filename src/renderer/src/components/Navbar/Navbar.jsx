import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <ul className="navbar">
      <li>
       <NavLink className='navbar__item' to="/">Dashboard</NavLink>
      </li>
      <li>
       <NavLink className='navbar__item' to="games">Games</NavLink>
      </li>
    </ul>
  )
}

export default Navbar
