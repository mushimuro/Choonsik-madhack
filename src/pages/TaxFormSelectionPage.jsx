import { useNavigate } from 'react-router-dom'
import { useTaxForm } from '../contexts/TaxFormContext'
import TaxFormSelector from '../components/Forms/TaxFormSelector'
import './TaxFormSelectionPage.css'

const TaxFormSelectionPage = () => {
  const navigate = useNavigate()
  const { selectForm } = useTaxForm()

  const handleSelectForm = (formInfo) => {
    selectForm(formInfo)
    navigate(`/forms/${formInfo.id}/input`)
  }

  return (
    <div className="tax-form-selection-page">
      <div className="container">
        <div className="page-header">
          <h1>Select a Tax Form</h1>
          <p className="page-subtitle">
            Choose the tax form you need to fill out. We support both Wisconsin
            state forms and federal forms.
          </p>
        </div>

        <TaxFormSelector onSelect={handleSelectForm} />
      </div>
    </div>
  )
}

export default TaxFormSelectionPage

