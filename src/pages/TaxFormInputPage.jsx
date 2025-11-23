import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { toast } from 'react-toastify'
import { WI_FORM_1_SECTIONS } from '../constants/formFields'
import FormField from '../components/Forms/FormField'
import Button from '../components/Common/Button'
import Card from '../components/Common/Card'
import Loading from '../components/Common/Loading'
import { useForm } from '../hooks/useForm'
import './TaxFormInputPage.css'

const TaxFormInputPage = () => {
  const { formId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentForm, formData, updateFormData, saveFormData, saveDraftToGCS, loadDraftFromGCS } = useTaxForm()
  const [currentSection, setCurrentSection] = useState(0)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false)

  // Get sections for the current form (defaulting to WI Form 1 for now)
  const sections = WI_FORM_1_SECTIONS

  // 👇 read draft param once per render
  const draftUrl = searchParams.get('draft') || null

  const { 
    values, 
    errors, 
    touched, 
    isSubmitting,
    handleChange, 
    handleBlur,
    setFieldValues,
    validate,
    setFieldError,
    touchAllFields
  } = useForm(formData, sections[currentSection]?.fields || [])

  // Load draft from GCS only once (if ?draft= is present)
  useEffect(() => {
    if (draftUrl && !hasLoadedDraft) {
      // load draft only once
      loadDraft(draftUrl)
      setHasLoadedDraft(true)
    } else if (!draftUrl && !currentForm) {
      // no draft param and no form selected → redirect
      toast.error('Please select a form first')
      navigate('/forms')
    }
  }, [draftUrl, hasLoadedDraft, currentForm, navigate])

  // Initialize form values from context
  useEffect(() => {
    setFieldValues(formData)
  }, [formData, setFieldValues])

  // Current section + condition
  const section = sections[currentSection]
  const shouldShowSection = section?.condition ? section.condition(values) : true

  const findNextValidSection = useCallback((startIndex, direction = 1) => {
    let nextIndex = startIndex + direction
    
    while (nextIndex >= 0 && nextIndex < sections.length) {
      const nextSection = sections[nextIndex]
      const shouldShow = nextSection.condition ? nextSection.condition(values) : true
      
      if (shouldShow) {
        return nextIndex
      }
      
      nextIndex += direction
    }
    
    return direction > 0 ? sections.length : -1
  }, [sections, values])

  // Auto-navigate to next valid section if current section is hidden
  useEffect(() => {
    if (!shouldShowSection && currentForm) {
      const nextValid = findNextValidSection(currentSection, 1)
      if (nextValid < sections.length && nextValid !== currentSection) {
        setCurrentSection(nextValid)
      }
    }
  }, [shouldShowSection, currentSection, findNextValidSection, currentForm, sections.length])

  const loadDraft = async (draftUrl) => {
    try {
      setLoadingDraft(true)
      await loadDraftFromGCS(draftUrl)
      toast.success('Draft loaded successfully!')
    } catch (error) {
      toast.error('Error loading draft: ' + error.message)
      navigate('/forms')
    } finally {
      setLoadingDraft(false)
    }
  }

  const handleNext = async () => {
    const validation = validate()
    
    if (!validation.isValid) {
      touchAllFields()
      toast.error('Please fill out all required fields before continuing.')

      const firstErrorField = Object.keys(validation.errors)[0]
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        if (element) {
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      
      return
    }
    
    updateFormData(values)
    
    try {
      await saveFormData(currentUser.uid, { status: 'in_progress' })
      console.log('💾 Saved on Next navigation')
    } catch (error) {
      console.error('Error saving on navigation:', error)
    }

    const nextValidSection = findNextValidSection(currentSection, 1)
    
    if (nextValidSection < sections.length) {
      setCurrentSection(nextValidSection)
    } else {
      handleSaveAndContinue()
    }
  }

  const handlePrevious = async () => {
    updateFormData(values)
    
    try {
      await saveFormData(currentUser.uid, { status: 'in_progress' })
      console.log('💾 Saved on Previous navigation')
    } catch (error) {
      console.error('Error saving on navigation:', error)
    }
    
    const prevValidSection = findNextValidSection(currentSection, -1)
    
    if (prevValidSection >= 0) {
      setCurrentSection(prevValidSection)
    }
  }

  const handleSaveAndContinue = async () => {
    try {
      updateFormData(values)
      await saveFormData(currentUser.uid, { status: 'in_progress' })
      toast.success('Form saved successfully!')
      navigate(`/forms/${formId}/upload`)
    } catch (error) {
      toast.error('Error saving form: ' + error.message)
    }
  }

  const handleSaveDraft = async () => {
    try {
      updateFormData(values)
      await saveDraftToGCS(currentUser.uid)
      await saveFormData(currentUser.uid, { status: 'draft' })
      toast.success('Draft saved successfully! You can continue editing from Dashboard or History.')
    } catch (error) {
      toast.error('Error saving draft: ' + error.message)
    }
  }

  if (loadingDraft) {
    return (
      <div className="tax-form-input-page">
        <div className="container">
          <Card>
            <Loading text="Loading your draft..." />
          </Card>
        </div>
      </div>
    )
  }

  if (!currentForm) {
    return null
  }

  if (!shouldShowSection) {
    return null
  }

  return (
    <div className="tax-form-input-page">
      <div className="container">
        <div className="form-header">
          <h1>{currentForm.fullName}</h1>
          <p className="form-subtitle">{currentForm.description}</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          {sections.map((sec, index) => (
            <div
              key={index}
              className={`progress-step ${
                index === currentSection ? 'active' : ''
              } ${index < currentSection ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{sec.title}</div>
            </div>
          ))}
        </div>

        <Card title={section.title}>
          <form className="tax-form">
            <div className="form-grid">
              {section.fields.map((field) => (
                <div key={field.name} className="form-field-wrapper">
                  <FormField
                    field={field}
                    value={values[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors[field.name]}
                    touched={touched[field.name]}
                  />
                </div>
              ))}
            </div>

            <div className="form-actions">
              <div className="form-actions-navigation">
                {currentSection > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                >
                  {currentSection < sections.length - 1 ? 'Next' : 'Continue'}
                </Button>
              </div>
              <div className="form-actions-save">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  loading={isSubmitting}
                >
                  Save Draft
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default TaxFormInputPage
