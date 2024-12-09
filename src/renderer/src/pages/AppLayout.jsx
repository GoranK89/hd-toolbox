import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Navbar/Sidebar'

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <Outlet />
    </div>
  )
}

export default AppLayout
