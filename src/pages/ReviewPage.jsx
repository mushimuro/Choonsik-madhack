import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { toast } from 'react-toastify'
import pdfFillingService from '../services/pdfFillingService'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import { FiDownload, FiEdit, FiAlertCircle } from 'react-icons/fi'
import './ReviewPage.css'

const ReviewPage = () => {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentForm, formData, uploadedDocuments, generateAndUploadPDF, saveFormData } = useTaxForm()
  const [generating, setGenerating] = useState(false)
  const [canFill, setCanFill] = useState(null)

  // Check if form can be filled
  useState(() => {
    if (formId) {
      const validation = pdfFillingService.validateFormCanBeFilled(formId)
      setCanFill(validation)
    }
  }, [formId])

  const handleEdit = () => {
    navigate(`/forms/${formId}/input`)
  }

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true)
      
      // Save form data first
      await saveFormData(currentUser.uid, { status: 'completed' })
      
      toast.info('Generating filled PDF...')
      
      // Check if form can be filled
      const validation = pdfFillingService.validateFormCanBeFilled(formId)
      
      if (!validation.canFill) {
        toast.warning(`Cannot auto-fill this form: ${validation.reason}`)
        toast.info(validation.suggestion || 'Please fill manually')
        return
      }
      
      // Get fields summary
      const summary = pdfFillingService.getFilledFieldsSummary(formId, formData)
      console.log('Field filling summary:', summary)
      
      if (summary && summary.filledFields === 0) {
        toast.warning('No data to fill in the PDF. Please complete the form first.')
        return
      }
      
      // Fill the PDF
      const filename = `${currentForm.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
      await pdfFillingService.fillAndDownload(
        formId,
        formData,
        filename,
        { flatten: true } // Make the form non-editable
      )
      
      // Optional: Also upload to GCS
      try {
        const blob = await pdfFillingService.fillAndGetBlob(formId, formData, { flatten: true })
        await generateAndUploadPDF(currentUser.uid, blob, filename)
        toast.success('PDF generated and uploaded successfully!')
      } catch (uploadError) {
        console.error('Error uploading PDF:', uploadError)
        toast.success('PDF downloaded successfully! (Upload failed - check console)')
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Error generating PDF: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleComplete = () => {
    toast.success('Form completed!')
    navigate('/dashboard')
  }

  if (!currentForm) {
    return (
      <div className="container">
        <p>Please select a form first.</p>
      </div>
    )
  }

  return (
    <div className="review-page">
      <div className="container">
        <div className="page-header">
          <h1>Review Your Information</h1>
          <p className="page-subtitle">
            Please review your information before generating the final PDF.
          </p>
        </div>

        <div className="review-grid">
          {canFill && !canFill.canFill && (
            <Card title="Auto-Fill Not Available" className="warning-card">
              <div className="warning-content">
                <FiAlertCircle size={24} />
                <p>
                  <strong>This form cannot be automatically filled.</strong>
                </p>
                <p>{canFill.reason}</p>
                {canFill.suggestion && <p className="suggestion">{canFill.suggestion}</p>}
                <p>
                  You will need to manually fill this form using the template and your saved data.
                </p>
              </div>
            </Card>
          )}

          <Card title="Form Information">
            <div className="info-section">
              <h3>Selected Form</h3>
              <p className="form-name">{currentForm.fullName}</p>
              <p className="form-description">{currentForm.description}</p>
            </div>
          </Card>

          <Card title="Personal Information">
            <div className="info-grid">
              {Object.entries(formData).map(([key, value]) => {
                if (value && typeof value !== 'object') {
                  return (
                    <div key={key} className="info-item">
                      <span className="info-label">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="info-value">{value}</span>
                    </div>
                  )
                }
                return null
              })}
            </div>
            <div className="info-actions">
              <Button
                variant="outline"
                size="small"
                icon={<FiEdit />}
                onClick={handleEdit}
              >
                Edit Information
              </Button>
            </div>
          </Card>

          <Card title="Uploaded Documents">
            {uploadedDocuments.length > 0 ? (
              <div className="documents-list">
                {uploadedDocuments.map((doc, index) => (
                  <div key={index} className="document-item">
                    <span className="document-name">{doc.name}</span>
                    <span className="document-type">{doc.documentType}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-documents">No documents uploaded</p>
            )}
          </Card>

          <Card title="Important Notice" className="notice-card">
            <div className="notice-content">
              <h4>Before You Continue:</h4>
              <ul>
                <li>Review all information for accuracy</li>
                <li>
                  Ensure you have uploaded all required supporting documents
                </li>
                <li>
                  The generated PDF will use the form template for{' '}
                  {currentForm.name}
                </li>
                <li>
                  You will be able to download the completed form after
                  generation
                </li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="page-actions">
          <Button variant="outline" onClick={handleEdit}>
            Back to Edit
          </Button>
          <div className="actions-right">
            <Button
              variant="primary"
              icon={<FiDownload />}
              onClick={handleGeneratePDF}
              loading={generating}
            >
              Generate PDF
            </Button>
            <Button variant="success" onClick={handleComplete}>
              Mark as Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewPage

