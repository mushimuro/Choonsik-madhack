import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { FiFileText, FiPlus, FiClock, FiCheckCircle } from 'react-icons/fi'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'
import { formatDate } from '../utils/helpers'
import { FORM_STATUS_LABELS } from '../constants/taxForms'
import './DashboardPage.css'

const DashboardPage = () => {
  const { currentUser } = useAuth()
  const { getUserForms } = useTaxForm()
  const [recentForms, setRecentForms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentForms()
  }, [])

  const loadRecentForms = async () => {
    try {
      setLoading(true)
      const forms = await getUserForms(currentUser.uid)
      
      // Transform GCP bucket data to match the expected format
      const transformedForms = forms.map(form => ({
        id: form.formId,
        formName: form.latestFormData?.metadata?.formName || 'Unknown Form',
        formType: form.latestFormData?.metadata?.formType || 'unknown',
        status: form.latestFormData?.metadata?.status || 'draft',
        createdAt: {
          toDate: () => new Date(form.latestFormData?.metadata?.timestamp || Date.now())
        },
        totalFiles: form.totalFiles,
      }))
      
      setRecentForms(transformedForms.slice(0, 5))
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'filed':
        return <FiCheckCircle className="status-icon success" />
      default:
        return <FiClock className="status-icon pending" />
    }
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {currentUser?.displayName || 'User'}!</h1>
            <p className="dashboard-subtitle">
              Manage your tax forms and track your filing progress
            </p>
          </div>
          <Link to="/forms">
            <Button variant="primary" icon={<FiPlus />}>
              New Tax Form
            </Button>
          </Link>
        </div>

        <div className="dashboard-grid">
          {/* Quick Stats */}
          <div className="stats-section">
            <Card title="Quick Stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{recentForms.length}</div>
                  <div className="stat-label">Total Forms</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {recentForms.filter(f => f.status === 'completed' || f.status === 'filed').length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {recentForms.filter(f => f.status === 'draft' || f.status === 'in_progress').length}
                  </div>
                  <div className="stat-label">In Progress</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Forms */}
          <div className="recent-forms-section">
            <Card 
              title="Recent Forms"
              subtitle="Your most recently accessed tax forms"
            >
              {loading ? (
                <Loading message="Loading forms..." />
              ) : recentForms.length > 0 ? (
                <div className="forms-list">
                  {recentForms.map((form) => (
                    <div key={form.id} className="form-item">
                      <div className="form-item-icon">
                        <FiFileText />
                      </div>
                      <div className="form-item-content">
                        <h4 className="form-item-title">{form.formName}</h4>
                        <p className="form-item-meta">
                          Created {formatDate(form.createdAt?.toDate())}
                        </p>
                      </div>
                      <div className="form-item-status">
                        {getStatusIcon(form.status)}
                        <span>{FORM_STATUS_LABELS[form.status]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FiFileText className="empty-icon" />
                  <p>No forms yet</p>
                  <Link to="/forms">
                    <Button variant="outline" size="small">
                      Create Your First Form
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <Card title="Quick Actions">
              <div className="actions-list">
                <Link to="/forms" className="action-item">
                  <FiPlus className="action-icon" />
                  <div>
                    <h4>Start New Form</h4>
                    <p>Fill out a new tax form</p>
                  </div>
                </Link>
                <Link to="/history" className="action-item">
                  <FiFileText className="action-icon" />
                  <div>
                    <h4>View History</h4>
                    <p>See all your forms</p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

