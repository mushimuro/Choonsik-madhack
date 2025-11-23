import { useState } from 'react'
import { auth } from '../config/firebase'
import { GCS_CONFIG } from '../config/gcs'
import gcsService from '../services/gcsService'
import gcsPublicService from '../services/gcsPublicService'
import Card from '../components/Common/Card'
import Button from '../components/Common/Button'
import './TemplateCheckerPage.css'

const GCSDebugPage = () => {
  const [results, setResults] = useState(null)
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
    }

    // Test 1: Check Authentication
    try {
      const user = auth.currentUser
      testResults.tests.push({
        name: 'Firebase Auth',
        status: user ? 'PASS' : 'FAIL',
        details: user ? `Logged in as: ${user.email}` : 'Not authenticated',
        data: user ? { uid: user.uid, email: user.email } : null,
      })
    } catch (error) {
      testResults.tests.push({
        name: 'Firebase Auth',
        status: 'ERROR',
        details: error.message,
      })
    }

    // Test 2: Check GCS Config
    testResults.tests.push({
      name: 'GCS Configuration',
      status: 'INFO',
      details: 'Configuration loaded',
      data: {
        bucketName: GCS_CONFIG.bucketName,
        apiEndpoint: GCS_CONFIG.apiEndpoint,
        templatesPath: GCS_CONFIG.FORM_TEMPLATES_PATH,
      },
    })

    // Test 3: Get Auth Token
    try {
      const user = auth.currentUser
      if (user) {
        const token = await user.getIdToken()
        testResults.tests.push({
          name: 'Firebase Auth Token',
          status: 'PASS',
          details: 'Token generated successfully',
          data: { tokenLength: token.length, tokenPreview: token.substring(0, 50) + '...' },
        })
      } else {
        testResults.tests.push({
          name: 'Firebase Auth Token',
          status: 'SKIP',
          details: 'Not authenticated',
        })
      }
    } catch (error) {
      testResults.tests.push({
        name: 'Firebase Auth Token',
        status: 'ERROR',
        details: error.message,
      })
    }

    // Test 4: List Files from GCS
    try {
      console.log('Testing GCS list files...')
      const templates = await gcsService.listFormTemplates()
      testResults.tests.push({
        name: 'GCS List Templates',
        status: templates.length > 0 ? 'PASS' : 'WARN',
        details: `Found ${templates.length} templates`,
        data: templates,
      })
    } catch (error) {
      testResults.tests.push({
        name: 'GCS List Templates',
        status: 'ERROR',
        details: error.message,
        data: { error: error.toString(), stack: error.stack },
      })
    }

    // Test 5: Try to get a specific template
    try {
      const template = await gcsService.getFormTemplate('2024-wi-1.pdf')
      testResults.tests.push({
        name: 'GCS Get Template (Auth)',
        status: 'PASS',
        details: 'Successfully retrieved template',
        data: { url: template.url, size: template.size },
      })
    } catch (error) {
      testResults.tests.push({
        name: 'GCS Get Template (Auth)',
        status: 'ERROR',
        details: error.message,
      })
    }

    // Test 6: Try public access method
    try {
      console.log('Testing public access...')
      const templates = await gcsPublicService.listFormTemplates()
      testResults.tests.push({
        name: 'GCS List Templates (Public)',
        status: templates.length > 0 ? 'PASS' : 'WARN',
        details: `Found ${templates.length} templates via public access`,
        data: templates,
      })
    } catch (error) {
      testResults.tests.push({
        name: 'GCS List Templates (Public)',
        status: 'ERROR',
        details: error.message,
      })
    }

    // Test 7: Test direct file access
    try {
      const fileTest = await gcsPublicService.testFileAccess('form-templates/2024-wi-1.pdf')
      testResults.tests.push({
        name: 'Direct File Access Test',
        status: fileTest.accessible ? 'PASS' : 'FAIL',
        details: fileTest.accessible ? 'File is publicly accessible' : `File not accessible: ${fileTest.status}`,
        data: fileTest,
      })
    } catch (error) {
      testResults.tests.push({
        name: 'Direct File Access Test',
        status: 'ERROR',
        details: error.message,
      })
    }

    setResults(testResults)
    setTesting(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return 'var(--success-color)'
      case 'FAIL': return 'var(--error-color)'
      case 'ERROR': return 'var(--error-color)'
      case 'WARN': return 'var(--warning-color)'
      case 'INFO': return 'var(--info-color)'
      case 'SKIP': return 'var(--text-light)'
      default: return 'var(--text-secondary)'
    }
  }

  return (
    <div className="template-checker-page">
      <div className="container">
        <div className="page-header">
          <h1>GCS Connection Debug</h1>
          <p className="page-subtitle">
            Test your connection to Google Cloud Storage
          </p>
        </div>

        <Card>
          <div className="checker-actions">
            <Button
              variant="primary"
              onClick={runTests}
              loading={testing}
            >
              {testing ? 'Running Tests...' : 'Run Connection Tests'}
            </Button>
            <p className="checker-info">
              This will test authentication, configuration, and GCS connectivity
            </p>
          </div>
        </Card>

        {results && (
          <Card title="Test Results">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <strong>Test Run:</strong> {new Date(results.timestamp).toLocaleString()}
              </div>

              {results.tests.map((test, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-md)',
                    border: `2px solid ${getStatusColor(test.status)}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${getStatusColor(test.status)}10`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                    <strong>{test.name}</strong>
                    <span style={{ color: getStatusColor(test.status), fontWeight: 'bold' }}>
                      {test.status}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    {test.details}
                  </div>
                  {test.data && (
                    <details style={{ marginTop: 'var(--spacing-sm)' }}>
                      <summary style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
                        View Details
                      </summary>
                      <pre style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: 'var(--spacing-md)',
                        backgroundColor: '#1e293b',
                        color: '#e2e8f0',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'auto',
                        maxHeight: '300px',
                      }}>
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {results && (
          <Card title="Troubleshooting">
            <div style={{ lineHeight: 1.6 }}>
              <h3>Common Issues:</h3>
              <ul>
                <li>
                  <strong>Authentication Error:</strong> Make sure you're logged in
                </li>
                <li>
                  <strong>CORS Error:</strong> Configure CORS on your GCS bucket
                  <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
{`gcloud storage buckets update gs://choonsik-madhack --cors-file=cors.json`}
                  </pre>
                </li>
                <li>
                  <strong>Permission Denied:</strong> Check IAM permissions for your service account
                </li>
                <li>
                  <strong>No Files Found:</strong> Verify files exist in form-templates/ folder
                </li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default GCSDebugPage

