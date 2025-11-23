import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTaxForm } from '../contexts/TaxFormContext'
import { toast } from 'react-toastify'
import { WI_FORM_1_SECTIONS } from '../constants/formFields'
import FormField from '../components/Forms/FormField'
import Button from '../components/Common/Button'
import Card from '../components/Common/Card'
import { useForm } from '../hooks/useForm'
import './TaxFormInputPage.css'

const TaxFormInputPage = () => {
  const { formId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { currentForm, formData, updateFormData, saveFormData } = useTaxForm()
  const [currentSection, setCurrentSection] = useState(0)

  // Get sections for the current form (defaulting to WI Form 1 for now)
  const sections = WI_FORM_1_SECTIONS

  const { 
    values, 
    errors, 
    touched, 
    isSubmitting,
    handleChange, 
    handleBlur,
    setFieldValues 
  } = useForm(formData, sections[currentSection]?.fields || [])

  useEffect(() => {
    if (!currentForm) {
      toast.error('Please select a form first')
      navigate('/forms')
    }
  }, [currentForm, navigate])

  useEffect(() => {
    // Initialize form values from context
    setFieldValues(formData)
  }, [formData, setFieldValues])

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

  const handleNext = () => {
    // Save current section data
    updateFormData(values)

    const nextValidSection = findNextValidSection(currentSection, 1)
    
    if (nextValidSection < sections.length) {
      setCurrentSection(nextValidSection)
    } else {
      // Last section - proceed to document upload
      handleSaveAndContinue()
    }
  }

  const handlePrevious = () => {
    updateFormData(values)
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
      await saveFormData(currentUser.uid, { status: 'draft' })
      toast.success('Draft saved successfully!')
    } catch (error) {
      toast.error('Error saving draft: ' + error.message)
    }
  }

  if (!currentForm) {
    return null
  }

  const section = sections[currentSection]
  
  // Validate that current section should be shown
  const shouldShowSection = section.condition ? section.condition(values) : true
  
  // If current section shouldn't be shown, find next valid section
  useEffect(() => {
    if (!shouldShowSection) {
      const nextValid = findNextValidSection(currentSection, 1)
      if (nextValid < sections.length && nextValid !== currentSection) {
        setCurrentSection(nextValid)
      }
    }
  }, [shouldShowSection, currentSection, findNextValidSection])
  
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

