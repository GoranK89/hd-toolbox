import { NavLink } from 'react-router-dom'
import { GiInvertedDice5 } from 'react-icons/gi'
import { MdOutlineDashboard } from 'react-icons/md'

function Sidebar() {
  return (
    <ul className="navbar">
      <li>
        <div>TOOLBOX</div>
      </li>
      <li>
        <NavLink className="navbar__item" to="dashboard">
          <MdOutlineDashboard />
          <span>Dashboard</span>
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="games">
          <GiInvertedDice5 />
          <span>Games</span>
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

export default Sidebar
