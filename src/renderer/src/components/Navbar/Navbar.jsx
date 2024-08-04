import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <ul className="navbar">
      <li>
        <div>HD Toolbox</div>
      </li>
      <li>
        <NavLink className="navbar__item" to="games">
          Games
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="gameCodes">
          Generate Codes
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="taskHelper">
          Task Helper
        </NavLink>
      </li>
    </ul>
  )
}

export default Navbar
