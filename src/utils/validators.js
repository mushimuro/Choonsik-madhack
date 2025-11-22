/**
 * Validation utility functions
 */

export const validators = {
  /**
   * Validate email format
   */
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  /**
   * Validate Social Security Number (XXX-XX-XXXX)
   */
  ssn: (value) => {
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/
    return ssnRegex.test(value)
  },

  /**
   * Validate phone number
   */
  phone: (value) => {
    const phoneRegex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/
    return phoneRegex.test(value)
  },

  /**
   * Validate ZIP code (5 digits or 5+4)
   */
  zipCode: (value) => {
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(value)
  },

  /**
   * Validate currency amount
   */
  currency: (value) => {
    const currencyRegex = /^\d+(\.\d{1,2})?$/
    return currencyRegex.test(value)
  },

  /**
   * Validate date (YYYY-MM-DD)
   */
  date: (value) => {
    const date = new Date(value)
    return date instanceof Date && !isNaN(date)
  },

  /**
   * Validate required field
   */
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return value !== null && value !== undefined && value !== ''
  },

  /**
   * Validate minimum length
   */
  minLength: (value, length) => {
    return value && value.length >= length
  },

  /**
   * Validate maximum length
   */
  maxLength: (value, length) => {
    return !value || value.length <= length
  },

  /**
   * Validate minimum value
   */
  min: (value, minValue) => {
    const num = parseFloat(value)
    return !isNaN(num) && num >= minValue
  },

  /**
   * Validate maximum value
   */
  max: (value, maxValue) => {
    const num = parseFloat(value)
    return !isNaN(num) && num <= maxValue
  },

  /**
   * Validate pattern
   */
  pattern: (value, pattern) => {
    const regex = new RegExp(pattern)
    return regex.test(value)
  },
}

/**
 * Format SSN with dashes
 */
export const formatSSN = (value) => {
  const cleaned = value.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/)
  
  if (match) {
    return !match[2]
      ? match[1]
      : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ''}`
  }
  
  return value
}

/**
 * Format phone number
 */
export const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
  
  if (match) {
    return !match[2]
      ? match[1]
      : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`
  }
  
  return value
}

/**
 * Format currency
 */
export const formatCurrency = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

/**
 * Parse currency string to number
 */
export const parseCurrency = (value) => {
  if (typeof value === 'number') return value
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Validate form data against field definitions
 */
export const validateForm = (formData, fieldDefinitions) => {
  const errors = {}

  fieldDefinitions.forEach(field => {
    const value = formData[field.name]

    // Check required
    if (field.required && !validators.required(value)) {
      errors[field.name] = `${field.label} is required`
      return
    }

    // Skip validation if field is empty and not required
    if (!validators.required(value)) {
      return
    }

    // Validate by type
    switch (field.type) {
      case 'email':
        if (!validators.email(value)) {
          errors[field.name] = 'Invalid email address'
        }
        break
      case 'tel':
        if (!validators.phone(value)) {
          errors[field.name] = 'Invalid phone number'
        }
        break
      case 'number':
        const num = parseFloat(value)
        if (isNaN(num)) {
          errors[field.name] = 'Must be a valid number'
        } else {
          if (field.min !== undefined && !validators.min(value, field.min)) {
            errors[field.name] = `Must be at least ${field.min}`
          }
          if (field.max !== undefined && !validators.max(value, field.max)) {
            errors[field.name] = `Must be at most ${field.max}`
          }
        }
        break
      case 'date':
        if (!validators.date(value)) {
          errors[field.name] = 'Invalid date'
        }
        break
      default:
        // Text validation
        if (field.minLength && !validators.minLength(value, field.minLength)) {
          errors[field.name] = `Must be at least ${field.minLength} characters`
        }
        if (field.maxLength && !validators.maxLength(value, field.maxLength)) {
          errors[field.name] = `Must be at most ${field.maxLength} characters`
        }
        if (field.pattern && !validators.pattern(value, field.pattern)) {
          errors[field.name] = `Invalid format for ${field.label}`
        }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

