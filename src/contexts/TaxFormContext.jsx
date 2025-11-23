import { createContext, useContext, useState, useCallback } from 'react'
import gcsPublicService from '../services/gcsPublicService'

const TaxFormContext = createContext()

export function useTaxForm() {
  const context = useContext(TaxFormContext)
  if (!context) {
    throw new Error('useTaxForm must be used within a TaxFormProvider')
  }
  return context
}

export function TaxFormProvider({ children }) {
  const [currentForm, setCurrentForm] = useState(null)
  const [formData, setFormData] = useState({})
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [formTemplates, setFormTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentFormId, setCurrentFormId] = useState(null)

  /**
   * Load form templates from GCP bucket
   * Uses public access (templates are public blank forms)
   */
  const loadFormTemplates = useCallback(async () => {
    try {
      setLoading(true)
      // Use public access for templates (they're public documents anyway)
      const gcsFiles = await gcsPublicService.listFormTemplates()
      
      // Dynamically import to avoid circular dependency
      const { mapGCSFilesToForms } = await import('../utils/formTemplateMapper')
      const mappedTemplates = mapGCSFilesToForms(gcsFiles)
      
      setFormTemplates(mappedTemplates)
      return mappedTemplates
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Select a form template
   */
  const selectForm = useCallback((formTemplate) => {
    setCurrentForm(formTemplate)
    setCurrentFormId(formTemplate.id)
    setFormData({})
    setUploadedDocuments([])
  }, [])

  /**
   * Update form data
   */
  const updateFormData = useCallback((data) => {
    setFormData(prevData => ({
      ...prevData,
      ...data,
    }))
  }, [])

  /**
   * Save form data to GCP Storage
   */
  const saveFormData = useCallback(async (userId, metadata = {}) => {
    try {
      setLoading(true)
      
      if (!currentForm || !currentFormId) {
        throw new Error('No form selected')
      }

      const result = await gcsService.saveUserFormData(
        userId,
        currentFormId,
        {
          formTemplateId: currentForm.id,
          formType: currentForm.type,
          formName: currentForm.name,
          formData,
          uploadedDocuments,
          savedAt: new Date().toISOString(),
        },
        metadata
      )

      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentForm, currentFormId, formData, uploadedDocuments])

  /**
   * Load existing form data
   */
  const loadFormData = useCallback(async (userId, formId, fileName = null) => {
    try {
      setLoading(true)
      const result = await gcsService.getUserFormData(userId, formId, fileName)
      
      if (result.formData) {
        setCurrentFormId(formId)
        setCurrentForm({
          id: result.formData.formTemplateId,
          type: result.formData.formType,
          name: result.formData.formName,
        })
        setFormData(result.formData.formData || {})
        setUploadedDocuments(result.formData.uploadedDocuments || [])
      }
      
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Upload document
   */
  const uploadDocument = useCallback(async (userId, file, documentType, onProgress) => {
    try {
      if (!currentFormId) {
        throw new Error('No form selected')
      }

      // Validate file
      gcsService.validateFile(file, {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      })

      const documentData = await gcsService.uploadUserDocument(
        userId,
        currentFormId,
        file,
        documentType,
        onProgress
      )
      
      setUploadedDocuments(prev => [...prev, documentData])
      return documentData
    } catch (error) {
      throw error
    }
  }, [currentFormId])

  /**
   * Remove uploaded document
   */
  const removeDocument = useCallback(async (documentPath) => {
    try {
      await gcsService.deleteFile(documentPath)
      setUploadedDocuments(prev =>
        prev.filter(doc => doc.path !== documentPath)
      )
    } catch (error) {
      console.error('Error removing document:', error)
      throw error
    }
  }, [])

  /**
   * Clear form data
   */
  const clearForm = useCallback(() => {
    setCurrentForm(null)
    setCurrentFormId(null)
    setFormData({})
    setUploadedDocuments([])
  }, [])

  /**
   * Get user's form list
   */
  const getUserForms = useCallback(async (userId) => {
    try {
      setLoading(true)
      const forms = await gcsService.listUserForms(userId)
      return forms
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Generate and upload PDF
   */
  const generateAndUploadPDF = useCallback(async (userId, pdfBlob, onProgress) => {
    try {
      if (!currentForm || !currentFormId) {
        throw new Error('No form selected')
      }

      const result = await gcsService.uploadGeneratedPDF(
        userId,
        currentFormId,
        pdfBlob,
        currentForm.name,
        onProgress
      )

      return result
    } catch (error) {
      throw error
    }
  }, [currentForm, currentFormId])

  /**
   * Delete a form
   */
  const deleteForm = useCallback(async (userId, formId) => {
    try {
      setLoading(true)
      await gcsService.deleteUserForm(userId, formId)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    currentForm,
    currentFormId,
    formData,
    uploadedDocuments,
    formTemplates,
    loading,
    loadFormTemplates,
    selectForm,
    updateFormData,
    saveFormData,
    loadFormData,
    uploadDocument,
    removeDocument,
    clearForm,
    getUserForms,
    generateAndUploadPDF,
    deleteForm,
  }

  return (
    <TaxFormContext.Provider value={value}>
      {children}
    </TaxFormContext.Provider>
  )
}
