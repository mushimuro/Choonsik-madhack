import './Button.css'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  ...props
}) => {
  const className = `
    btn
    btn-${variant}
    btn-${size}
    ${fullWidth ? 'btn-full-width' : ''}
    ${loading ? 'btn-loading' : ''}
  `.trim().replace(/\s+/g, ' ')

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner-small"></span>}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export default Button

