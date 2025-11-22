/**
 * Tax Form Types and Constants
 * Wisconsin and Federal Tax Forms
 */

export const FORM_TYPES = {
  FEDERAL: 'federal',
  WISCONSIN: 'wisconsin',
}

export const TAX_FORMS = {
  // Federal Forms
  FORM_1040: {
    id: 'form_1040',
    name: 'Form 1040',
    fullName: 'U.S. Individual Income Tax Return',
    type: FORM_TYPES.FEDERAL,
    year: 2024,
    description: 'Standard federal income tax return form',
  },
  SCHEDULE_C: {
    id: 'schedule_c',
    name: 'Schedule C',
    fullName: 'Profit or Loss from Business',
    type: FORM_TYPES.FEDERAL,
    year: 2024,
    description: 'Report income or loss from a business you operated',
  },
  
  // Wisconsin Forms
  FORM_1: {
    id: 'wi_form_1',
    name: 'Wisconsin Form 1',
    fullName: 'Wisconsin Individual Income Tax Return',
    type: FORM_TYPES.WISCONSIN,
    year: 2024,
    description: 'Wisconsin state income tax return',
  },
  FORM_1NPR: {
    id: 'wi_form_1npr',
    name: 'Wisconsin Form 1NPR',
    fullName: 'Wisconsin Nonresident/Part-Year Resident Income Tax Return',
    type: FORM_TYPES.WISCONSIN,
    year: 2024,
    description: 'For nonresidents and part-year residents',
  },
  SCHEDULE_I: {
    id: 'wi_schedule_i',
    name: 'Wisconsin Schedule I',
    fullName: 'Wisconsin Itemized Deductions',
    type: FORM_TYPES.WISCONSIN,
    year: 2024,
    description: 'Itemized deductions for Wisconsin',
  },
}

export const DOCUMENT_TYPES = {
  W2: 'w2',
  FORM_1099: '1099',
  RECEIPTS: 'receipts',
  MORTGAGE_INTEREST: 'mortgage_interest',
  PROPERTY_TAX: 'property_tax',
  CHARITABLE_DONATIONS: 'charitable_donations',
  MEDICAL_EXPENSES: 'medical_expenses',
  STUDENT_LOAN_INTEREST: 'student_loan_interest',
  OTHER: 'other',
}

export const DOCUMENT_LABELS = {
  [DOCUMENT_TYPES.W2]: 'W-2 Form',
  [DOCUMENT_TYPES.FORM_1099]: '1099 Form',
  [DOCUMENT_TYPES.RECEIPTS]: 'Receipts',
  [DOCUMENT_TYPES.MORTGAGE_INTEREST]: 'Mortgage Interest Statement',
  [DOCUMENT_TYPES.PROPERTY_TAX]: 'Property Tax Statement',
  [DOCUMENT_TYPES.CHARITABLE_DONATIONS]: 'Charitable Donation Receipts',
  [DOCUMENT_TYPES.MEDICAL_EXPENSES]: 'Medical Expense Records',
  [DOCUMENT_TYPES.STUDENT_LOAN_INTEREST]: 'Student Loan Interest Statement',
  [DOCUMENT_TYPES.OTHER]: 'Other Documents',
}

export const FILING_STATUS = {
  SINGLE: 'single',
  MARRIED_FILING_JOINTLY: 'married_filing_jointly',
  MARRIED_FILING_SEPARATELY: 'married_filing_separately',
  HEAD_OF_HOUSEHOLD: 'head_of_household',
  QUALIFYING_WIDOW: 'qualifying_widow',
}

export const FILING_STATUS_LABELS = {
  [FILING_STATUS.SINGLE]: 'Single',
  [FILING_STATUS.MARRIED_FILING_JOINTLY]: 'Married Filing Jointly',
  [FILING_STATUS.MARRIED_FILING_SEPARATELY]: 'Married Filing Separately',
  [FILING_STATUS.HEAD_OF_HOUSEHOLD]: 'Head of Household',
  [FILING_STATUS.QUALIFYING_WIDOW]: 'Qualifying Widow(er)',
}

export const FORM_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  FILED: 'filed',
}

export const FORM_STATUS_LABELS = {
  [FORM_STATUS.DRAFT]: 'Draft',
  [FORM_STATUS.IN_PROGRESS]: 'In Progress',
  [FORM_STATUS.REVIEW]: 'Under Review',
  [FORM_STATUS.COMPLETED]: 'Completed',
  [FORM_STATUS.FILED]: 'Filed',
}

