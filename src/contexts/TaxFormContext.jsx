import { createContext, useContext, useState, useCallback } from 'react'
import firestoreService from '../services/firestoreService'
import storageService from '../services/storageService'

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

  /**
   * Load form templates from database
   */
  const loadFormTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const templates = await firestoreService.getFormTemplates()
      setFormTemplates(templates)
      return templates
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
   * Save form draft to database
   */
  const saveFormDraft = useCallback(async (userId) => {
    try {
      setLoading(true)
      
      if (!currentForm) {
        throw new Error('No form selected')
      }

      const formId = await firestoreService.createTaxForm(userId, {
        formTemplateId: currentForm.id,
        formType: currentForm.type,
        formName: currentForm.name,
        formData,
        uploadedDocuments,
        status: 'draft',
      })

      return formId
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentForm, formData, uploadedDocuments])

  /**
   * Load existing form
   */
  const loadForm = useCallback(async (formId) => {
    try {
      setLoading(true)
      const form = await firestoreService.getTaxForm(formId)
      
      if (form) {
        setCurrentForm({
          id: form.formTemplateId,
          type: form.formType,
          name: form.formName,
        })
        setFormData(form.formData || {})
        setUploadedDocuments(form.uploadedDocuments || [])
      }
      
      return form
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
      const documentData = await storageService.uploadUserDocument(
        userId,
        file,
        documentType,
        onProgress
      )
      
      setUploadedDocuments(prev => [...prev, documentData])
      return documentData
    } catch (error) {
      throw error
    }
  }, [])

  /**
   * Remove uploaded document
   */
  const removeDocument = useCallback((documentPath) => {
    setUploadedDocuments(prev =>
      prev.filter(doc => doc.path !== documentPath)
    )
  }, [])

  /**
   * Clear form data
   */
  const clearForm = useCallback(() => {
    setCurrentForm(null)
    setFormData({})
    setUploadedDocuments([])
  }, [])

  /**
   * Get user's form history
   */
  const getUserForms = useCallback(async (userId) => {
    try {
      setLoading(true)
      const forms = await firestoreService.getUserTaxForms(userId)
      return forms
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    currentForm,
    formData,
    uploadedDocuments,
    formTemplates,
    loading,
    loadFormTemplates,
    selectForm,
    updateFormData,
    saveFormDraft,
    loadForm,
    uploadDocument,
    removeDocument,
    clearForm,
    getUserForms,
  }

  return (
    <TaxFormContext.Provider value={value}>
      {children}
    </TaxFormContext.Provider>
  )
}

