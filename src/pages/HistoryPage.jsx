import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { FiFileText, FiDownload, FiTrash2 } from 'react-icons/fi'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'
import { formatDate } from '../utils/helpers'
import { FORM_STATUS_LABELS } from '../constants/taxForms'
import './HistoryPage.css'

const HistoryPage = () => {
  const { currentUser } = useAuth()
  const { getUserForms } = useTaxForm()
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const userForms = await getUserForms(currentUser.uid)
      setForms(userForms)
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredForms = forms.filter((form) => {
    if (filter === 'all') return true
    return form.status === filter
  })

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
      case 'filed':
        return 'status-success'
      case 'in_progress':
        return 'status-warning'
      case 'draft':
        return 'status-info'
      default:
        return ''
    }
  }

  return (
    <div className="history-page">
      <div className="container">
        <div className="page-header">
          <h1>Form History</h1>
          <p className="page-subtitle">
            View and manage all your tax forms in one place
          </p>
        </div>

        <div className="filter-bar">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setFilter('all')}
          >
            All Forms
          </Button>
          <Button
            variant={filter === 'draft' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setFilter('draft')}
          >
            Drafts
          </Button>
          <Button
            variant={filter === 'in_progress' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>

        {loading ? (
          <Loading message="Loading your forms..." />
        ) : filteredForms.length > 0 ? (
          <div className="forms-grid">
            {filteredForms.map((form) => (
              <Card key={form.id} hoverable>
                <div className="history-form-card">
                  <div className="form-icon">
                    <FiFileText />
                  </div>
                  <div className="form-content">
                    <h3 className="form-title">{form.formName}</h3>
                    <p className="form-type">{form.formType}</p>
                    <div className="form-meta">
                      <span
                        className={`form-status ${getStatusClass(form.status)}`}
                      >
                        {FORM_STATUS_LABELS[form.status]}
                      </span>
                      <span className="form-date">
                        {formatDate(form.createdAt?.toDate())}
                      </span>
                    </div>
                  </div>
                  <div className="form-actions">
                    <Button
                      variant="outline"
                      size="small"
                      icon={<FiDownload />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="empty-state">
              <FiFileText className="empty-icon" />
              <h3>No forms found</h3>
              <p>
                {filter === 'all'
                  ? "You haven't created any forms yet."
                  : `No forms with status "${FORM_STATUS_LABELS[filter]}"`}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default HistoryPage

