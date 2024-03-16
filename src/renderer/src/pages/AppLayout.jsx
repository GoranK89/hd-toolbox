import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <Outlet />
    </div>
  )
}

export default AppLayout
