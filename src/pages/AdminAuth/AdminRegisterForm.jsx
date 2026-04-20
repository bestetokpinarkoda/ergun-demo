import { useMemo, useState } from 'react'
import LegalModal from '../../components/auth/LegalModal'
import { useAuth } from '../../contexts/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const IBAN_RE = /^TR[0-9]{24}$/
const VKN_RE = /^[0-9]{10}$/

const formatIban = (v) => {
  const raw = String(v || '').replace(/\s/g, '').toUpperCase()
  const after = raw.startsWith('TR') ? raw.slice(2) : raw.replace(/^T?R?/, '')
  const digits = after.replace(/\D/g, '').slice(0, 24)
  const grouped = digits.match(/.{1,4}/g)?.join(' ') || ''
  return digits ? `TR ${grouped}` : 'TR'
}

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

export default function AdminRegisterForm() {
  const { signUp } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Step 1: Kişi Bilgileri
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2: Şirket Bilgileri
  const [companyName, setCompanyName] = useState('')
  const [vkn, setVkn] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [city, setCity] = useState('')

  // Step 3: Ödeme Bilgileri
  const [iban, setIban] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'terms' })

  const strength = useMemo(() => scorePassword(password), [password])

  const validateStep1 = () => {
    const errs = {}
    if (firstName.trim().length < 2) errs.firstName = 'Ad en az 2 karakter olmalı.'
    if (lastName.trim().length < 2) errs.lastName = 'Soyad en az 2 karakter olmalı.'
    if (!EMAIL_RE.test(email)) errs.email = 'Geçerli bir e-posta gir.'
    if (phone.trim().length < 10) errs.phone = 'Geçerli bir telefon numarası gir.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (companyName.trim().length < 3) errs.companyName = 'Firma adı en az 3 karakter olmalı.'
    if (!VKN_RE.test(vkn)) errs.vkn = 'VKN 10 haneli olmalı.'
    if (companyAddress.trim().length < 10) errs.companyAddress = 'Adres en az 10 karakter olmalı.'
    if (city.trim().length < 2) errs.city = 'Şehir adını gir.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep3 = () => {
    const errs = {}
    if (!IBAN_RE.test(iban.replace(/\s/g, ''))) errs.iban = 'TR ile başlayan ve 24 rakamdan oluşan IBAN gir.'
    if (password.length < 8) errs.password = 'Şifre en az 8 karakter olmalı.'
    if (confirm !== password) errs.confirm = 'Şifreler eşleşmiyor.'
    if (!legalAccepted) errs.legal = 'Kullanım koşullarını kabul etmelisiniz.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const prevStep = () => {
    setError('')
    setFieldErrors({})
    setStep(step - 1)
  }

  const onSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError('')
    if (!validateStep3()) return

    setLoading(true)
    try {
      await signUp({
        email,
        password,
        fullName: `${firstName} ${lastName}`,
        role: 'supplier',
        extra: {
          company_name: companyName.trim(),
          tax_number: vkn,
          authorized_person: `${firstName} ${lastName}`.trim(),
          phone: phone.trim(),
          company_address: companyAddress.trim(),
          city: city.trim(),
          iban: iban.replace(/\s/g, ''),
        },
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="admin-success-state">
        <div className="admin-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2>Başvurunuz İncelemeye Alındı</h2>
        <p>
          Firma bilgileriniz inceleniyor. Onay e-postasını 2-3 iş günü içinde alacaksınız.
        </p>
        <p className="admin-success-sub">
          Lütfen spam klasörünü de kontrol edin.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="admin-stepper">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`admin-stepper-step ${s === step ? 'is-active' : ''} ${s < step ? 'is-done' : ''}`}>
            <div className="admin-stepper-circle">{s < step ? '✓' : s}</div>
            <span className="admin-stepper-label">
              {s === 1 && 'Kişi'}
              {s === 2 && 'Firma'}
              {s === 3 && 'Ödeme'}
            </span>
          </div>
        ))}
      </div>

      <form className="admin-form" onSubmit={step === 3 ? onSubmit : (e) => { e.preventDefault(); nextStep() }} noValidate>
        {step === 1 && (
          <div className="admin-form-step">
            <h3 className="admin-form-step-title">Kişisel Bilgiler</h3>

            <label className="admin-field">
              <span className="admin-field-label">Ad *</span>
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: '' })
                }}
                placeholder="Adınız"
                className={fieldErrors.firstName ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.firstName && <span className="admin-field-hint">{fieldErrors.firstName}</span>}
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Soyad *</span>
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (fieldErrors.lastName) setFieldErrors({ ...fieldErrors, lastName: '' })
                }}
                placeholder="Soyadınız"
                className={fieldErrors.lastName ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.lastName && <span className="admin-field-hint">{fieldErrors.lastName}</span>}
            </label>

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
              <span className="admin-field-label">Telefon Numarası *</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' })
                }}
                placeholder="+90 500 123 4567"
                className={fieldErrors.phone ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.phone && <span className="admin-field-hint">{fieldErrors.phone}</span>}
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="admin-form-step">
            <h3 className="admin-form-step-title">Şirket Bilgileri</h3>

            <label className="admin-field">
              <span className="admin-field-label">Firma Unvanı *</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value)
                  if (fieldErrors.companyName) setFieldErrors({ ...fieldErrors, companyName: '' })
                }}
                placeholder="Örnek Ltd. Şti."
                className={fieldErrors.companyName ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.companyName && <span className="admin-field-hint">{fieldErrors.companyName}</span>}
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Vergi Kimlik Numarası (VKN) *</span>
              <input
                type="text"
                inputMode="numeric"
                value={vkn}
                onChange={(e) => {
                  setVkn(e.target.value.replace(/\D/g, ''))
                  if (fieldErrors.vkn) setFieldErrors({ ...fieldErrors, vkn: '' })
                }}
                placeholder="1234567890"
                className={fieldErrors.vkn ? 'has-error' : ''}
                disabled={loading}
                maxLength="10"
              />
              {fieldErrors.vkn && <span className="admin-field-hint">{fieldErrors.vkn}</span>}
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Şirket Adresi *</span>
              <textarea
                value={companyAddress}
                onChange={(e) => {
                  setCompanyAddress(e.target.value)
                  if (fieldErrors.companyAddress) setFieldErrors({ ...fieldErrors, companyAddress: '' })
                }}
                placeholder="Mahalle, Sokak, No."
                className={fieldErrors.companyAddress ? 'has-error' : ''}
                disabled={loading}
                rows="3"
              />
              {fieldErrors.companyAddress && <span className="admin-field-hint">{fieldErrors.companyAddress}</span>}
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Şehir *</span>
              <input
                type="text"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  if (fieldErrors.city) setFieldErrors({ ...fieldErrors, city: '' })
                }}
                placeholder="İstanbul"
                className={fieldErrors.city ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.city && <span className="admin-field-hint">{fieldErrors.city}</span>}
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="admin-form-step">
            <h3 className="admin-form-step-title">Ödeme Bilgileri</h3>

            <label className="admin-field">
              <span className="admin-field-label">IBAN *</span>
              <input
                type="text"
                inputMode="numeric"
                value={iban}
                onChange={(e) => {
                  setIban(formatIban(e.target.value))
                  if (fieldErrors.iban) setFieldErrors({ ...fieldErrors, iban: '' })
                }}
                onFocus={() => { if (!iban) setIban('TR ') }}
                placeholder="TR ____ ____ ____ ____ ____ ____"
                maxLength={32}
                className={fieldErrors.iban ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.iban && <span className="admin-field-hint">{fieldErrors.iban}</span>}
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Şifre *</span>
              <div className="admin-field-with-action">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
                  }}
                  placeholder="En az 8 karakter"
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
              {password && (
                <div className="admin-pw-strength" data-level={strength}>
                  <div className="admin-pw-strength-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={i < strength ? 'is-on' : ''} />
                    ))}
                  </div>
                  <span className="admin-pw-strength-label">{STRENGTH_LABELS[strength]}</span>
                </div>
              )}
              {fieldErrors.password && <span className="admin-field-hint">{fieldErrors.password}</span>}
            </label>

            <label className="admin-field">
              <span className="admin-field-label">Şifre (tekrar) *</span>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value)
                  if (fieldErrors.confirm) setFieldErrors({ ...fieldErrors, confirm: '' })
                }}
                placeholder="Şifreni tekrar gir"
                className={fieldErrors.confirm ? 'has-error' : ''}
                disabled={loading}
              />
              {fieldErrors.confirm && <span className="admin-field-hint">{fieldErrors.confirm}</span>}
            </label>

            <label className="admin-checkbox-wrap">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(e) => {
                  setLegalAccepted(e.target.checked)
                  if (fieldErrors.legal) setFieldErrors({ ...fieldErrors, legal: '' })
                }}
                disabled={loading}
              />
              <span className="admin-checkbox-label">
                <button type="button" className="admin-legal-link" onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}>Kullanım Koşulları</button>
                {' '}ve{' '}
                <button type="button" className="admin-legal-link" onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}>Gizlilik Politikası</button>
                'nı okudum ve kabul ediyorum.
              </span>
            </label>
            {fieldErrors.legal && <span className="admin-field-hint" style={{ marginTop: 0 }}>{fieldErrors.legal}</span>}
          </div>
        )}

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <div className="admin-form-actions">
          {step > 1 && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={prevStep}
              disabled={loading}
            >
              Geri
            </button>
          )}
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
          >
            {loading ? <span className="admin-spinner" aria-hidden="true" /> : (step < 3 ? 'İleri' : 'Başvuruyu Gönder')}
          </button>
        </div>
      </form>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        type={legalModal.type} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
      />
    </>
  )
}
