import { format } from 'date-fns'

/**
 * General utility helper functions
 */

/**
 * Format date to readable string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return ''
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    return format(dateObj, formatStr)
  } catch (error) {
    return ''
  }
}

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Check if file is PDF
 */
export const isPDF = (file) => {
  return file.type === 'application/pdf' || getFileExtension(file.name).toLowerCase() === 'pdf'
}

/**
 * Check if file is image
 */
export const isImage = (file) => {
  return file.type.startsWith('image/')
}

/**
 * Truncate text
 */
export const truncate = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert to title case
 */
export const toTitleCase = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

/**
 * Calculate tax (simple calculation - replace with actual tax logic)
 */
export const calculateTax = (income, deductions = 0, filingStatus = 'single') => {
  const taxableIncome = Math.max(0, income - deductions)
  
  // Simplified tax brackets (2024 example - replace with actual brackets)
  const brackets = {
    single: [
      { max: 11000, rate: 0.10 },
      { max: 44725, rate: 0.12 },
      { max: 95375, rate: 0.22 },
      { max: 182100, rate: 0.24 },
      { max: 231250, rate: 0.32 },
      { max: 578125, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    married_filing_jointly: [
      { max: 22000, rate: 0.10 },
      { max: 89050, rate: 0.12 },
      { max: 190750, rate: 0.22 },
      { max: 364200, rate: 0.24 },
      { max: 462500, rate: 0.32 },
      { max: 693750, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
  }
  
  const applicableBrackets = brackets[filingStatus] || brackets.single
  let tax = 0
  let previousMax = 0
  
  for (const bracket of applicableBrackets) {
    if (taxableIncome > previousMax) {
      const taxableInThisBracket = Math.min(taxableIncome - previousMax, bracket.max - previousMax)
      tax += taxableInThisBracket * bracket.rate
      previousMax = bracket.max
    } else {
      break
    }
  }
  
  return Math.round(tax * 100) / 100
}

/**
 * Calculate total income
 */
export const calculateTotalIncome = (incomeData) => {
  const fields = ['wages', 'taxableInterest', 'ordinaryDividends', 'capitalGains', 'otherIncome', 'businessIncome', 'unemploymentCompensation']
  
  return fields.reduce((total, field) => {
    const value = parseFloat(incomeData[field]) || 0
    return total + value
  }, 0)
}

/**
 * Calculate total deductions
 */
export const calculateTotalDeductions = (deductionData) => {
  const fields = ['medicalExpenses', 'stateTaxes', 'mortgageInterest', 'charitableDonations', 'studentLoanInterest']
  
  return fields.reduce((total, field) => {
    const value = parseFloat(deductionData[field]) || 0
    return total + value
  }, 0)
}

/**
 * Download file from URL
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get error message from error object
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

