/**
 * Google Cloud Storage Configuration
 * Direct connection to GCS bucket (not through Firebase)
 */

// For browser-based applications, we'll use the GCS JSON API
// with Firebase Auth tokens for authentication

export const GCS_CONFIG = {
  bucketName: 'choonsik-madhack',
  projectId: 'choonsik-madhack',
  
  // GCS API endpoint
  apiEndpoint: 'https://storage.googleapis.com',
  
  // Bucket paths
  FORM_TEMPLATES_PATH: 'form-templates',
  USER_TAX_FORMS_PATH: 'user-tax-forms',
}

/**
 * Get GCS API URL for a file
 */
export function getGCSUrl(path) {
  return `${GCS_CONFIG.apiEndpoint}/${GCS_CONFIG.bucketName}/${path}`
}

/**
 * Get public URL for a file (if bucket has public access)
 */
export function getPublicUrl(path) {
  return `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${path}`
}

export default GCS_CONFIG

