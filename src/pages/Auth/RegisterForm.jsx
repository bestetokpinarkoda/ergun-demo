import { useMemo, useState } from 'react'
import LegalModal from '../../components/auth/LegalModal'
import { useAuth } from '../../contexts/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function scorePassword(pw) {
  let score = 0
  if (!pw) return 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_LABELS = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok güçlü']

export default function RegisterForm() {
  const { signUp, signInWithOAuth } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'terms' })

  const strength = useMemo(() => scorePassword(password), [password])

  const validate = () => {
    const errs = {}
    if (fullName.trim().length < 2) errs.fullName = 'Ad soyad en az 2 karakter olmalı.'
    if (!EMAIL_RE.test(email)) errs.email = 'Geçerli bir e-posta gir.'
    if (password.length < 8) errs.password = 'Şifre en az 8 karakter olmalı.'
    if (confirm !== password) errs.confirm = 'Şifreler eşleşmiyor.'
    if (!legalAccepted) errs.legal = 'Kullanım koşullarını kabul etmelisiniz.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!validate()) return

    setLoading(true)
    try {
      await signUp({ email, password, fullName, role: 'customer' })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const clearFieldError = (key) => {
    if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: '' })
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-sso">
        <button type="button" className="sso-btn" disabled={loading} onClick={() => signInWithOAuth('google')}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Google ile devam et
        </button>
        <button type="button" className="sso-btn" disabled={loading} onClick={() => signInWithOAuth('apple')}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M16.37 12.78c-.02-2.1 1.72-3.11 1.8-3.17-.98-1.44-2.51-1.64-3.05-1.66-1.3-.13-2.53.76-3.19.76-.66 0-1.68-.74-2.77-.72-1.42.02-2.74.83-3.47 2.1-1.48 2.57-.38 6.38 1.07 8.47.71 1.02 1.55 2.17 2.65 2.13 1.07-.04 1.47-.69 2.76-.69 1.29 0 1.65.69 2.77.67 1.14-.02 1.87-1.04 2.57-2.07.81-1.18 1.14-2.33 1.16-2.39-.03-.01-2.22-.85-2.24-3.39zM14.3 6.47c.58-.71.97-1.68.86-2.66-.83.04-1.85.56-2.45 1.25-.54.62-1.01 1.62-.89 2.58.93.07 1.88-.47 2.48-1.17z" />
          </svg>
          Apple ile devam et
        </button>
      </div>

      <div className="auth-divider"><span>veya</span></div>

      <label className="field">
        <span className="field-label">Ad Soyad</span>
        <input
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); clearFieldError('fullName') }}
          placeholder="Adın Soyadın"
          className={fieldErrors.fullName ? 'has-error' : ''}
          disabled={loading}
        />
        {fieldErrors.fullName && <span className="field-hint">{fieldErrors.fullName}</span>}
      </label>

      <label className="field">
        <span className="field-label">E-posta</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
          placeholder="ornek@mail.com"
          className={fieldErrors.email ? 'has-error' : ''}
          disabled={loading}
        />
        {fieldErrors.email && <span className="field-hint">{fieldErrors.email}</span>}
      </label>

      <label className="field">
        <span className="field-label">Şifre</span>
        <div className="field-with-action">
          <input
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
            placeholder="En az 8 karakter"
            className={fieldErrors.password ? 'has-error' : ''}
            disabled={loading}
          />
          <button
            type="button"
            className="field-toggle"
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
        {password && (
          <div className="pw-strength" data-level={strength}>
            <div className="pw-strength-bars">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i < strength ? 'is-on' : ''} />
              ))}
            </div>
            <span className="pw-strength-label">{STRENGTH_LABELS[strength]}</span>
          </div>
        )}
        {fieldErrors.password && <span className="field-hint">{fieldErrors.password}</span>}
      </label>

      <label className="field">
        <span className="field-label">Şifre (tekrar)</span>
        <input
          type={showPass ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); clearFieldError('confirm') }}
          placeholder="Şifreni tekrar gir"
          className={fieldErrors.confirm ? 'has-error' : ''}
          disabled={loading}
        />
        {fieldErrors.confirm && <span className="field-hint">{fieldErrors.confirm}</span>}
      </label>

      <label className="auth-checkbox-wrap">
        <input
          type="checkbox"
          checked={legalAccepted}
          onChange={(e) => {
            setLegalAccepted(e.target.checked)
            clearFieldError('legal')
          }}
          disabled={loading}
        />
        <span className="auth-checkbox-label">
          <button type="button" className="auth-legal-link" onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}>Kullanım Koşulları</button>
          {' '}ve{' '}
          <button type="button" className="auth-legal-link" onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}>Gizlilik Politikası</button>
          'nı okudum ve kabul ediyorum.
        </span>
      </label>
      {fieldErrors.legal && <span className="field-hint" style={{ marginTop: 0 }}>{fieldErrors.legal}</span>}

      {error && <div className="auth-alert auth-alert-error">{error}</div>}
      {success && (
        <div className="auth-alert auth-alert-success">
          Üyelik oluşturuldu! E-posta adresini doğrulayabilirsin.
        </div>
      )}

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? <span className="spinner" aria-hidden="true" /> : 'Üye ol'}
      </button>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
      />
    </form>
  )
}
