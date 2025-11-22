import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { TaxFormProvider } from './contexts/TaxFormContext'

// Layout Components
import Layout from './components/Layout/Layout'
import PrivateRoute from './components/Auth/PrivateRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TaxFormSelectionPage from './pages/TaxFormSelectionPage'
import TaxFormInputPage from './pages/TaxFormInputPage'
import DocumentUploadPage from './pages/DocumentUploadPage'
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaxFormProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } />
              <Route path="/forms" element={
                <PrivateRoute>
                  <TaxFormSelectionPage />
                </PrivateRoute>
              } />
              <Route path="/forms/:formId/input" element={
                <PrivateRoute>
                  <TaxFormInputPage />
                </PrivateRoute>
              } />
              <Route path="/forms/:formId/upload" element={
                <PrivateRoute>
                  <DocumentUploadPage />
                </PrivateRoute>
              } />
              <Route path="/forms/:formId/review" element={
                <PrivateRoute>
                  <ReviewPage />
                </PrivateRoute>
              } />
              <Route path="/history" element={
                <PrivateRoute>
                  <HistoryPage />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />

              {/* 404 */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Layout>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </TaxFormProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

