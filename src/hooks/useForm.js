import { useState, useCallback } from 'react'
import { validateForm } from '../utils/validators'

/**
 * Custom hook for form handling
 */
export const useForm = (initialValues = {}, fieldDefinitions = []) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handle field change
   */
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }, [errors])

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((event) => {
    const { name } = event.target
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }))
  }, [])

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  /**
   * Set multiple field values
   */
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }))
  }, [])

  /**
   * Set field error
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }))
  }, [])

  /**
   * Mark all fields as touched
   */
  const touchAllFields = useCallback(() => {
    const allTouched = fieldDefinitions.reduce((acc, field) => {
      acc[field.name] = true
      return acc
    }, {})
    setTouched(allTouched)
  }, [fieldDefinitions])

  /**
   * Validate form
   */
  const validate = useCallback(() => {
    if (fieldDefinitions.length === 0) {
      return { isValid: true, errors: {} }
    }

    const validation = validateForm(values, fieldDefinitions)
    setErrors(validation.errors)
    return validation
  }, [values, fieldDefinitions])

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      event.preventDefault()
      
      setIsSubmitting(true)
      
      // Mark all fields as touched
      const allTouched = fieldDefinitions.reduce((acc, field) => {
        acc[field.name] = true
        return acc
      }, {})
      setTouched(allTouched)
      
      // Validate
      const validation = validate()
      
      if (validation.isValid) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Form submission error:', error)
        }
      }
      
      setIsSubmitting(false)
    }
  }, [values, validate, fieldDefinitions])

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldValues,
    setFieldError,
    validate,
    resetForm,
    touchAllFields,
  }
}

