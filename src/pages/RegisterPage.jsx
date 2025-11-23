import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import Input from '../components/Common/Input'
import Button from '../components/Common/Button'
import Card from '../components/Common/Card'
import Header from '../components/Layout/Header'
import './AuthPages.css'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.displayName) {
      newErrors.displayName = 'Name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      await register(formData.email, formData.password, formData.displayName)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Header />
      <div className="auth-page">
        <div className="container auth-container">
          <Card className="auth-card">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Sign up to start filing your tax forms</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Full Name"
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                error={errors.displayName}
                touched={true}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                touched={true}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                touched={true}
                placeholder="Enter your password (min 6 characters)"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                touched={true}
                placeholder="Confirm your password"
                required
              />

              <div className="auth-actions">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                >
                  Create Account
                </Button>
              </div>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign In
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default RegisterPage

