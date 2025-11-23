  /**
 * PDF Field Mappings
 * Maps application form fields to actual PDF form field names
 * 
 * IMPORTANT: These mappings need to be customized based on the actual
 * field names in your PDF files. Use the PDF Field Inspector utility
 * to discover the exact field names.
 * 
 * Usage:
 * 1. Load a PDF in your app
 * 2. Open browser console
 * 3. Run: inspectPDFFields('https://storage.googleapis.com/choonsik-madhack/form-templates/2024-wi-1.pdf')
 * 4. Copy the field names and update the mappings below
 */

/**
 * Format transformers - convert app data format to PDF format
 */
export const TRANSFORMERS = {
  // Format date from YYYY-MM-DD to MM/DD/YYYY
  dateMMDDYYYY: (value) => {
    if (!value) return ''
    const date = new Date(value)
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`
  },
  
  // Format SSN with or without dashes
  ssnNoDashes: (value) => value ? value.replace(/-/g, '') : '',
  ssnWithDashes: (value) => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '')
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`
  },
  
  // Format currency - dollars only (no cents)
  currency: (value) => {
    if (value === null || value === undefined || value === '') return '0'
    return Math.floor(Number(value)).toString()
  },
  
  // Boolean to X or checkbox mark
  checkmark: (value) => value ? 'X' : '',
  yesNo: (value) => value ? 'Yes' : 'No',
  
  // Format phone number
  phone: (value) => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '')
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
  },
}

/**
 * Wisconsin Form 1 Field Mappings
 * ACTUAL field names from 2024-wi-1.pdf
 */
export const WI_FORM_1_MAPPINGS = {
  formId: 'wi_form_1',
  formName: 'Wisconsin Form 1',
  templateFile: '2024-wi-1.pdf',
  
  fields: {
    // Personal Information (Filer)
    firstName: { pdfField: 'fname', transformer: null },
    middleInitial: { pdfField: 'mi', transformer: null },
    lastName: { pdfField: 'lname', transformer: null },
    
    // SSN is split into 3 fields: ss2 (first 3), ss3 (middle 2), ss4 (last 4)
    // We'll use a custom transformer to split the SSN
    ssn: { 
      pdfField: null, // Special handling needed
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return {
          ss2: cleaned.slice(0, 3),   // First 3 digits
          ss3: cleaned.slice(3, 5),   // Middle 2 digits
          ss4: cleaned.slice(5, 9),   // Last 4 digits
        }
      }
    },
    
    address: { pdfField: 'address', transformer: null },
    city: { pdfField: 'city', transformer: null },
    state: { pdfField: 'state', transformer: null },
    zipCode: { pdfField: 'zip', transformer: null },
    
    // Phone is split: area code and number
    phoneNumber: { 
      pdfField: null,
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return {
          area1: cleaned.slice(0, 3),    // Area code
          phone1: cleaned.slice(3, 10),  // Rest of number
        }
      }
    },
    
    // Spouse Information
    spouseFirstName: { pdfField: 'sfname', transformer: null },
    spouseMiddleInitial: { pdfField: 'smi', transformer: null },
    spouseLastName: { pdfField: 'splname', transformer: null },
    
    // Spouse SSN split into 3 fields
    spouseSSN: { 
      pdfField: null,
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return {
          sss2: cleaned.slice(0, 3),
          sss3: cleaned.slice(3, 5),
          sss4: cleaned.slice(5, 9),
        }
      }
    },
    
    // Filing Status - appears to use 'status' checkbox
    filingStatus: {
      pdfField: 'status',
      transformer: TRANSFORMERS.checkmark,
    },
    
    // Income - Line numbers from the form
    wages: { pdfField: '3wages', transformer: TRANSFORMERS.currency },
    taxableInterest: { pdfField: '4', transformer: TRANSFORMERS.currency },
    ordinaryDividends: { pdfField: '5', transformer: TRANSFORMERS.currency },
    capitalGains: { pdfField: '6', transformer: TRANSFORMERS.currency },
    otherIncome: { pdfField: '7', transformer: TRANSFORMERS.currency },
    businessIncome: { pdfField: '8', transformer: TRANSFORMERS.currency },
    unemploymentCompensation: { pdfField: '9', transformer: TRANSFORMERS.currency },
    
    // Deductions
    medicalExpenses: { pdfField: '15a', transformer: TRANSFORMERS.currency },
    stateTaxes: { pdfField: '16a', transformer: TRANSFORMERS.currency },
    mortgageInterest: { pdfField: '18', transformer: TRANSFORMERS.currency },
    charitableDonations: { pdfField: '19', transformer: TRANSFORMERS.currency },
    studentLoanInterest: { pdfField: '20', transformer: TRANSFORMERS.currency },
  },
}

/**
 * Federal Form 1040 Field Mappings
 * NOTE: These are EXAMPLE field names. Replace with actual PDF field names!
 */
export const FORM_1040_MAPPINGS = {
  formId: 'form_1040',
  formName: 'Form 1040',
  templateFile: '2024-fed-1040.pdf',
  
  fields: {
    // Similar structure as above
    firstName: { pdfField: 'f1_01', transformer: null },
    lastName: { pdfField: 'f1_02', transformer: null },
    ssn: { pdfField: 'f1_03', transformer: TRANSFORMERS.ssnNoDashes },
    // ... add more fields based on actual PDF inspection
  },
}

/**
 * Federal Form 1040-NR Field Mappings
 */
export const FORM_1040NR_MAPPINGS = {
  formId: 'form_1040nr',
  formName: 'Form 1040-NR',
  templateFile: '2024-fed-1040nr.pdf',
  
  fields: {
    // Similar structure
    firstName: { pdfField: 'f1_01', transformer: null },
    lastName: { pdfField: 'f1_02', transformer: null },
    // ... add more fields
  },
}

/**
 * Federal W-2 Field Mappings
 */
export const W2_MAPPINGS = {
  formId: 'w2',
  formName: 'W-2',
  templateFile: '2024-fed-w2.pdf',
  
  fields: {
    // Employer information
    employerName: { pdfField: 'employerName', transformer: null },
    employerEIN: { pdfField: 'employerEIN', transformer: null },
    employerAddress: { pdfField: 'employerAddress', transformer: null },
    
    // Employee information
    firstName: { pdfField: 'firstName', transformer: null },
    lastName: { pdfField: 'lastName', transformer: null },
    ssn: { pdfField: 'ssn', transformer: TRANSFORMERS.ssnNoDashes },
    
    // Wages and withholding
    wages: { pdfField: 'box1', transformer: TRANSFORMERS.currency },
    federalIncomeTaxWithheld: { pdfField: 'box2', transformer: TRANSFORMERS.currency },
    socialSecurityWages: { pdfField: 'box3', transformer: TRANSFORMERS.currency },
    socialSecurityTaxWithheld: { pdfField: 'box4', transformer: TRANSFORMERS.currency },
    medicareWages: { pdfField: 'box5', transformer: TRANSFORMERS.currency },
    medicareTaxWithheld: { pdfField: 'box6', transformer: TRANSFORMERS.currency },
  },
}

/**
 * Get mapping by form ID
 */
export function getFieldMapping(formId) {
  const mappings = {
    'wi_form_1': WI_FORM_1_MAPPINGS,
    'form_1040': FORM_1040_MAPPINGS,
    'form_1040nr': FORM_1040NR_MAPPINGS,
    'w2': W2_MAPPINGS,
  }
  
  return mappings[formId] || null
}

/**
 * Map application form data to PDF field data
 */
export function mapFormDataToPDF(formData, formId) {
  const mapping = getFieldMapping(formId)
  if (!mapping) {
    throw new Error(`No field mapping found for form: ${formId}`)
  }
  
  const pdfData = {}
  
  Object.keys(mapping.fields).forEach(appFieldName => {
    const fieldConfig = mapping.fields[appFieldName]
    let value = formData[appFieldName]
    
    // Skip if no value
    if (value === undefined || value === null || value === '') {
      return
    }
    
    // Apply value mapping if exists (for radio buttons, etc.)
    if (fieldConfig.valueMap && value in fieldConfig.valueMap) {
      value = fieldConfig.valueMap[value]
    }
    
    // Apply transformer if exists
    if (fieldConfig.transformer) {
      value = fieldConfig.transformer(value)
      
      // Handle transformers that return multiple fields (like SSN split)
      if (value && typeof value === 'object') {
        Object.assign(pdfData, value)
        return
      }
    }
    
    // Use PDF field name (skip if null - for special handling)
    if (fieldConfig.pdfField) {
      pdfData[fieldConfig.pdfField] = value
    }
  })
  
  return pdfData
}

export default {
  WI_FORM_1_MAPPINGS,
  FORM_1040_MAPPINGS,
  FORM_1040NR_MAPPINGS,
  W2_MAPPINGS,
  getFieldMapping,
  mapFormDataToPDF,
  TRANSFORMERS,
}

