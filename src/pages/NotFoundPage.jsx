import { Link } from 'react-router-dom'
import Button from '../components/Common/Button'
import { FiHome } from 'react-icons/fi'
import './NotFoundPage.css'

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="large" icon={<FiHome />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

