import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Grain from '../ui/Grain'
import FeatherCursor from '../ui/FeatherCursor'

export default function Layout() {
  return (
    <>
      <Grain />
      <FeatherCursor />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
