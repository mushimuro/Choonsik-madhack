/**
 * Google Cloud Storage Service
 * Direct connection to GCS bucket using REST API
 * 
 * Note: In a browser environment, we use the GCS JSON API
 * Authentication is handled through Firebase Auth tokens
 */

import { auth } from '../config/firebase'
import { GCS_CONFIG } from '../config/gcs'

class GCSService {
  constructor() {
    this.bucketName = GCS_CONFIG.bucketName
    this.apiEndpoint = GCS_CONFIG.apiEndpoint
  }

  /**
   * Get authenticated headers for GCS API calls
   */
  async getAuthHeaders() {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const token = await user.getIdToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Upload file to GCS bucket
   */
  async uploadFile(file, path, metadata = {}, onProgress = null) {
    try {
      const url = `${this.apiEndpoint}/upload/storage/v1/b/${this.bucketName}/o?uploadType=multipart&name=${encodeURIComponent(path)}`
      
      // Create metadata
      const fileMetadata = {
        name: path,
        contentType: file.type,
        metadata: {
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      }

      // Create multipart body
      const boundary = '-------314159265358979323846'
      const delimiter = `\r\n--${boundary}\r\n`
      const closeDelimiter = `\r\n--${boundary}--`

      const metadataPart = delimiter + 
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata)

      const filePart = delimiter +
        `Content-Type: ${file.type}\r\n\r\n`

      // Read file as array buffer
      const fileData = await file.arrayBuffer()

      // Combine parts
      const requestBody = new Blob([
        metadataPart,
        filePart,
        fileData,
        closeDelimiter
      ])

      const headers = await this.getAuthHeaders()
      headers['Content-Type'] = `multipart/related; boundary=${boundary}`

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: requestBody,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Upload failed')
      }

      const result = await response.json()
      
      return {
        name: result.name,
        path: result.name,
        url: `https://storage.googleapis.com/${this.bucketName}/${result.name}`,
        size: result.size,
        contentType: result.contentType,
        metadata: result.metadata,
      }
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`)
    }
  }

  /**
   * Download/Get file from GCS
   */
  async getFile(path) {
    try {
      const url = `${this.apiEndpoint}/storage/v1/b/${this.bucketName}/o/${encodeURIComponent(path)}?alt=media`
      const headers = await this.getAuthHeaders()

      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`File not found: ${path}`)
      }

      return response
    } catch (error) {
      throw new Error(`Error getting file: ${error.message}`)
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path) {
    try {
      const url = `${this.apiEndpoint}/storage/v1/b/${this.bucketName}/o/${encodeURIComponent(path)}`
      const headers = await this.getAuthHeaders()

      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`File not found: ${path}`)
      }

      const metadata = await response.json()
      return {
        name: metadata.name,
        size: parseInt(metadata.size),
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        metadata: metadata.metadata,
      }
    } catch (error) {
      throw new Error(`Error getting file metadata: ${error.message}`)
    }
  }

  /**
   * Get signed URL for temporary access
   */
  async getSignedUrl(path) {
    try {
      const url = `${this.apiEndpoint}/storage/v1/b/${this.bucketName}/o/${encodeURIComponent(path)}`
      const headers = await this.getAuthHeaders()

      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`File not found: ${path}`)
      }

      const data = await response.json()
      return data.mediaLink
    } catch (error) {
      throw new Error(`Error getting signed URL: ${error.message}`)
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(prefix = '', delimiter = '/') {
    try {
      const url = `${this.apiEndpoint}/storage/v1/b/${this.bucketName}/o?prefix=${encodeURIComponent(prefix)}&delimiter=${delimiter}`
      const headers = await this.getAuthHeaders()

      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to list files')
      }

      const data = await response.json()
      
      const files = (data.items || []).map(item => ({
        name: item.name,
        path: item.name,
        url: `https://storage.googleapis.com/${this.bucketName}/${item.name}`,
        size: parseInt(item.size),
        contentType: item.contentType,
        timeCreated: item.timeCreated,
        updated: item.updated,
        metadata: item.metadata,
      }))

      const prefixes = data.prefixes || []

      return { files, prefixes }
    } catch (error) {
      throw new Error(`Error listing files: ${error.message}`)
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path) {
    try {
      const url = `${this.apiEndpoint}/storage/v1/b/${this.bucketName}/o/${encodeURIComponent(path)}`
      const headers = await this.getAuthHeaders()

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete file')
      }
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`)
    }
  }

  /**
   * ========================================
   * HIGH-LEVEL OPERATIONS
   * ========================================
   */

  /**
   * Upload form template
   */
  async uploadFormTemplate(formId, file, metadata = {}) {
    const path = `${GCS_CONFIG.FORM_TEMPLATES_PATH}/${formId}/${file.name}`
    return this.uploadFile(file, path, { formId, ...metadata })
  }

  /**
   * Get form template
   */
  async getFormTemplate(formId, fileName) {
    const path = `${GCS_CONFIG.FORM_TEMPLATES_PATH}/${formId}/${fileName}`
    const metadata = await this.getFileMetadata(path)
    const url = await this.getSignedUrl(path)
    return { ...metadata, url }
  }

  /**
   * List form templates
   */
  async listFormTemplates() {
    const { prefixes } = await this.listFiles(GCS_CONFIG.FORM_TEMPLATES_PATH + '/')
    
    const templates = await Promise.all(
      prefixes.map(async (prefix) => {
        const formId = prefix.replace(`${GCS_CONFIG.FORM_TEMPLATES_PATH}/`, '').replace('/', '')
        const { files } = await this.listFiles(prefix)
        return { formId, files }
      })
    )
    
    return templates
  }

  /**
   * Save user form data as JSON
   */
  async saveUserFormData(userId, formId, formData, metadata = {}) {
    const timestamp = Date.now()
    const fileName = `form-data-${timestamp}.json`
    const path = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/${formId}/${fileName}`

    const jsonBlob = new Blob([JSON.stringify(formData, null, 2)], {
      type: 'application/json',
    })

    const file = new File([jsonBlob], fileName, { type: 'application/json' })

    return this.uploadFile(file, path, {
      userId,
      formId,
      timestamp: new Date().toISOString(),
      ...metadata,
    })
  }

  /**
   * Get user form data
   */
  async getUserFormData(userId, formId, fileName = null) {
    try {
      let path
      
      if (fileName) {
        path = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/${formId}/${fileName}`
      } else {
        // Get the latest form data file
        const prefix = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/${formId}/`
        const { files } = await this.listFiles(prefix)
        
        const dataFiles = files
          .filter(f => f.name.includes('form-data-') && f.contentType === 'application/json')
          .sort((a, b) => b.name.localeCompare(a.name))
        
        if (dataFiles.length === 0) {
          throw new Error('No form data found')
        }
        
        path = dataFiles[0].name
      }

      const response = await this.getFile(path)
      const formData = await response.json()
      const metadata = await this.getFileMetadata(path)

      return {
        formData,
        path,
        metadata: metadata.metadata,
        savedAt: metadata.timeCreated,
      }
    } catch (error) {
      throw new Error(`Error getting user form data: ${error.message}`)
    }
  }

  /**
   * Upload generated PDF
   */
  async uploadGeneratedPDF(userId, formId, pdfBlob, formName, onProgress = null) {
    const timestamp = Date.now()
    const fileName = `${formName}-${timestamp}.pdf`
    const path = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/${formId}/${fileName}`

    const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

    return this.uploadFile(file, path, {
      userId,
      formId,
      formName,
      generatedAt: new Date().toISOString(),
    }, onProgress)
  }

  /**
   * Upload user document
   */
  async uploadUserDocument(userId, formId, file, documentType, onProgress = null) {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const path = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/${formId}/documents/${documentType}/${fileName}`

    return this.uploadFile(file, path, {
      userId,
      formId,
      documentType,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    }, onProgress)
  }

  /**
   * List user forms
   */
  async listUserForms(userId) {
    const prefix = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/`
    const { prefixes } = await this.listFiles(prefix)

    const forms = await Promise.all(
      prefixes.map(async (formPrefix) => {
        const formId = formPrefix.replace(prefix, '').replace('/', '')
        const { files } = await this.listFiles(formPrefix, '')

        // Find latest form data
        const formDataFiles = files
          .filter(f => f.name.includes('form-data-') && f.contentType === 'application/json')
          .sort((a, b) => b.name.localeCompare(a.name))

        return {
          formId,
          userId,
          files,
          latestFormData: formDataFiles[0] || null,
          totalFiles: files.length,
        }
      })
    )

    return forms
  }

  /**
   * Delete user form
   */
  async deleteUserForm(userId, formId) {
    const prefix = `${GCS_CONFIG.USER_TAX_FORMS_PATH}/${userId}/${formId}/`
    const { files } = await this.listFiles(prefix, '')
    
    await Promise.all(files.map(file => this.deleteFile(file.path)))
  }

  /**
   * Validate file
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024,
      allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/json'],
    } = options

    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`)
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`)
    }

    return true
  }
}

export default new GCSService()

