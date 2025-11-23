import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { FiFileText, FiDownload, FiTrash2, FiEdit } from 'react-icons/fi'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'
import { formatDate } from '../utils/helpers'
import { FORM_STATUS_LABELS } from '../constants/taxForms'
import './HistoryPage.css'

const HistoryPage = () => {
  const { currentUser } = useAuth()
  const { getUserForms, getUserDrafts } = useTaxForm()
  const [forms, setForms] = useState([])
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadForms()
    loadDrafts()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const userForms = await getUserForms(currentUser.uid)
      
      // Filter out drafts from local storage
      const completedForms = userForms.filter(form => form.status !== 'draft')
      
      setForms(completedForms)
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDrafts = async () => {
    try {
      const draftsList = await getUserDrafts(currentUser.uid)
      setDrafts(draftsList)
    } catch (error) {
      console.error('Error loading drafts:', error)
    }
  }

  const displayItems = () => {
    if (filter === 'draft') {
      return drafts
    } else if (filter === 'all') {
      // Show both drafts and forms in "All Forms" tab
      return [...drafts, ...forms]
    } else {
      // Filter forms by status (e.g., 'completed')
      return forms.filter((form) => form.status === filter)
    }
  }

  const filteredItems = displayItems()

  const handleDeleteDraft = async (draftUrl, draftName, gcsPath) => {
    if (!window.confirm(`Are you sure you want to delete "${draftName}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Get Firebase Auth token
      const { auth } = await import('../config/firebase')
      const token = await auth.currentUser.getIdToken()

      // Call Cloud Function to delete from GCS
      const response = await fetch(
        'https://us-central1-choonsik-madhack.cloudfunctions.net/deleteFile',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.uid,
            filePath: gcsPath,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to delete draft')
      }

      alert('Draft deleted successfully!')
      await loadDrafts()
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Error deleting draft: ' + error.message)
    }
  }

  const handleDeleteForm = async (formId, formName) => {
    if (!window.confirm(`Are you sure you want to delete "${formName}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Delete from localStorage
      const key = `taxform_${formId}`
      localStorage.removeItem(key)
      console.log('🗑️ Deleted form:', key)
      
      // Reload the forms list
      await loadForms()
      alert('Form deleted successfully!')
    } catch (error) {
      console.error('Error deleting form:', error)
      alert('Error deleting form: ' + error.message)
    }
  }

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
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>

        {loading ? (
          <Loading message="Loading your forms..." />
        ) : filteredItems.length > 0 ? (
          <div className="forms-grid">
            {filteredItems.map((item, index) => {
              // Check if this is a draft or a form
              const isDraft = item.gcsUrl !== undefined
              
              return (
                <Card key={isDraft ? index : item.id} hoverable>
                  <div className="history-form-card">
                    <div className="form-icon">
                      <FiFileText />
                    </div>
                    <div className="form-content">
                      <h3 className="form-title">{item.formName}</h3>
                      <p className="form-type">{item.formType || 'Draft'}</p>
                      <div className="form-meta">
                        {isDraft ? (
                          <>
                            <span className="form-status status-info">
                              Draft
                            </span>
                            <span className="form-date">
                              {formatDate(new Date(item.savedAt))}
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`form-status ${getStatusClass(item.status)}`}
                            >
                              {FORM_STATUS_LABELS[item.status]}
                            </span>
                            <span className="form-date">
                              {formatDate(new Date(item.savedAt))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="form-actions">
                      {isDraft ? (
                        <>
                          <Link to={`/forms/${item.formTemplateId}/input?draft=${encodeURIComponent(item.gcsUrl)}`}>
                            <Button
                              variant="primary"
                              size="small"
                              icon={<FiEdit />}
                            >
                              Edit Draft
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="small"
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteDraft(item.gcsUrl, item.formName, item.gcsPath)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="small"
                            icon={<FiDownload />}
                          >
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteForm(item.id, item.formName)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
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

