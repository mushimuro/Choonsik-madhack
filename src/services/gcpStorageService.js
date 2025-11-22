import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from 'firebase/storage'
import { storage } from '../config/firebase'

/**
 * GCP Storage Service
 * Handles storage operations using GCP buckets via Firebase Storage
 * 
 * Bucket Structure:
 * - form-templates/ : Tax form PDF templates
 * - user-tax-forms/ : User's completed forms and data
 */
class GCPStorageService {
  // Bucket paths
  FORM_TEMPLATES_BUCKET = 'form-templates'
  USER_TAX_FORMS_BUCKET = 'user-tax-forms'

  /**
   * ========================================
   * FORM TEMPLATES OPERATIONS
   * ========================================
   */

  /**
   * Upload a tax form template (Admin function)
   * Path: form-templates/{formId}/{fileName}
   */
  async uploadFormTemplate(formId, file, metadata = {}) {
    try {
      const fileName = file.name
      const path = `${this.FORM_TEMPLATES_BUCKET}/${formId}/${fileName}`
      const storageRef = ref(storage, path)

      const uploadMetadata = {
        contentType: file.type,
        customMetadata: {
          formId,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      }

      const snapshot = await uploadBytes(storageRef, file, uploadMetadata)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return {
        path,
        url: downloadURL,
        name: fileName,
        formId,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error(`Error uploading form template: ${error.message}`)
    }
  }

  /**
   * Get form template download URL
   * Path: form-templates/{formId}/{fileName}
   */
  async getFormTemplate(formId, fileName) {
    try {
      const path = `${this.FORM_TEMPLATES_BUCKET}/${formId}/${fileName}`
      const storageRef = ref(storage, path)
      const url = await getDownloadURL(storageRef)
      const metadata = await getMetadata(storageRef)

      return {
        url,
        path,
        name: fileName,
        formId,
        size: metadata.size,
        contentType: metadata.contentType,
        metadata: metadata.customMetadata,
      }
    } catch (error) {
      throw new Error(`Error getting form template: ${error.message}`)
    }
  }

  /**
   * List all available form templates
   */
  async listFormTemplates() {
    try {
      const storageRef = ref(storage, this.FORM_TEMPLATES_BUCKET)
      const result = await listAll(storageRef)

      const templates = await Promise.all(
        result.prefixes.map(async (folderRef) => {
          const formId = folderRef.name
          const filesResult = await listAll(folderRef)

          const files = await Promise.all(
            filesResult.items.map(async (itemRef) => {
              const url = await getDownloadURL(itemRef)
              const metadata = await getMetadata(itemRef)

              return {
                name: itemRef.name,
                url,
                path: itemRef.fullPath,
                size: metadata.size,
                contentType: metadata.contentType,
                metadata: metadata.customMetadata,
              }
            })
          )

          return {
            formId,
            files,
          }
        })
      )

      return templates
    } catch (error) {
      throw new Error(`Error listing form templates: ${error.message}`)
    }
  }

  /**
   * ========================================
   * USER TAX FORMS OPERATIONS
   * ========================================
   */

  /**
   * Save user's form data as JSON
   * Path: user-tax-forms/{userId}/{formId}/form-data.json
   */
  async saveUserFormData(userId, formId, formData, metadata = {}) {
    try {
      const timestamp = Date.now()
      const fileName = `form-data-${timestamp}.json`
      const path = `${this.USER_TAX_FORMS_BUCKET}/${userId}/${formId}/${fileName}`

      // Convert form data to JSON blob
      const jsonBlob = new Blob([JSON.stringify(formData, null, 2)], {
        type: 'application/json',
      })

      const storageRef = ref(storage, path)
      const uploadMetadata = {
        contentType: 'application/json',
        customMetadata: {
          userId,
          formId,
          timestamp: new Date().toISOString(),
          status: metadata.status || 'draft',
          ...metadata,
        },
      }

      const snapshot = await uploadBytes(storageRef, jsonBlob, uploadMetadata)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return {
        path,
        url: downloadURL,
        fileName,
        userId,
        formId,
        savedAt: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error(`Error saving user form data: ${error.message}`)
    }
  }

  /**
   * Get user's form data
   */
  async getUserFormData(userId, formId, fileName = null) {
    try {
      let path
      if (fileName) {
        path = `${this.USER_TAX_FORMS_BUCKET}/${userId}/${formId}/${fileName}`
      } else {
        // Get the latest form data file
        const files = await this.listUserFormFiles(userId, formId)
        if (files.length === 0) {
          throw new Error('No form data found')
        }
        // Sort by timestamp and get the latest
        files.sort((a, b) => b.name.localeCompare(a.name))
        path = files[0].path
      }

      const storageRef = ref(storage, path)
      const url = await getDownloadURL(storageRef)

      // Fetch and parse JSON data
      const response = await fetch(url)
      const formData = await response.json()
      const metadata = await getMetadata(storageRef)

      return {
        formData,
        path,
        url,
        metadata: metadata.customMetadata,
        savedAt: metadata.customMetadata?.timestamp,
      }
    } catch (error) {
      throw new Error(`Error getting user form data: ${error.message}`)
    }
  }

  /**
   * Upload user's generated PDF form
   * Path: user-tax-forms/{userId}/{formId}/generated-pdf-{timestamp}.pdf
   */
  async uploadGeneratedPDF(userId, formId, pdfBlob, formName, onProgress = null) {
    try {
      const timestamp = Date.now()
      const fileName = `${formName}-${timestamp}.pdf`
      const path = `${this.USER_TAX_FORMS_BUCKET}/${userId}/${formId}/${fileName}`

      const storageRef = ref(storage, path)
      const uploadMetadata = {
        contentType: 'application/pdf',
        customMetadata: {
          userId,
          formId,
          formName,
          generatedAt: new Date().toISOString(),
        },
      }

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, pdfBlob, uploadMetadata)

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress(progress)
            },
            (error) => {
              reject(new Error(`Upload failed: ${error.message}`))
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              resolve({
                path,
                url: downloadURL,
                fileName,
                userId,
                formId,
                size: pdfBlob.size,
                generatedAt: new Date().toISOString(),
              })
            }
          )
        })
      } else {
        const snapshot = await uploadBytes(storageRef, pdfBlob, uploadMetadata)
        const downloadURL = await getDownloadURL(snapshot.ref)

        return {
          path,
          url: downloadURL,
          fileName,
          userId,
          formId,
          size: pdfBlob.size,
          generatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      throw new Error(`Error uploading generated PDF: ${error.message}`)
    }
  }

  /**
   * Upload user's supporting document
   * Path: user-tax-forms/{userId}/{formId}/documents/{documentType}/{fileName}
   */
  async uploadUserDocument(userId, formId, file, documentType, onProgress = null) {
    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const path = `${this.USER_TAX_FORMS_BUCKET}/${userId}/${formId}/documents/${documentType}/${fileName}`

      const storageRef = ref(storage, path)
      const uploadMetadata = {
        contentType: file.type,
        customMetadata: {
          userId,
          formId,
          documentType,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      }

      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata)

        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              onProgress(progress)
            },
            (error) => {
              reject(new Error(`Upload failed: ${error.message}`))
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              resolve({
                path,
                url: downloadURL,
                name: fileName,
                originalName: file.name,
                documentType,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString(),
              })
            }
          )
        })
      } else {
        const snapshot = await uploadBytes(storageRef, file, uploadMetadata)
        const downloadURL = await getDownloadURL(snapshot.ref)

        return {
          path,
          url: downloadURL,
          name: fileName,
          originalName: file.name,
          documentType,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      throw new Error(`Error uploading user document: ${error.message}`)
    }
  }

  /**
   * List all files for a user's form
   */
  async listUserFormFiles(userId, formId) {
    try {
      const path = `${this.USER_TAX_FORMS_BUCKET}/${userId}/${formId}`
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef)
          const metadata = await getMetadata(itemRef)

          return {
            name: itemRef.name,
            url,
            path: itemRef.fullPath,
            size: metadata.size,
            contentType: metadata.contentType,
            metadata: metadata.customMetadata,
          }
        })
      )

      // Also get files from subdirectories (documents)
      const subfolderFiles = await Promise.all(
        result.prefixes.map(async (folderRef) => {
          const subResult = await listAll(folderRef)
          return Promise.all(
            subResult.items.map(async (itemRef) => {
              const url = await getDownloadURL(itemRef)
              const metadata = await getMetadata(itemRef)

              return {
                name: itemRef.name,
                url,
                path: itemRef.fullPath,
                size: metadata.size,
                contentType: metadata.contentType,
                metadata: metadata.customMetadata,
              }
            })
          )
        })
      )

      return [...files, ...subfolderFiles.flat()]
    } catch (error) {
      throw new Error(`Error listing user form files: ${error.message}`)
    }
  }

  /**
   * List all forms for a user
   */
  async listUserForms(userId) {
    try {
      const path = `${this.USER_TAX_FORMS_BUCKET}/${userId}`
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)

      const forms = await Promise.all(
        result.prefixes.map(async (folderRef) => {
          const formId = folderRef.name
          const files = await this.listUserFormFiles(userId, formId)

          // Find the latest form data JSON
          const formDataFiles = files.filter((f) =>
            f.name.startsWith('form-data-') && f.contentType === 'application/json'
          )
          formDataFiles.sort((a, b) => b.name.localeCompare(a.name))

          const latestFormData = formDataFiles[0] || null

          return {
            formId,
            userId,
            files,
            latestFormData,
            totalFiles: files.length,
          }
        })
      )

      return forms
    } catch (error) {
      throw new Error(`Error listing user forms: ${error.message}`)
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`)
    }
  }

  /**
   * Delete all files for a user's form
   */
  async deleteUserForm(userId, formId) {
    try {
      const files = await this.listUserFormFiles(userId, formId)
      await Promise.all(files.map((file) => this.deleteFile(file.path)))
    } catch (error) {
      throw new Error(`Error deleting user form: ${error.message}`)
    }
  }

  /**
   * Get file download URL
   */
  async getFileURL(path) {
    try {
      const storageRef = ref(storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      throw new Error(`Error getting file URL: ${error.message}`)
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
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

export default new GCPStorageService()

