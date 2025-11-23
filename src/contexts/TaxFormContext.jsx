import { createContext, useContext, useState, useCallback, useEffect } from 'react'
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
   * Auto-save to localStorage whenever form data changes
   */
  useEffect(() => {
    if (currentFormId && Object.keys(formData).length > 0) {
      const key = `taxform_${currentFormId}`
      localStorage.setItem(key, JSON.stringify({
        formData,
        uploadedDocuments,
        currentForm,
        savedAt: new Date().toISOString(),
      }))
      console.log('📝 Auto-saved to localStorage:', key)
    }
  }, [formData, uploadedDocuments, currentFormId, currentForm])

  /**
   * Load form templates from GCS (public access)
   */
  const loadFormTemplates = useCallback(async () => {
    try {
      setLoading(true)
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
    
    // Try to load saved data from localStorage
    const key = `taxform_${formTemplate.id}`
    const saved = localStorage.getItem(key)
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed.formData || {})
        setUploadedDocuments(parsed.uploadedDocuments || [])
        console.log('📂 Loaded saved data from localStorage')
      } catch (e) {
        console.error('Error parsing saved data:', e)
        setFormData({})
        setUploadedDocuments([])
      }
    } else {
      setFormData({})
      setUploadedDocuments([])
    }
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
   * Save form data (to localStorage)
   */
  const saveFormData = useCallback(async (userId, metadata = {}) => {
    try {
      if (!currentForm || !currentFormId) {
        throw new Error('No form selected')
      }

      const key = `taxform_${currentFormId}`
      const dataToSave = {
        formTemplateId: currentForm.id,
        formType: currentForm.type,
        formName: currentForm.name,
        formData,
        uploadedDocuments,
        savedAt: new Date().toISOString(),
        userId,
        ...metadata,
      }

      localStorage.setItem(key, JSON.stringify(dataToSave))
      console.log('✅ Saved to localStorage:', key)

      return { success: true, key }
    } catch (error) {
      throw error
    }
  }, [currentForm, currentFormId, formData, uploadedDocuments])

  /**
   * Load existing form data (from localStorage)
   */
  const loadFormData = useCallback(async (userId, formId) => {
    try {
      setLoading(true)
      const key = `taxform_${formId}`
      const saved = localStorage.getItem(key)
      
      if (saved) {
        const parsed = JSON.parse(saved)
        setCurrentFormId(formId)
        setCurrentForm({
          id: parsed.formTemplateId,
          type: parsed.formType,
          name: parsed.formName,
        })
        setFormData(parsed.formData || {})
        setUploadedDocuments(parsed.uploadedDocuments || [])
        return parsed
      }

      return null
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Upload document (store in memory/localStorage, actual upload would need backend)
   */
  const uploadDocument = useCallback(async (userId, file, documentType) => {
    try {
      if (!currentFormId) {
        throw new Error('No form selected')
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large (max 10MB)')
      }

      // Create document metadata
      const documentData = {
        name: file.name,
        documentType,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }
      
      setUploadedDocuments(prev => [...prev, documentData])
      console.log('📎 Document added:', file.name)
      
      return documentData
    } catch (error) {
      throw error
    }
  }, [currentFormId])

  /**
   * Remove uploaded document
   */
  const removeDocument = useCallback(async (documentName) => {
    try {
      setUploadedDocuments(prev =>
        prev.filter(doc => doc.name !== documentName)
      )
      console.log('🗑️ Document removed:', documentName)
    } catch (error) {
      console.error('Error removing document:', error)
      throw error
    }
  }, [])

  /**
   * Clear form data
   */
  const clearForm = useCallback(() => {
    if (currentFormId) {
      const key = `taxform_${currentFormId}`
      localStorage.removeItem(key)
      console.log('🗑️ Cleared form from localStorage:', key)
    }
    setCurrentForm(null)
    setCurrentFormId(null)
    setFormData({})
    setUploadedDocuments([])
  }, [currentFormId])

  /**
   * Get user's saved forms (from localStorage)
   */
  const getUserForms = useCallback(async (userId) => {
    try {
      setLoading(true)
      const forms = []
      
      // Scan localStorage for saved forms
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('taxform_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.userId === userId) {
              forms.push({
                formId: key.replace('taxform_', ''),
                ...data,
              })
            }
          } catch (e) {
            console.error('Error parsing form:', key, e)
          }
        }
      }
      
      // Sort by savedAt
      forms.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      
      return forms
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Generate and download PDF (no upload - downloads only)
   */
  const generateAndUploadPDF = useCallback(async (userId, pdfBlob, filename) => {
    try {
      if (!currentForm || !currentFormId) {
        throw new Error('No form selected')
      }

      console.log('📥 PDF ready for download:', {
        filename,
        size: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
      })

      // Note: GCS upload from browser requires Cloud Function or backend
      // For now, we only support download
      return {
        success: true,
        message: 'PDF generated successfully',
        filename,
        size: pdfBlob.size,
      }
    } catch (error) {
      throw error
    }
  }, [currentForm, currentFormId])

  /**
   * Delete a form (from localStorage)
   */
  const deleteForm = useCallback(async (userId, formId) => {
    try {
      setLoading(true)
      const key = `taxform_${formId}`
      localStorage.removeItem(key)
      console.log('🗑️ Deleted form:', key)
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
