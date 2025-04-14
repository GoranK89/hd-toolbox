import { NavLink } from 'react-router-dom'
import { BsDice5 } from 'react-icons/bs'
import { BsArrowRepeat } from 'react-icons/bs'
import { BsLayoutWtf } from 'react-icons/bs'
import { BsLifePreserver } from 'react-icons/bs'

function Sidebar() {
  return (
    <ul className="navbar">
      <li>
        <div>TOOLBOX</div>
      </li>
      <li>
        <NavLink className="navbar__item" to="dashboard">
          <BsLayoutWtf />
          <span>Dashboard</span>
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="games">
          <BsDice5 />
          <span>Games</span>
        </NavLink>
      </li>
      <li>
        <NavLink className="navbar__item" to="gameCodes">
          <BsArrowRepeat />
          Game Codes
        </NavLink>
      </li>
      {/* <li>
        <NavLink className="navbar__item" to="taskHelper">
          <BsLifePreserver />
          Task Helper
        </NavLink>
      </li> */}
      <li>
        <NavLink className="navbar__item" to="reconAsistant">
          Recon Assistant
        </NavLink>
      </li>
    </ul>
  )
}

export default Sidebar
