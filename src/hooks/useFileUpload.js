import { useState, useCallback } from 'react'
import storageService from '../services/storageService'

/**
 * Custom hook for file upload handling
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  /**
   * Upload file
   */
  const uploadFile = useCallback(async (file, userId, documentType) => {
    try {
      setUploading(true)
      setProgress(0)
      setError(null)

      // Validate file
      storageService.validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      })

      // Upload with progress tracking
      const result = await storageService.uploadUserDocument(
        userId,
        file,
        documentType,
        (progressValue) => {
          setProgress(progressValue)
        }
      )

      setUploading(false)
      setProgress(100)
      return result
    } catch (err) {
      setUploading(false)
      setError(err.message)
      throw err
    }
  }, [])

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(async (files, userId, documentType) => {
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i], userId, documentType)
        results.push(result)
      } catch (err) {
        console.error(`Error uploading file ${files[i].name}:`, err)
      }
    }
    
    return results
  }, [uploadFile])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadFiles,
    reset,
  }
}

