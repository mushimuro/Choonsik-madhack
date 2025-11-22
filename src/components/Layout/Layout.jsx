import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  
  // Pages where we don't want the default layout
  const noLayoutPages = ['/login', '/register']
  const showLayout = !noLayoutPages.includes(location.pathname)

  if (!showLayout) {
    return <div className="app">{children}</div>
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout

