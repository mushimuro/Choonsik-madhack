import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiFileText, FiShield, FiZap, FiCheck, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import Button from '../components/Common/Button'
import './HomePage.css'

const HomePage = () => {
  const { currentUser } = useAuth()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            Simplify Your Wisconsin Tax Filing
          </h1>
          <p className="hero-subtitle">
            Fill out your Wisconsin and federal tax forms quickly and securely.
            Save time and avoid errors with our automated form filling system.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to="/dashboard">
                <Button variant="primary" size="large">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="large">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="large">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiFileText />
              </div>
              <h3 className="feature-title">Easy Form Filling</h3>
              <p className="feature-description">
                Simply enter your information once and we'll automatically fill
                out all the required tax forms for you.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiShield />
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your data is encrypted and stored securely with Firebase.
                We never share your information.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiZap />
              </div>
              <h3 className="feature-title">Fast & Efficient</h3>
              <p className="feature-description">
                Save hours of manual form filling. Generate completed PDFs
                ready for submission in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Select Your Form</h3>
              <p className="step-description">
                Choose the Wisconsin or federal tax form you need to fill out.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Enter Your Information</h3>
              <p className="step-description">
                Fill in your personal and financial information through our
                guided form.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Upload Documents</h3>
              <p className="step-description">
                Upload supporting documents like W-2s, 1099s, and receipts.
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3 className="step-title">Download & File</h3>
              <p className="step-description">
                Review and download your completed PDF forms ready for
                submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Document Requirements Section */}
      <section className="document-requirements">
        <div className="container">
          <div className="section-header-with-icon">
            <FiInfo className="section-icon" />
            <h2 className="section-title">What Documents Do You Need?</h2>
          </div>
          <p className="section-subtitle">
            Before you start filing, make sure you have all the necessary documents ready.
            Click on a form below to see what you need.
          </p>
          
          <div className="requirements-preview-grid">
            <div className="requirement-preview-card">
              <div className="requirement-preview-header" style={{ borderLeftColor: '#dc2626' }}>
                <h3>Wisconsin Form 1</h3>
                <span className="form-type">WI Resident</span>
              </div>
              <div className="requirement-preview-list">
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>W-2 Forms</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>1099 Forms (if applicable)</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>Social Security Number</span>
                </div>
                <div className="preview-item">
                  <FiAlertCircle className="icon-optional" />
                  <span>Previous year's tax return</span>
                </div>
              </div>
            </div>

            <div className="requirement-preview-card">
              <div className="requirement-preview-header" style={{ borderLeftColor: '#ea580c' }}>
                <h3>Wisconsin Form 1-NPR</h3>
                <span className="form-type">Part-Year/Nonresident</span>
              </div>
              <div className="requirement-preview-list">
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>W-2 (WI source income)</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>Residency dates</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>Income by state documentation</span>
                </div>
                <div className="preview-item">
                  <FiAlertCircle className="icon-optional" />
                  <span>Tax credit documents</span>
                </div>
              </div>
            </div>

            <div className="requirement-preview-card">
              <div className="requirement-preview-header" style={{ borderLeftColor: '#2563eb' }}>
                <h3>Federal Form 1040</h3>
                <span className="form-type">U.S. Resident</span>
              </div>
              <div className="requirement-preview-list">
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>W-2 Forms</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>1099-INT / DIV</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>SSN / ITIN</span>
                </div>
                <div className="preview-item">
                  <FiAlertCircle className="icon-optional" />
                  <span>1098-T, 1098-E (if applicable)</span>
                </div>
              </div>
            </div>

            <div className="requirement-preview-card">
              <div className="requirement-preview-header" style={{ borderLeftColor: '#7c3aed' }}>
                <h3>Federal Form 1040-NR</h3>
                <span className="form-type">F-1/J-1 Students</span>
              </div>
              <div className="requirement-preview-list">
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>W-2 &amp; 1042-S</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>Passport &amp; Visa info</span>
                </div>
                <div className="preview-item">
                  <FiCheckCircle className="icon-required" />
                  <span>I-20 or DS-2019</span>
                </div>
                <div className="preview-item">
                  <FiAlertCircle className="icon-optional" />
                  <span>Tax treaty documentation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="view-full-requirements">
            <Link to="/document-requirements">
              <Button variant="primary" size="large" icon={<FiInfo />}>
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Supported Forms Section */}
      <section className="supported-forms">
        <div className="container">
          <h2 className="section-title">Supported Tax Forms</h2>
          <div className="forms-list">
            <div className="form-item">
              <FiCheck className="check-icon" />
              <span>Wisconsin Form 1 - Individual Income Tax Return</span>
            </div>
            <div className="form-item">
              <FiCheck className="check-icon" />
              <span>Wisconsin Form 1NPR - Nonresident Tax Return</span>
            </div>
            <div className="form-item">
              <FiCheck className="check-icon" />
              <span>Wisconsin Schedule I - Itemized Deductions</span>
            </div>
            <div className="form-item">
              <FiCheck className="check-icon" />
              <span>Form 1040 - U.S. Individual Income Tax Return</span>
            </div>
            <div className="form-item">
              <FiCheck className="check-icon" />
              <span>Schedule C - Profit or Loss from Business</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="cta">
          <div className="container cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-text">
              Join thousands of Wisconsin residents who have simplified their
              tax filing.
            </p>
            <Link to="/register">
              <Button variant="primary" size="large">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage

