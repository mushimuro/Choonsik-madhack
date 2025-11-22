import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage'
import { storage } from '../config/firebase'

/**
 * Firebase Storage Service
 * Handles all file upload/download operations
 */
class StorageService {
  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(file, path, onProgress = null) {
    try {
      const storageRef = ref(storage, path)
      
      if (onProgress) {
        // Use resumable upload with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file)
        
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
              resolve(downloadURL)
            }
          )
        })
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        return downloadURL
      }
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`)
    }
  }

  /**
   * Upload user document
   */
  async uploadUserDocument(userId, file, documentType, onProgress = null) {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const path = `users/${userId}/documents/${documentType}/${fileName}`
    
    const downloadURL = await this.uploadFile(file, path, onProgress)
    
    return {
      name: file.name,
      originalName: file.name,
      path,
      url: downloadURL,
      size: file.size,
      type: file.type,
      documentType,
      uploadedAt: new Date().toISOString(),
    }
  }

  /**
   * Upload generated PDF form
   */
  async uploadGeneratedForm(userId, pdfBlob, formName) {
    const timestamp = Date.now()
    const fileName = `${formName}_${timestamp}.pdf`
    const path = `users/${userId}/generated-forms/${fileName}`
    
    const downloadURL = await this.uploadFile(pdfBlob, path)
    
    return {
      name: fileName,
      path,
      url: downloadURL,
      size: pdfBlob.size,
      type: 'application/pdf',
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Upload form template (admin function)
   */
  async uploadFormTemplate(file, formId) {
    const path = `templates/${formId}/${file.name}`
    const downloadURL = await this.uploadFile(file, path)
    
    return {
      name: file.name,
      path,
      url: downloadURL,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }
  }

  /**
   * Get download URL for a file
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
   * Delete a file from storage
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
   * List all files in a directory
   */
  async listFiles(path) {
    try {
      const storageRef = ref(storage, path)
      const result = await listAll(storageRef)
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef)
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url,
          }
        })
      )
      
      return files
    } catch (error) {
      throw new Error(`Error listing files: ${error.message}`)
    }
  }

  /**
   * Get user's generated forms
   */
  async getUserGeneratedForms(userId) {
    return this.listFiles(`users/${userId}/generated-forms`)
  }

  /**
   * Get user's uploaded documents
   */
  async getUserDocuments(userId) {
    return this.listFiles(`users/${userId}/documents`)
  }

  /**
   * Validate file before upload
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    } = options

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`)
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`)
    }

    return true
  }
}

export default new StorageService()

