/**
 * Form Field Definitions for Tax Forms
 * Define all input fields required for each tax form
 */

export const PERSONAL_INFO_FIELDS = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
  },
  {
    name: 'middleInitial',
    label: 'Middle Initial',
    type: 'text',
    required: false,
    maxLength: 1,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your last name',
  },
  {
    name: 'ssn',
    label: 'Social Security Number',
    type: 'text',
    required: true,
    placeholder: 'XXX-XX-XXXX',
    pattern: '\\d{3}-\\d{2}-\\d{4}',
  },
  {
    name: 'dateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    required: true,
  },
  {
    name: 'address',
    label: 'Street Address',
    type: 'text',
    required: true,
    placeholder: '123 Main St',
  },
  {
    name: 'apt',
    label: 'Apt/Unit # (if applicable)',
    type: 'text',
    required: false,
    placeholder: 'Apt 123',
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    required: true,
  },
  {
    name: 'state',
    label: 'State',
    type: 'text',
    required: true,
    maxLength: 2,
  },
  {
    name: 'zipCode',
    label: 'ZIP Code',
    type: 'text',
    required: true,
    pattern: '\\d{5}',
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    type: 'tel',
    required: false,
    placeholder: '(XXX) XXX-XXXX',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: false,
    placeholder: 'email@example.com',
  },
]

export const SPOUSE_INFO_FIELDS = [
  {
    name: 'spouseFirstName',
    label: 'Spouse First Name',
    type: 'text',
    required: false,
  },
  {
    name: 'spouseMiddleInitial',
    label: 'Spouse Middle Initial',
    type: 'text',
    required: false,
    maxLength: 1,
  },
  {
    name: 'spouseLastName',
    label: 'Spouse Last Name',
    type: 'text',
    required: false,
  },
  {
    name: 'spouseSSN',
    label: 'Spouse Social Security Number',
    type: 'text',
    required: false,
    placeholder: 'XXX-XX-XXXX',
    pattern: '\\d{3}-\\d{2}-\\d{4}',
  },
  {
    name: 'spouseDateOfBirth',
    label: 'Spouse Date of Birth',
    type: 'date',
    required: false,
  },
]

export const INCOME_FIELDS = [
  {
    name: 'wages',
    label: 'Wages, salaries, tips (W-2)',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'taxableInterest',
    label: 'Taxable interest',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'ordinaryDividends',
    label: 'Ordinary dividends',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'capitalGains',
    label: 'Capital gains or losses',
    type: 'number',
    required: false,
    step: '0.01',
    placeholder: '0.00',
  },
  {
    name: 'otherIncome',
    label: 'Other income',
    type: 'number',
    required: false,
    step: '0.01',
    placeholder: '0.00',
  },
  {
    name: 'businessIncome',
    label: 'Business income or loss',
    type: 'number',
    required: false,
    step: '0.01',
    placeholder: '0.00',
  },
  {
    name: 'unemploymentCompensation',
    label: 'Unemployment compensation',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
]

export const DEDUCTION_FIELDS = [
  {
    name: 'medicalExpenses',
    label: 'Medical and dental expenses',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'stateTaxes',
    label: 'State and local taxes',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'mortgageInterest',
    label: 'Home mortgage interest',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'charitableDonations',
    label: 'Charitable contributions',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
  {
    name: 'studentLoanInterest',
    label: 'Student loan interest',
    type: 'number',
    required: false,
    step: '0.01',
    min: '0',
    placeholder: '0.00',
  },
]

export const DEPENDENT_FIELDS = [
  {
    name: 'dependentFirstName',
    label: 'First Name',
    type: 'text',
    required: false,
  },
  {
    name: 'dependentLastName',
    label: 'Last Name',
    type: 'text',
    required: false,
  },
  {
    name: 'dependentSSN',
    label: 'Social Security Number',
    type: 'text',
    required: false,
    placeholder: 'XXX-XX-XXXX',
  },
  {
    name: 'dependentRelationship',
    label: 'Relationship',
    type: 'text',
    required: false,
    placeholder: 'Son, Daughter, etc.',
  },
  {
    name: 'dependentDateOfBirth',
    label: 'Date of Birth',
    type: 'date',
    required: false,
  },
]

// Form sections for Wisconsin Form 1
export const WI_FORM_1_SECTIONS = [
  {
    id: 'personal_info',
    title: 'Personal Information',
    fields: PERSONAL_INFO_FIELDS,
  },
  {
    id: 'filing_status',
    title: 'Filing Status',
    fields: [
      {
        name: 'filingStatus',
        label: 'Filing Status',
        type: 'radio',
        required: true,
        options: [
          { value: 'single', label: 'Single' },
          { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
          { value: 'married_filing_separately', label: 'Married Filing Separately' },
          { value: 'head_of_household', label: 'Head of Household' },
        ],
      },
    ],
  },
  {
    id: 'spouse_info',
    title: 'Spouse Information',
    condition: (formData) => 
      formData.filingStatus === 'married_filing_jointly' || 
      formData.filingStatus === 'married_filing_separately',
    fields: SPOUSE_INFO_FIELDS,
  },
  {
    id: 'income',
    title: 'Income',
    fields: INCOME_FIELDS,
  },
  {
    id: 'deductions',
    title: 'Deductions',
    fields: DEDUCTION_FIELDS,
  },
]

