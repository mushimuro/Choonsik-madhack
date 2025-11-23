import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FiLogOut, FiUser, FiFileText, FiHome, FiCheckSquare, FiSearch } from 'react-icons/fi'
import './Header.css'

const Header = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <FiFileText className="logo-icon" />
          <span>WI Tax Filler</span>
        </Link>

        <nav className="nav">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <FiHome />
                <span>Dashboard</span>
              </Link>
              <Link to="/forms" className="nav-link">
                <FiFileText />
                <span>New Form</span>
              </Link>
              <Link to="/history" className="nav-link">
                <FiFileText />
                <span>History</span>
              </Link>
              <Link to="/check-templates" className="nav-link">
                <FiCheckSquare />
                <span>Check PDFs</span>
              </Link>
              <Link to="/pdf-inspector" className="nav-link">
                <FiSearch />
                <span>Inspect Fields</span>
              </Link>
              <Link to="/profile" className="nav-link">
                <FiUser />
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <FiLogOut />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header

