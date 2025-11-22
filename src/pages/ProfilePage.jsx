import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import Card from '../components/Common/Card'
import Input from '../components/Common/Input'
import Button from '../components/Common/Button'
import { FiUser, FiMail, FiLock } from 'react-icons/fi'
import './ProfilePage.css'

const ProfilePage = () => {
  const { currentUser, updateProfile, updateEmail, updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
  })
  const [emailData, setEmailData] = useState({
    newEmail: currentUser?.email || '',
    currentPassword: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await updateProfile({ displayName: profileData.displayName })
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    if (!emailData.currentPassword) {
      toast.error('Please enter your current password')
      return
    }
    try {
      setLoading(true)
      await updateEmail(emailData.newEmail, emailData.currentPassword)
      toast.success('Email updated successfully!')
      setEmailData({ ...emailData, currentPassword: '' })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      setLoading(true)
      await updatePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Profile Settings</h1>
          <p className="page-subtitle">
            Manage your account information and security settings
          </p>
        </div>

        <div className="profile-grid">
          <Card title="Account Information" className="profile-card">
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-icon">
                <FiUser />
              </div>
              <Input
                label="Display Name"
                type="text"
                value={profileData.displayName}
                onChange={(e) =>
                  setProfileData({ ...profileData, displayName: e.target.value })
                }
                placeholder="Enter your name"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Update Profile
              </Button>
            </form>
          </Card>

          <Card title="Email Address" className="profile-card">
            <form onSubmit={handleEmailUpdate} className="profile-form">
              <div className="form-icon">
                <FiMail />
              </div>
              <Input
                label="New Email"
                type="email"
                value={emailData.newEmail}
                onChange={(e) =>
                  setEmailData({ ...emailData, newEmail: e.target.value })
                }
                placeholder="Enter new email"
              />
              <Input
                label="Current Password"
                type="password"
                value={emailData.currentPassword}
                onChange={(e) =>
                  setEmailData({ ...emailData, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Update Email
              </Button>
            </form>
          </Card>

          <Card title="Change Password" className="profile-card">
            <form onSubmit={handlePasswordUpdate} className="profile-form">
              <div className="form-icon">
                <FiLock />
              </div>
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

