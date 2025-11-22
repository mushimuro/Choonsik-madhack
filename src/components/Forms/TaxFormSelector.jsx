import { useTaxForm } from '../../contexts/TaxFormContext'
import { TAX_FORMS, FORM_TYPES } from '../../constants/taxForms'
import Card from '../Common/Card'
import './TaxFormSelector.css'

const TaxFormSelector = ({ onSelect }) => {
  const { selectForm } = useTaxForm()

  const handleSelect = (formInfo) => {
    selectForm(formInfo)
    if (onSelect) {
      onSelect(formInfo)
    }
  }

  const federalForms = Object.values(TAX_FORMS).filter(
    (form) => form.type === FORM_TYPES.FEDERAL
  )
  const wisconsinForms = Object.values(TAX_FORMS).filter(
    (form) => form.type === FORM_TYPES.WISCONSIN
  )

  return (
    <div className="form-selector">
      <section className="form-category">
        <h2 className="category-title">Wisconsin State Tax Forms</h2>
        <div className="forms-grid">
          {wisconsinForms.map((form) => (
            <Card
              key={form.id}
              hoverable
              clickable
              onClick={() => handleSelect(form)}
            >
              <div className="form-card-content">
                <h3 className="form-name">{form.name}</h3>
                <p className="form-full-name">{form.fullName}</p>
                <p className="form-description">{form.description}</p>
                <div className="form-meta">
                  <span className="form-year">Tax Year: {form.year}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="form-category">
        <h2 className="category-title">Federal Tax Forms</h2>
        <div className="forms-grid">
          {federalForms.map((form) => (
            <Card
              key={form.id}
              hoverable
              clickable
              onClick={() => handleSelect(form)}
            >
              <div className="form-card-content">
                <h3 className="form-name">{form.name}</h3>
                <p className="form-full-name">{form.fullName}</p>
                <p className="form-description">{form.description}</p>
                <div className="form-meta">
                  <span className="form-year">Tax Year: {form.year}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default TaxFormSelector

