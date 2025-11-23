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
   * Auto-save disabled - now saves only on navigation (Previous/Next) or Save Draft
   * This prevents excessive localStorage writes and gives users more control
   */

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
   * Save draft to GCS (for persistent storage across devices)
   */
  const saveDraftToGCS = useCallback(async (userId) => {
    try {
      setLoading(true)
      if (!currentForm || !currentFormId) {
        throw new Error('No form selected')
      }

      const draftData = {
        formTemplateId: currentForm.id,
        formType: currentForm.type,
        formName: currentForm.fullName || currentForm.name,
        formData,
        uploadedDocuments,
        status: 'draft',
        savedAt: new Date().toISOString(),
        userId,
      }

      // Generate a unique draft ID (using timestamp and form ID)
      const draftId = `${currentFormId}_${Date.now()}`
      const fileName = `draft_${draftId}.json`
      
      // Upload to GCS via Cloud Function
      // Get Firebase Auth token
      const { auth } = await import('../config/firebase')
      const token = await auth.currentUser.getIdToken()
      
      // Convert draft data to base64
      const jsonString = JSON.stringify(draftData, null, 2)
      const jsonBase64 = btoa(unescape(encodeURIComponent(jsonString)))

      const response = await fetch(
        'https://us-central1-choonsik-madhack.cloudfunctions.net/uploadPDF',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            formId: 'drafts',
            pdfBase64: jsonBase64,
            filename: fileName,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Upload error response:', errorData)
        throw new Error(errorData.error || `Failed to save draft to GCS: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Draft saved to GCS:', result.path)

      return { success: true, draftId, path: result.path }
    } catch (error) {
      console.error('Error saving draft to GCS:', error)
      throw error
    } finally {
      setLoading(false)
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
   * Clear form and start fresh (no cached data)
   */
  const startFreshForm = useCallback((formTemplate) => {
    setCurrentForm(formTemplate)
    setCurrentFormId(formTemplate.id)
    setFormData({})
    setUploadedDocuments([])
    
    // Clear localStorage cache for this form
    const key = `taxform_${formTemplate.id}`
    localStorage.removeItem(key)
    
    console.log('🆕 Started fresh form:', formTemplate.name)
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
   * List user's drafts from GCS
   */
  const getUserDrafts = useCallback(async (userId) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://storage.googleapis.com/storage/v1/b/choonsik-madhack/o?prefix=user-tax-forms/${userId}/drafts/`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to list drafts from GCS')
      }

      const data = await response.json()
      const drafts = []

      // Fetch each draft's content
      if (data.items) {
        for (const item of data.items) {
          try {
            // Download the draft JSON file
            const draftResponse = await fetch(
              `https://storage.googleapis.com/choonsik-madhack/${item.name}`
            )
            const draftData = await draftResponse.json()
            
            drafts.push({
              ...draftData,
              gcsPath: item.name,
              gcsUrl: `https://storage.googleapis.com/choonsik-madhack/${item.name}`,
            })
          } catch (e) {
            console.error('Error fetching draft:', item.name, e)
          }
        }
      }

      // Sort by savedAt
      drafts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      
      return drafts
    } catch (error) {
      console.error('Error listing drafts from GCS:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load a draft from GCS
   */
  const loadDraftFromGCS = useCallback(async (gcsUrl) => {
    try {
      setLoading(true)
      const response = await fetch(gcsUrl)
      const draftData = await response.json()
      
      setCurrentFormId(draftData.formTemplateId)
      setCurrentForm({
        id: draftData.formTemplateId,
        type: draftData.formType,
        name: draftData.formName,
        fullName: draftData.formName,
      })
      setFormData(draftData.formData || {})
      setUploadedDocuments(draftData.uploadedDocuments || [])
      
      console.log('📂 Loaded draft from GCS')
      return draftData
    } catch (error) {
      console.error('Error loading draft from GCS:', error)
      throw error
    } finally {
      setLoading(false)
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
   * Get user's completed forms from GCS
   */
  const getUserCompletedForms = useCallback(async (userId) => {
    try {
      const response = await fetch(
        `https://storage.googleapis.com/storage/v1/b/choonsik-madhack/o?prefix=user-tax-forms/${userId}/`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        console.error('Failed to list completed forms from GCS')
        return []
      }

      const data = await response.json()
      const forms = []

      // Filter out draft files and group by form
      if (data.items) {
        for (const item of data.items) {
          // Skip draft files
          if (item.name.includes('/drafts/')) {
            continue
          }
          
          // Only include PDF files
          if (item.name.endsWith('.pdf')) {
            // Extract form info from path: user-tax-forms/{userId}/{formId}/{filename}
            const pathParts = item.name.split('/')
            const formId = pathParts[2] || 'unknown'
            const fileName = pathParts[3] || item.name
            
            forms.push({
              id: `${formId}_${item.timeCreated}`,
              formId: formId,
              formName: fileName.replace('.pdf', ''),
              formType: 'completed',
              status: 'completed',
              savedAt: item.timeCreated,
              gcsPath: item.name,
              gcsUrl: `https://storage.googleapis.com/choonsik-madhack/${item.name}`,
              size: item.size,
            })
          }
        }
      }

      return forms
    } catch (error) {
      console.error('Error listing completed forms from GCS:', error)
      return []
    }
  }, [])

  /**
   * Get user's saved forms (from localStorage and GCS)
   */
  const getUserForms = useCallback(async (userId) => {
    try {
      setLoading(true)
      const forms = []
      
      // 1. Scan localStorage for saved forms (in-progress)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('taxform_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key))
            if (data.userId === userId && data.status !== 'draft') {
              forms.push({
                id: key.replace('taxform_', ''),
                formId: key.replace('taxform_', ''),
                ...data,
              })
            }
          } catch (e) {
            console.error('Error parsing form:', key, e)
          }
        }
      }
      
      // 2. Fetch completed forms from GCS
      const completedForms = await getUserCompletedForms(userId)
      forms.push(...completedForms)
      
      // Sort by savedAt
      forms.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      
      return forms
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [getUserCompletedForms])

  /**
   * Generate and upload PDF to GCS via Cloud Function
   */
  const generateAndUploadPDF = useCallback(async (userId, pdfBlob, filename) => {
    try {
      if (!currentForm || !currentFormId) {
        throw new Error('No form selected')
      }

      console.log('📤 Uploading PDF to GCS via Cloud Function...')

      // Convert blob to base64
      const reader = new FileReader()
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1] // Remove data:application/pdf;base64, prefix
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(pdfBlob)
      })

      const pdfBase64 = await base64Promise

      // Get Firebase Auth token
      const { auth } = await import('../config/firebase')
      const token = await auth.currentUser.getIdToken()

      // Call Cloud Function
      const cloudFunctionUrl = `https://us-central1-choonsik-madhack.cloudfunctions.net/uploadPDF`
      
      const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          formId: currentFormId,
          pdfBase64,
          filename,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      const result = await response.json()
      console.log('✅ PDF uploaded to GCS:', result.filePath)

      return result
    } catch (error) {
      console.error('❌ Error uploading PDF:', error)
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
    saveDraftToGCS,
    startFreshForm,
    getUserDrafts,
    loadDraftFromGCS,
  }

  return (
    <TaxFormContext.Provider value={value}>
      {children}
    </TaxFormContext.Provider>
  )
}
