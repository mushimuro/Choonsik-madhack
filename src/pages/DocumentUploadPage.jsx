import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { toast } from 'react-toastify'
import { DOCUMENT_TYPES, DOCUMENT_LABELS } from '../constants/taxForms'
import FileUpload from '../components/Upload/FileUpload'
import Button from '../components/Common/Button'
import Card from '../components/Common/Card'
import './DocumentUploadPage.css'

const DocumentUploadPage = () => {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentForm, uploadedDocuments, uploadDocument, removeDocument } = useTaxForm()
  const [selectedDocType, setSelectedDocType] = useState(DOCUMENT_TYPES.W2)

  const handleUpload = async (file, onProgress) => {
    try {
      await uploadDocument(currentUser.uid, file, selectedDocType, onProgress)
      toast.success('File uploaded successfully!')
    } catch (error) {
      toast.error('Error uploading file: ' + error.message)
      throw error
    }
  }

  const handleRemove = (file) => {
    removeDocument(file.path)
    toast.info('File removed')
  }

  const handleContinue = () => {
    navigate(`/forms/${formId}/review`)
  }

  const handleSkip = () => {
    navigate(`/forms/${formId}/review`)
  }

  if (!currentForm) {
    return (
      <div className="container">
        <p>Please select a form first.</p>
      </div>
    )
  }

  return (
    <div className="document-upload-page">
      <div className="container">
        <div className="page-header">
          <h1>Upload Supporting Documents</h1>
          <p className="page-subtitle">
            Upload documents like W-2s, 1099s, receipts, and other forms needed
            for your tax return. These will be stored securely for your records.
          </p>
        </div>

        <div className="upload-grid">
          <Card title="Select Document Type">
            <div className="document-type-selector">
              {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                <label key={value} className="document-type-option">
                  <input
                    type="radio"
                    name="documentType"
                    value={value}
                    checked={selectedDocType === value}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                  />
                  <span>{DOCUMENT_LABELS[value]}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card title="Upload Files" className="upload-card">
            <FileUpload
              onUpload={handleUpload}
              onRemove={handleRemove}
              uploadedFiles={uploadedDocuments}
              acceptedTypes="application/pdf,image/*"
              maxSize={10 * 1024 * 1024}
              multiple={true}
            />
          </Card>
        </div>

        <div className="page-actions">
          <Button variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button variant="primary" onClick={handleContinue}>
            Continue to Review
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploadPage

