import { useState } from 'react'
import { FiFileText, FiCheckCircle, FiAlertCircle, FiChevronDown, FiChevronUp, FiDownload, FiFolder } from 'react-icons/fi'
import Card from '../components/Common/Card'
import './DocumentRequirementsPage.css'

const DocumentRequirementsPage = () => {
  const [expandedForm, setExpandedForm] = useState(null)

  const toggleForm = (formId) => {
    setExpandedForm(expandedForm === formId ? null : formId)
  }

  const formRequirements = [
    {
      id: 'wi-form-1',
      title: 'Wisconsin Form 1',
      subtitle: 'WI Resident Tax Return',
      color: '#dc2626',
      required: [
        'W-2 (from all employers)',
        '1099-INT / 1099-DIV (if you have interest/dividend income)',
        '1099-G (if you received unemployment benefits)',
        '1099-R (if you received pension/retirement income)',
        '1099-NEC / 1099-MISC (if you have freelance/self-employment income)',
        '1099-K (if applicable)',
        'Social Security Number',
        'Previous year Wisconsin tax return information (recommended)',
      ],
      optional: [
        '1098-T (for education credits)',
        '1098-E (for student loan interest)',
        'Property tax bill (for WI property tax credit)',
        'Rent Certificate(s) (for renter\'s credit)',
        '1095-A / 1095-B / 1095-C (health insurance documentation)',
        'Receipts (charitable donations, medical expenses, etc.)',
        'IRA contribution proof',
      ],
    },
    {
      id: 'wi-form-1npr',
      title: 'Wisconsin Form 1-NPR',
      subtitle: 'WI Part-Year or Nonresident',
      color: '#ea580c',
      required: [
        'W-2 (including WI source income)',
        'Documentation showing income sources by state',
        'Residency dates (move-in/move-out dates)',
        '1099 Forms (INT, DIV, NEC, etc.)',
        'Social Security Number',
      ],
      optional: [
        'Other tax credit related documents (1098-T, 1098-E, etc.)',
        'Rental/property tax documents (in some cases)',
        'Insurance related documents (1095 series)',
      ],
    },
    {
      id: 'form-1040',
      title: 'U.S. Federal Form 1040',
      subtitle: 'Resident Federal Return',
      color: '#2563eb',
      required: [
        'W-2',
        '1099-INT / DIV',
        '1099-NEC / MISC / K',
        '1099-G (if you have unemployment compensation - required)',
        '1099-R (if you have pension/retirement income - required)',
        'Social Security Number / ITIN',
        'Previous year 1040 information (recommended)',
      ],
      optional: [
        '1098-T (education expenses)',
        '1098-E (student loan interest)',
        '1098 (Mortgage Interest)',
        'Medical expenses, charitable donation receipts',
        'IRA/Retirement contribution proof',
        '1095-A / B / C (health insurance)',
      ],
    },
    {
      id: 'form-1040nr',
      title: 'U.S. Federal Form 1040-NR',
      subtitle: 'Nonresident Federal Return (including F-1/J-1 students)',
      color: '#7c3aed',
      required: [
        'W-2',
        '1042-S (scholarships/fellowships/teaching assistant income, etc.)',
        '1099 Forms (if applicable)',
        'Passport information',
        'Visa information (F-1/J-1, etc.)',
        'I-20 or DS-2019',
        'Date records (Substantial Presence Test / nonresident determination)',
        'U.S. address or foreign address',
      ],
      optional: [
        'Tax treaty documentation (if applying for treaty benefits)',
        'Home country tax return/identity verification',
        'Education expenses (1098-T) → Usually nonresidents cannot use education credits, so this is optional',
      ],
    },
  ]

  return (
    <div className="document-requirements-page">
      <div className="container">
        <div className="page-header">
          <FiFileText className="header-icon" />
          <h1>Required Documents for Tax Filing</h1>
          <p className="page-subtitle">
            Review what documents you need to prepare before filling out your tax return.
            Click on each form type to see detailed requirements.
          </p>
        </div>

        <div className="requirements-grid">
          {formRequirements.map((form) => (
            <Card
              key={form.id}
              hoverable
              clickable
              onClick={() => toggleForm(form.id)}
              className="requirement-card"
            >
              <div className="requirement-header" style={{ borderLeftColor: form.color }}>
                <div className="form-info">
                  <h3>{form.title}</h3>
                  <p className="form-subtitle">{form.subtitle}</p>
                </div>
                <div className="expand-icon">
                  {expandedForm === form.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {expandedForm === form.id && (
                <div className="requirement-content">
                  {/* Required Documents */}
                  <div className="requirement-section">
                    <div className="section-header required">
                      <FiCheckCircle className="section-icon" />
                      <h4>Required Documents</h4>
                      <span className="badge badge-required">Must Have</span>
                    </div>
                    <ul className="document-list">
                      {form.required.map((doc, index) => (
                        <li key={index}>
                          <FiCheckCircle className="list-icon" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional Documents */}
                  <div className="requirement-section">
                    <div className="section-header optional">
                      <FiAlertCircle className="section-icon" />
                      <h4>Optional Documents</h4>
                      <span className="badge badge-optional">If Applicable</span>
                    </div>
                    <ul className="document-list">
                      {form.optional.map((doc, index) => (
                        <li key={index}>
                          <FiAlertCircle className="list-icon" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>


        <Card className="important-note">
          <div className="note-header">
            <FiAlertCircle className="note-icon" />
            <h3>Important Notes</h3>
          </div>
          <ul className="note-list">
            <li>
              <strong>Gather all documents before starting:</strong> Having all required documents ready will make the filing process faster and more accurate.
            </li>
            <li>
              <strong>Keep copies:</strong> Always keep copies of all tax documents for at least 3 years.
            </li>
            <li>
              <strong>Missing documents?</strong> Contact your employer, bank, or relevant institution to request replacement forms.
            </li>
            <li>
              <strong>Optional documents can save you money:</strong> Even though they're optional, these documents may qualify you for deductions and credits that reduce your tax liability.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default DocumentRequirementsPage

