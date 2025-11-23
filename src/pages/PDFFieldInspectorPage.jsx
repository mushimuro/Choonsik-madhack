import { useState } from 'react'
import { TAX_FORMS } from '../constants/taxForms'
import gcsPublicService from '../services/gcsPublicService'
import { inspectPDFFields } from '../utils/pdfFieldInspector'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import Loading from '../components/Common/Loading'
import { FiSearch, FiCopy } from 'react-icons/fi'
import './PDFFieldInspectorPage.css'

const PDFFieldInspectorPage = () => {
  const [selectedForm, setSelectedForm] = useState('')
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState(null)
  const [error, setError] = useState(null)

  const handleInspect = async () => {
    if (!selectedForm) {
      setError('Please select a form')
      return
    }

    setLoading(true)
    setError(null)
    setFields(null)

    try {
      const formConfig = Object.values(TAX_FORMS).find(f => f.id === selectedForm)
      if (!formConfig) {
        throw new Error('Form configuration not found')
      }

      const pdfUrl = gcsPublicService.getTemplateUrl(formConfig.templateFile)
      console.log('Inspecting PDF:', pdfUrl)

      const pdfFields = await inspectPDFFields(pdfUrl)
      setFields(pdfFields)
    } catch (err) {
      console.error('Error inspecting PDF:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyFieldNames = () => {
    if (!fields) return

    const fieldNames = fields.map(f => f.name).join('\n')
    navigator.clipboard.writeText(fieldNames)
    alert('Field names copied to clipboard!')
  }

  const copyMappingTemplate = () => {
    if (!fields) return

    const template = fields.map(f => `    ${f.name}: { pdfField: '${f.name}', transformer: null },`).join('\n')
    const fullTemplate = `  fields: {\n${template}\n  }`
    
    navigator.clipboard.writeText(fullTemplate)
    alert('Mapping template copied to clipboard!')
  }

  return (
    <div className="pdf-inspector-page">
      <div className="container">
        <div className="page-header">
          <h1>PDF Field Inspector</h1>
          <p className="page-subtitle">
            Inspect fillable PDF forms to discover their field names for mapping
          </p>
        </div>

        <Card>
          <div className="inspector-controls">
            <div className="form-selector">
              <label htmlFor="form-select">Select a Form:</label>
              <select
                id="form-select"
                value={selectedForm}
                onChange={(e) => setSelectedForm(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Choose a form --</option>
                {Object.values(TAX_FORMS).map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.fullName} ({form.templateFile})
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleInspect}
              loading={loading}
              disabled={!selectedForm}
              icon={<FiSearch />}
            >
              Inspect Fields
            </Button>
          </div>

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}
        </Card>

        {loading && (
          <Card>
            <Loading text="Inspecting PDF fields..." />
          </Card>
        )}

        {fields && fields.length > 0 && (
          <>
            <Card title={`Found ${fields.length} fields`}>
              <div className="fields-actions">
                <Button
                  variant="outline"
                  size="small"
                  icon={<FiCopy />}
                  onClick={copyFieldNames}
                >
                  Copy Field Names
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  icon={<FiCopy />}
                  onClick={copyMappingTemplate}
                >
                  Copy Mapping Template
                </Button>
              </div>

              <div className="fields-table-container">
                <table className="fields-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Field Name</th>
                      <th>Type</th>
                      <th>Current Value</th>
                      <th>Read Only</th>
                      <th>Required</th>
                      <th>Max Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, index) => (
                      <tr key={index} className={field.isReadOnly ? 'readonly-field' : ''}>
                        <td>{index + 1}</td>
                        <td>
                          <code>{field.name}</code>
                        </td>
                        <td>
                          <span className={`field-type ${field.type.toLowerCase()}`}>
                            {field.type}
                          </span>
                        </td>
                        <td>
                          <code>
                            {field.value === null || field.value === undefined
                              ? '(empty)'
                              : String(field.value)}
                          </code>
                        </td>
                        <td>
                          {field.isReadOnly !== undefined ? (
                            <span className={field.isReadOnly ? 'badge badge-warning' : 'badge badge-success'}>
                              {field.isReadOnly ? 'Yes' : 'No'}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          {field.isRequired !== undefined ? (
                            <span className={field.isRequired ? 'badge badge-error' : 'badge badge-info'}>
                              {field.isRequired ? 'Yes' : 'No'}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          {field.maxLength !== undefined ? (
                            <code>{field.maxLength}</code>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Next Steps">
              <div className="instructions">
                <h3>How to create field mappings:</h3>
                <ol>
                  <li>
                    <strong>Copy the mapping template</strong> using the button above
                  </li>
                  <li>
                    <strong>Open</strong> <code>src/config/pdfFieldMappings.js</code>
                  </li>
                  <li>
                    <strong>Paste</strong> the template into the appropriate form mapping
                  </li>
                  <li>
                    <strong>Map</strong> each PDF field to your application field names:
                    <ul>
                      <li>
                        <code>firstName</code>, <code>lastName</code>, <code>ssn</code>, etc.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Add transformers</strong> if needed (date formatting, SSN
                    formatting, etc.)
                  </li>
                  <li>
                    <strong>Test</strong> by filling out a form and generating a PDF
                  </li>
                </ol>

                <h3>Example mapping:</h3>
                <pre className="code-example">
{`// In pdfFieldMappings.js
export const WI_FORM_1_MAPPINGS = {
  formId: 'wi_form_1',
  fields: {
    firstName: { pdfField: 'Text1', transformer: null },
    lastName: { pdfField: 'Text2', transformer: null },
    ssn: { pdfField: 'SSN', transformer: TRANSFORMERS.ssnNoDashes },
    dateOfBirth: { pdfField: 'DOB', transformer: TRANSFORMERS.dateMMDDYYYY },
    // ... more fields
  }
}`}
                </pre>
              </div>
            </Card>
          </>
        )}

        {fields && fields.length === 0 && (
          <Card>
            <div className="no-fields-message">
              <p>
                <strong>No fillable fields found in this PDF.</strong>
              </p>
              <p>
                This PDF is not a fillable form. You will need to use a different
                approach, such as text overlay or manual filling.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PDFFieldInspectorPage

