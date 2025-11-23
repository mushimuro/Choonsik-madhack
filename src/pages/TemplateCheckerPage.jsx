import { useState, useEffect } from 'react'
import { useTaxForm } from '../contexts/TaxFormContext'
import { checkAllTemplates, generateFillableReport, logFillableReport } from '../utils/pdfChecker'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import './TemplateCheckerPage.css'

const TemplateCheckerPage = () => {
  const { formTemplates, loadFormTemplates, loading: templatesLoading } = useTaxForm()
  const [checking, setChecking] = useState(false)
  const [report, setReport] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (formTemplates.length === 0 && !templatesLoading) {
      console.log('Loading templates from GCS...')
      loadFormTemplates()
        .then(() => console.log('Templates loaded successfully'))
        .catch(err => {
          console.error('Error loading templates:', err)
          setLoadError(err.message)
        })
    }
  }, [formTemplates.length, loadFormTemplates, templatesLoading])

  const handleCheckAll = async () => {
    try {
      setChecking(true)
      const results = await checkAllTemplates(formTemplates)
      const generatedReport = generateFillableReport(results)
      
      setReport(generatedReport)
      logFillableReport(generatedReport) // Also log to console
    } catch (error) {
      console.error('Error checking templates:', error)
    } finally {
      setChecking(false)
    }
  }

  const getStatusIcon = (result) => {
    if (!result.available) return <FiXCircle className="status-icon error" />
    if (result.isFillable) return <FiCheckCircle className="status-icon success" />
    return <FiAlertCircle className="status-icon warning" />
  }

  const getStatusText = (result) => {
    if (!result.available) return 'Not Available'
    if (result.isFillable) return 'Fillable'
    return 'Non-Fillable'
  }

  const getStatusClass = (result) => {
    if (!result.available) return 'status-error'
    if (result.isFillable) return 'status-success'
    return 'status-warning'
  }

  if (templatesLoading) {
    return (
      <div className="template-checker-page">
        <div className="container">
          <Loading message="Loading templates from GCS..." />
        </div>
      </div>
    )
  }

  return (
    <div className="template-checker-page">
      <div className="container">
        <div className="page-header">
          <h1>PDF Template Checker</h1>
          <p className="page-subtitle">
            Check if your tax form PDFs are fillable or require text overlay
          </p>
        </div>

        {loadError && (
          <Card>
            <div style={{ color: 'var(--error-color)', padding: 'var(--spacing-md)' }}>
              <strong>Error loading templates:</strong> {loadError}
              <br /><br />
              <strong>Possible issues:</strong>
              <ul style={{ marginTop: 'var(--spacing-sm)' }}>
                <li>CORS not configured on GCS bucket</li>
                <li>Firebase Auth token expired</li>
                <li>GCS bucket permissions issue</li>
                <li>Network error</li>
              </ul>
              <Button variant="secondary" onClick={() => {
                setLoadError(null)
                loadFormTemplates()
              }}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        <Card>
          <div className="checker-actions">
            {formTemplates.length === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--warning-color)', marginBottom: 'var(--spacing-md)' }}>
                  ⚠️ No templates loaded from GCS
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
                  Templates found: {formTemplates.length}<br />
                  Check browser console for errors
                </p>
                <Button
                  variant="secondary"
                  onClick={() => loadFormTemplates()}
                  icon={<FiRefreshCw />}
                >
                  Retry Loading Templates
                </Button>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--success-color)', marginBottom: 'var(--spacing-md)' }}>
                  ✅ Loaded {formTemplates.length} templates from GCS
                </p>
                <Button
                  variant="primary"
                  onClick={handleCheckAll}
                  loading={checking}
                  icon={<FiRefreshCw />}
                >
                  {checking ? 'Checking PDFs...' : 'Check All Templates'}
                </Button>
                <p className="checker-info">
                  This will download and analyze each PDF template to determine if it has fillable form fields.
                </p>
              </>
            )}
          </div>
        </Card>

        {report && (
          <>
            <Card title="Summary" className="summary-card">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-value">{report.total}</div>
                  <div className="summary-label">Total Forms</div>
                </div>
                <div className="summary-item success">
                  <div className="summary-value">{report.fillable}</div>
                  <div className="summary-label">Fillable</div>
                </div>
                <div className="summary-item warning">
                  <div className="summary-value">{report.nonFillable}</div>
                  <div className="summary-label">Non-Fillable</div>
                </div>
                <div className="summary-item error">
                  <div className="summary-value">{report.unavailable}</div>
                  <div className="summary-label">Unavailable</div>
                </div>
              </div>
            </Card>

            <Card title="Detailed Results">
              <div className="results-list">
                {report.details.map((result, index) => (
                  <div key={index} className={`result-item ${getStatusClass(result)}`}>
                    <div className="result-header">
                      {getStatusIcon(result)}
                      <div className="result-info">
                        <h3 className="result-name">{result.formName}</h3>
                        <p className="result-file">{result.templateFile || 'No file'}</p>
                      </div>
                      <div className={`result-status ${getStatusClass(result)}`}>
                        {getStatusText(result)}
                      </div>
                    </div>

                    {result.available && (
                      <div className="result-details">
                        {result.isFillable ? (
                          <>
                            <div className="result-stat">
                              <strong>Fields:</strong> {result.fieldCount}
                            </div>
                            {result.fieldCount > 0 && (
                              <div className="result-fields">
                                <strong>Sample Fields:</strong>
                                <ul>
                                  {result.fields.slice(0, 5).map((field, i) => (
                                    <li key={i}>
                                      {field.name} <span className="field-type">({field.type})</span>
                                    </li>
                                  ))}
                                  {result.fieldCount > 5 && (
                                    <li className="more-fields">
                                      ... and {result.fieldCount - 5} more fields
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            <div className="result-recommendation success">
                              ✅ Use <code>pdfService.fillPDFForm()</code> method
                            </div>
                          </>
                        ) : (
                          <div className="result-recommendation warning">
                            ⚠️ This PDF has no fillable fields. You'll need to use the text overlay approach.
                            <br />
                            See <code>pdfService.addTextOverlay()</code> method.
                          </div>
                        )}
                      </div>
                    )}

                    {!result.available && (
                      <div className="result-details">
                        <div className="result-error">
                          ❌ {result.error}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Implementation Guide">
              <div className="implementation-guide">
                {report.fillable > 0 && (
                  <div className="guide-section">
                    <h3>✅ For Fillable Forms ({report.fillable})</h3>
                    <pre className="code-block">
{`// Use the fillPDFForm method
import pdfService from './services/pdfService'
import gcsService from './services/gcsService'

const template = await gcsService.getFormTemplate('2024-wi-1.pdf')
const filledPDF = await pdfService.fillPDFForm(template.url, formData)
const blob = await pdfService.savePDFAsBlob(filledPDF)
await pdfService.downloadPDF(filledPDF, 'filled-form.pdf')`}
                    </pre>
                  </div>
                )}

                {report.nonFillable > 0 && (
                  <div className="guide-section">
                    <h3>⚠️ For Non-Fillable Forms ({report.nonFillable})</h3>
                    <p>You'll need to add text at specific coordinates:</p>
                    <pre className="code-block">
{`// Use the text overlay method
const template = await gcsService.getFormTemplate('2024-fed-1040.pdf')
const pdfDoc = await pdfService.loadPDF(template.url)

// Add text at specific coordinates
const textOverlays = [
  { pageIndex: 0, text: 'John Doe', x: 100, y: 700, size: 12 },
  { pageIndex: 0, text: '123-45-6789', x: 100, y: 680, size: 12 },
  // ... more fields
]

const filledPDF = await pdfService.addTextOverlay(template.url, textOverlays)
const blob = await pdfService.savePDFAsBlob(filledPDF)
await pdfService.downloadPDF(filledPDF, 'filled-form.pdf')`}
                    </pre>
                    <p>📘 See <code>docs/PDF_IMPLEMENTATION_GUIDE.md</code> for coordinate mapping details.</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default TemplateCheckerPage

