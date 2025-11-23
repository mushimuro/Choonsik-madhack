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
  
  // Capitalize first letter, lowercase rest (for cities)
  capitalizeFirst: (value) => {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  },
  
  // Uppercase all letters (for states)
  uppercase: (value) => {
    if (!value) return ''
    return value.toUpperCase()
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
    
    // Individual's SSN split into 3 fields: ss3 (first 3), ss2 (middle 2), ss4 (last 4)
    ssn: { 
      pdfField: null,
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return {
          ss3: cleaned.slice(0, 3),   // First 3 digits (111)
          ss2: cleaned.slice(3, 5),   // Middle 2 digits (22)
          ss4: cleaned.slice(5, 9),   // Last 4 digits (3333)
        }
      }
    },
    
    address: { pdfField: 'address', transformer: null },
    apt: { pdfField: 'apt', transformer: null },
    city: { pdfField: 'city', transformer: TRANSFORMERS.capitalizeFirst },
    state: { pdfField: 'state', transformer: TRANSFORMERS.uppercase },
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
    
    // Spouse SSN split into 3 fields: sss3 (first 3), sss2 (middle 2), sss4 (last 4)
    spouseSSN: { 
      pdfField: null,
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return {
          sss3: cleaned.slice(0, 3),   // First 3 digits (111)
          sss2: cleaned.slice(3, 5),   // Middle 2 digits (22)
          sss4: cleaned.slice(5, 9),   // Last 4 digits (3333)
        }
      }
    },

    filingStatus: {
      pdfField: null,
      transformer: (value) => {
        const statusMap = {
          single: 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[0]',
          married_filing_jointly: 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[1]',
          married_filing_separately: 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[2]',
          head_of_household: 'topmostSubform[0].Page1[0].c1_3[0]',
          qualifying_widow: 'topmostSubform[0].Page1[0].c1_3[1]',
        }
    
        // Build object where all checkboxes are set to false, except selected one
        const result = {}
    
        for (const key in statusMap) {
          result[statusMap[key]] = (key === value)
        }
    
        return result
      }
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
 * ACTUAL field names from 2024-fed-1040.pdf
 */
export const FORM_1040_MAPPINGS = {
  formId: 'form_1040',
  formName: 'Form 1040',
  templateFile: '2024-fed-1040.pdf',
  
  fields: {
    // Personal Information - Page 1
    // First name and middle initial go in the same field (f1_04)
    firstName: { 
      pdfField: 'topmostSubform[0].Page1[0].f1_04[0]', 
      transformer: (value, allData) => {
        // Combine first name and middle initial
        const middleInitial = allData.middleInitial || ''
        return middleInitial ? `${value} ${middleInitial}` : value
      }
    },
    middleInitial: { pdfField: null, transformer: null }, // Combined with firstName
    lastName: { pdfField: 'topmostSubform[0].Page1[0].f1_05[0]', transformer: null },
    
    // SSN goes in f1_06 as a single field (max 9 characters - just digits, no spaces or dashes)
    ssn: { 
      pdfField: 'topmostSubform[0].Page1[0].f1_06[0]',
      transformer: (value) => {
        if (!value) return null
        // Remove all non-digits and ensure exactly 9 characters
        const cleaned = value.replace(/\D/g, '').slice(0, 9)
        return cleaned
      }
    },
    
    // Spouse Information
    spouseFirstName: { pdfField: 'topmostSubform[0].Page1[0].f1_07[0]', transformer: null },
    spouseMiddleInitial: { pdfField: 'topmostSubform[0].Page1[0].f1_08[0]', transformer: null },
    spouseLastName: { pdfField: 'topmostSubform[0].Page1[0].f1_09[0]', transformer: null },
    
    // Address
    address: { pdfField: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_10[0]', transformer: null },
    apt: { pdfField: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_11[0]', transformer: null },
    city: { pdfField: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_12[0]', transformer: TRANSFORMERS.capitalizeFirst },
    state: { pdfField: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_13[0]', transformer: TRANSFORMERS.uppercase },
    zipCode: { pdfField: 'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_14[0]', transformer: null },
    
    // Filing Status (checkboxes)
    filingStatus: {
      pdfField: null,
      transformer: (value) => {
        const statusMap = {
          'single': 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[0]',
          'married_filing_jointly': 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[1]',
          'married_filing_separately': 'topmostSubform[0].Page1[0].FilingStatus_ReadOrder[0].c1_3[2]',
          'head_of_household': 'topmostSubform[0].Page1[0].c1_3[0]',
          'qualifying_widow': 'topmostSubform[0].Page1[0].c1_3[1]',
        }
        const field = statusMap[value]
        return field ? { [field]: true } : null
      }
    },
    
    // Income - Line 1 (wages)
    wages: { pdfField: 'topmostSubform[0].Page1[0].f1_32[0]', transformer: TRANSFORMERS.currency },
    
    // Income - Line 2b (taxable interest)
    taxableInterest: { pdfField: 'topmostSubform[0].Page1[0].f1_35[0]', transformer: TRANSFORMERS.currency },
    
    // Income - Line 3b (ordinary dividends)
    ordinaryDividends: { pdfField: 'topmostSubform[0].Page1[0].f1_37[0]', transformer: TRANSFORMERS.currency },
    
    // Income - Line 7 (capital gains)
    capitalGains: { pdfField: 'topmostSubform[0].Page1[0].f1_44[0]', transformer: TRANSFORMERS.currency },
    
    // Income - Line 8 (other income)
    otherIncome: { pdfField: 'topmostSubform[0].Page1[0].Line4a-11_ReadOrder[0].f1_48[0]', transformer: TRANSFORMERS.currency },
    
    // Income - Total income (Line 9)
    totalIncome: { pdfField: 'topmostSubform[0].Page1[0].f1_57[0]', transformer: TRANSFORMERS.currency },
    
    // Adjusted Gross Income (Line 11)
    adjustedGrossIncome: { pdfField: 'topmostSubform[0].Page1[0].f1_60[0]', transformer: TRANSFORMERS.currency },
    
    // Standard Deduction (Line 12)
    standardDeduction: { pdfField: 'topmostSubform[0].Page2[0].f2_01[0]', transformer: TRANSFORMERS.currency },
    
    // Deductions - Page 2
    medicalExpenses: { pdfField: 'topmostSubform[0].Page2[0].f2_03[0]', transformer: TRANSFORMERS.currency },
    stateTaxes: { pdfField: 'topmostSubform[0].Page2[0].f2_04[0]', transformer: TRANSFORMERS.currency },
    mortgageInterest: { pdfField: 'topmostSubform[0].Page2[0].f2_08[0]', transformer: TRANSFORMERS.currency },
    charitableDonations: { pdfField: 'topmostSubform[0].Page2[0].f2_10[0]', transformer: TRANSFORMERS.currency },
    
    // Tax and Credits
    taxableIncome: { pdfField: 'topmostSubform[0].Page2[0].f2_15[0]', transformer: TRANSFORMERS.currency },
    tax: { pdfField: 'topmostSubform[0].Page2[0].f2_16[0]', transformer: TRANSFORMERS.currency },
    
    // Payments
    federalIncomeTaxWithheld: { pdfField: 'topmostSubform[0].Page2[0].f2_22[0]', transformer: TRANSFORMERS.currency },
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
    // Personal Information
    firstName: { 
      pdfField: 'topmostSubform[0].Page1[0].f1_4[0]', 
      transformer: (value, allData) => {
        const middleInitial = allData.middleInitial || ''
        return middleInitial ? `${value} ${middleInitial}` : value
      }
    },
    middleInitial: { pdfField: null, transformer: null }, // Combined with firstName
    lastName: { pdfField: 'topmostSubform[0].Page1[0].f1_5[0]', transformer: null },
    
    // SSN (ITIN)
    ssn: { 
      pdfField: 'topmostSubform[0].Page1[0].f1_6[0]',
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return cleaned.slice(0, 9) // Max 9 digits
      }
    },
    
    // Address
    address: { pdfField: 'topmostSubform[0].Page1[0].f1_7[0]', transformer: null },
    apt: { pdfField: 'topmostSubform[0].Page1[0].f1_8[0]', transformer: null },
    city: { pdfField: 'topmostSubform[0].Page1[0].f1_9[0]', transformer: TRANSFORMERS.capitalizeFirstLetter },
    state: { pdfField: 'topmostSubform[0].Page1[0].f1_10[0]', transformer: TRANSFORMERS.uppercase },
    zipCode: { pdfField: 'topmostSubform[0].Page1[0].f1_11[0]', transformer: null },
    
    // Country Information
    country: { pdfField: 'topmostSubform[0].Page1[0].f1_12[0]', transformer: null },
    
    // Filing Status (checkboxes c1_1[0-4])
    filingStatus: {
      pdfField: null,
      transformer: (value) => {
        const statusMap = {
          'single': 'topmostSubform[0].Page1[0].c1_1[0]',
          'married_joint': 'topmostSubform[0].Page1[0].c1_1[1]',
          'married_separate': 'topmostSubform[0].Page1[0].c1_1[2]',
          'head_of_household': 'topmostSubform[0].Page1[0].c1_1[3]',
          'qualifying_widow': 'topmostSubform[0].Page1[0].c1_1[4]',
        }
        return statusMap[value] || null
      }
    },
    
    // Spouse Information (if married)
    spouseFirstName: { pdfField: 'topmostSubform[0].Page1[0].f1_7[0]', transformer: null },
    spouseLastName: { pdfField: 'topmostSubform[0].Page1[0].f1_8[0]', transformer: null },
    spouseSSN: { 
      pdfField: 'topmostSubform[0].Page1[0].f1_9[0]',
      transformer: (value) => {
        if (!value) return null
        const cleaned = value.replace(/\D/g, '')
        return cleaned.slice(0, 9)
      }
    },
    
    // Dependents (4 rows available)
    // Row 1
    dependent1Name: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow1[0].f1_16[0]', transformer: null },
    dependent1SSN: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow1[0].f1_17[0]', transformer: null },
    dependent1Relationship: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow1[0].f1_18[0]', transformer: null },
    
    // Row 2
    dependent2Name: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow2[0].f1_19[0]', transformer: null },
    dependent2SSN: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow2[0].f1_20[0]', transformer: null },
    dependent2Relationship: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow2[0].f1_21[0]', transformer: null },
    
    // Row 3
    dependent3Name: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow3[0].f1_22[0]', transformer: null },
    dependent3SSN: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow3[0].f1_23[0]', transformer: null },
    dependent3Relationship: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow3[0].f1_24[0]', transformer: null },
    
    // Row 4
    dependent4Name: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow4[0].f1_25[0]', transformer: null },
    dependent4SSN: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow4[0].f1_26[0]', transformer: null },
    dependent4Relationship: { pdfField: 'topmostSubform[0].Page1[0].Table_Dependents[0].BodyRow4[0].f1_27[0]', transformer: null },
    
    // Income Section - Page 1
    wages: { pdfField: 'topmostSubform[0].Page1[0].f1_29[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    taxExemptInterest: { pdfField: 'topmostSubform[0].Page1[0].f1_30[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    taxableInterest: { pdfField: 'topmostSubform[0].Page1[0].f1_31[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    qualifiedDividends: { pdfField: 'topmostSubform[0].Page1[0].f1_32[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    ordinaryDividends: { pdfField: 'topmostSubform[0].Page1[0].f1_33[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // IRA Distributions
    iraDistributions: { pdfField: 'topmostSubform[0].Page1[0].f1_34[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    taxableIraDistributions: { pdfField: 'topmostSubform[0].Page1[0].f1_35[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Pensions and Annuities (f1_36, f1_37 are Read Only)
    pensions: { pdfField: 'topmostSubform[0].Page1[0].f1_38[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    taxablePensions: { pdfField: 'topmostSubform[0].Page1[0].f1_39[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Social Security Benefits
    socialSecurityBenefits: { pdfField: 'topmostSubform[0].Page1[0].f1_40[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    taxableSocialSecurity: { pdfField: 'topmostSubform[0].Page1[0].f1_41[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Capital Gains
    capitalGains: { pdfField: 'topmostSubform[0].Page1[0].f1_42[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Other Income
    otherIncome: { pdfField: 'topmostSubform[0].Page1[0].f1_43[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Total Income (f1_48 is Read Only)
    totalIncome: { pdfField: 'topmostSubform[0].Page1[0].f1_44[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Adjustments to Income
    educatorExpenses: { pdfField: 'topmostSubform[0].Page1[0].f1_45[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    businessExpenses: { pdfField: 'topmostSubform[0].Page1[0].f1_46[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    hsaDeduction: { pdfField: 'topmostSubform[0].Page1[0].f1_47[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Total Adjustments
    totalAdjustments: { pdfField: 'topmostSubform[0].Page1[0].f1_49[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Adjusted Gross Income
    adjustedGrossIncome: { pdfField: 'topmostSubform[0].Page1[0].f1_50[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Page 2 - Standard Deduction and Itemized Deductions
    standardDeduction: { pdfField: 'topmostSubform[0].Page2[0].f2_1[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Itemized Deductions
    medicalExpenses: { pdfField: 'topmostSubform[0].Page2[0].f2_3[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    stateTaxes: { pdfField: 'topmostSubform[0].Page2[0].f2_4[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    mortgageInterest: { pdfField: 'topmostSubform[0].Page2[0].f2_5[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    charitableDonations: { pdfField: 'topmostSubform[0].Page2[0].f2_6[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Tax and Credits (f2_22, f2_25 are Read Only)
    taxableIncome: { pdfField: 'topmostSubform[0].Page2[0].f2_15[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    tax: { pdfField: 'topmostSubform[0].Page2[0].f2_16[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Payments
    federalIncomeTaxWithheld: { pdfField: 'topmostSubform[0].Page2[0].f2_23[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    estimatedTaxPayments: { pdfField: 'topmostSubform[0].Page2[0].f2_24[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Refund or Amount Owed
    refund: { pdfField: 'topmostSubform[0].Page2[0].f2_30[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    amountOwed: { pdfField: 'topmostSubform[0].Page2[0].f2_33[0]', transformer: TRANSFORMERS.currencyDollarsOnly },
    
    // Bank Information for Direct Deposit
    routingNumber: { pdfField: 'topmostSubform[0].Page2[0].RoutingNo[0].f2_31[0]', transformer: null },
    accountNumber: { pdfField: 'topmostSubform[0].Page2[0].AccountNo[0].f2_32[0]', transformer: null },
    
    // Preparer Information
    preparerName: { pdfField: 'topmostSubform[0].Page2[0].f2_37[0]', transformer: null },
    preparerPhone: { pdfField: 'topmostSubform[0].Page2[0].f2_40[0]', transformer: null },
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
    'wi_form_1npr': WI_FORM_1_MAPPINGS, // Use same mappings as Form 1 for now
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
      // Pass both the value and the entire formData object
      value = fieldConfig.transformer(value, formData)
      
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
  getFieldMapping,
  mapFormDataToPDF,
  TRANSFORMERS,
}

