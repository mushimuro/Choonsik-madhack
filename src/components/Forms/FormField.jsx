import Input from '../Common/Input'
import './FormField.css'

const FormField = ({ field, value, onChange, onBlur, error, touched }) => {
  const handleChange = (e) => {
    onChange(e)
  }

  switch (field.type) {
    case 'radio':
      return (
        <div className="form-field">
          <label className="field-label">
            {field.label}
            {field.required && <span className="required-mark">*</span>}
          </label>
          <div className="radio-group">
            {field.options?.map((option) => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={onBlur}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {touched && error && <span className="error-message">{error}</span>}
        </div>
      )

    case 'select':
      return (
        <div className="form-field">
          <label htmlFor={field.name} className="field-label">
            {field.label}
            {field.required && <span className="required-mark">*</span>}
          </label>
          <select
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            className={`input ${touched && error ? 'input-error' : ''}`}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {touched && error && <span className="error-message">{error}</span>}
        </div>
      )

    case 'textarea':
      return (
        <div className="form-field">
          <label htmlFor={field.name} className="field-label">
            {field.label}
            {field.required && <span className="required-mark">*</span>}
          </label>
          <textarea
            id={field.name}
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            className={`input ${touched && error ? 'input-error' : ''}`}
            rows={field.rows || 4}
          />
          {touched && error && <span className="error-message">{error}</span>}
        </div>
      )

    case 'checkbox':
      return (
        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={handleChange}
              onBlur={onBlur}
            />
            <span>{field.label}</span>
          </label>
          {touched && error && <span className="error-message">{error}</span>}
        </div>
      )

    default:
      return (
        <Input
          label={field.label}
          name={field.name}
          type={field.type || 'text'}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          error={error}
          touched={touched}
          required={field.required}
          placeholder={field.placeholder}
          pattern={field.pattern}
          min={field.min}
          max={field.max}
          step={field.step}
          maxLength={field.maxLength}
        />
      )
  }
}

export default FormField

