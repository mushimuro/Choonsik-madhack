import './Card.css'

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
}) => {
  const cardClassName = `
    card
    ${hoverable ? 'card-hoverable' : ''}
    ${clickable ? 'card-clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={cardClassName} onClick={clickable ? onClick : undefined}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

export default Card

