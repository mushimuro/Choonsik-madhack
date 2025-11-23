import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaxForm } from '../contexts/TaxFormContext'
import TaxFormSelector from '../components/Forms/TaxFormSelector'
import Button from '../components/Common/Button'
import './TaxFormSelectionPage.css'

const TaxFormSelectionPage = () => {
  const navigate = useNavigate()
  const { selectForm, startFreshForm } = useTaxForm()
  const [showModal, setShowModal] = useState(false)
  const [selectedFormInfo, setSelectedFormInfo] = useState(null)

  const handleSelectForm = (formInfo) => {
    // Check if there's cached data for this form
    const key = `taxform_${formInfo.id}`
    const saved = localStorage.getItem(key)
    
    if (saved) {
      // Show modal to ask if they want to continue or start fresh
      setSelectedFormInfo(formInfo)
      setShowModal(true)
    } else {
      // No cached data, start fresh
      startFreshForm(formInfo)
      navigate(`/forms/${formInfo.id}/input`)
    }
  }

  const handleContinue = () => {
    selectForm(selectedFormInfo)
    setShowModal(false)
    navigate(`/forms/${selectedFormInfo.id}/input`)
  }

  const handleStartFresh = () => {
    startFreshForm(selectedFormInfo)
    setShowModal(false)
    navigate(`/forms/${selectedFormInfo.id}/input`)
  }

  const handleCancel = () => {
    setShowModal(false)
    setSelectedFormInfo(null)
  }

  return (
    <div className="tax-form-selection-page">
      <div className="container">
        <div className="page-header">
          <h1>Select a Tax Form</h1>
          <p className="page-subtitle">
            Choose the tax form you need to fill out. We support both Wisconsin
            state forms and federal forms.
          </p>
        </div>

        <TaxFormSelector onSelect={handleSelectForm} />

        {/* Continue or Start Fresh Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Continue or Start Fresh?</h2>
              <p>
                You have unsaved data for this form. Would you like to continue where you left off or start over?
              </p>
              <div className="modal-actions">
                <Button variant="primary" onClick={handleContinue}>
                  Continue from Last Save
                </Button>
                <Button variant="outline" onClick={handleStartFresh}>
                  Start Fresh
                </Button>
                <Button variant="text" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaxFormSelectionPage

