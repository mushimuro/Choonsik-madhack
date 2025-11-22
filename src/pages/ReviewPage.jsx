import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { toast } from 'react-toastify'
import pdfService from '../services/pdfService'
import storageService from '../services/storageService'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import { FiDownload, FiEdit } from 'react-icons/fi'
import './ReviewPage.css'

const ReviewPage = () => {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentForm, formData, uploadedDocuments } = useTaxForm()
  const [generating, setGenerating] = useState(false)

  const handleEdit = () => {
    navigate(`/forms/${formId}/input`)
  }

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true)
      toast.info('Generating PDF... (Feature not fully implemented yet)')
      
      // This is a placeholder for PDF generation
      // In production, you would:
      // 1. Load the PDF template
      // 2. Fill in the form fields using pdfService
      // 3. Save the generated PDF to storage
      // 4. Provide download link
      
      // Example flow:
      // const pdfDoc = await pdfService.fillPDFForm(templateUrl, formData)
      // const blob = await pdfService.savePDFAsBlob(pdfDoc)
      // const result = await storageService.uploadGeneratedForm(currentUser.uid, blob, currentForm.name)
      // await pdfService.downloadPDF(pdfDoc, `${currentForm.name}.pdf`)
      
      toast.success('PDF generation will be implemented based on your form template type!')
    } catch (error) {
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

