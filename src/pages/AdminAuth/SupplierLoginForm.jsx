import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function SupplierLoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!EMAIL_RE.test(email)) errs.email = 'Geçerli bir e-posta gir.'
    if (!password) errs.password = 'Şifre boş bırakılamaz.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      await signIn({ email, password })
    } catch (err) {
      setError(err.message || 'Giriş yapılamadı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit} noValidate>
      <div className="admin-form-step">
        <h3 className="admin-form-step-title">Satıcı Girişi</h3>

        <label className="admin-field">
          <span className="admin-field-label">E-posta Adresi *</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
            }}
            placeholder="satici@ornek.com"
            className={fieldErrors.email ? 'has-error' : ''}
            disabled={loading}
          />
          {fieldErrors.email && <span className="admin-field-hint">{fieldErrors.email}</span>}
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Şifre *</span>
          <div className="admin-field-with-action">
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
              }}
              placeholder="••••••••"
              className={fieldErrors.password ? 'has-error' : ''}
              disabled={loading}
            />
            <button
              type="button"
              className="admin-field-toggle"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
              tabIndex={-1}
            >
              {showPass ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && <span className="admin-field-hint">{fieldErrors.password}</span>}
        </label>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
          {loading ? <span className="admin-spinner" aria-hidden="true" /> : 'Giriş Yap'}
        </button>
      </div>
    </form>
  )
}
