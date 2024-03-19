import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <ul className="navbar">
      <li>
        <div>HD Toolbox</div>
      </li>
      <li>
        <NavLink end className="navbar__item" to="dashboard">
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="games">
          Games
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="gameCodes">
          Game Codes
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="weeklyReport">
          Weekly Report
        </NavLink>
      </li>
    </ul>
  )
}

export default Navbar
