import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import './AuthPage.css'

const FEATURES = [
  { icon: '🚀', text: '50.000+ üründe avantajlı fiyatlar' },
  { icon: '🔒', text: 'Güvenli ödeme & kişisel veri koruması' },
  { icon: '📦', text: 'Hızlı teslimat & kolay iade' },
  { icon: '💬', text: 'Ergün AI ile akıllı ürün önerileri' },
]

export default function AuthPage({ onBack }) {
  const [tab, setTab] = useState('login')

  return (
    <main className="auth-page">
      {/* ── Sol panel ── */}
      <div className="auth-panel-left">
        <button className="auth-back-left" onClick={onBack} aria-label="Geri dön">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Ana Sayfaya Dön
        </button>

        <div className="auth-brand-left">
          <div className="auth-logo-left">
            <span className="logo-line1">ERGUN</span>
            <span className="logo-line2">SHOP</span>
          </div>
          <h2>Alışverişin en kolay hali.</h2>
          <p>Üye olarak binlerce fırsata hemen ulaş.</p>
        </div>

        <ul className="auth-features">
          {FEATURES.map(f => (
            <li key={f.text}>
              <span className="feat-icon">{f.icon}</span>
              <span>{f.text}</span>
            </li>
          ))}
        </ul>

        <div className="auth-deco-circle circle-1" />
        <div className="auth-deco-circle circle-2" />
      </div>

      {/* ── Sağ panel: form ── */}
      <div className="auth-panel-right">
        <button className="auth-back-mobile" onClick={onBack} aria-label="Geri dön">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-brand-text">Hoş Geldin</span>
            <p className="auth-brand-sub">
              {tab === 'login'
                ? 'Hesabına giriş yap, devam et.'
                : 'Hemen üye ol, fırsatları yakala.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'login'}
              className={`auth-tab ${tab === 'login' ? 'is-active' : ''}`}
              onClick={() => setTab('login')}
            >
              Giriş Yap
            </button>
            <button
              role="tab"
              aria-selected={tab === 'register'}
              className={`auth-tab ${tab === 'register' ? 'is-active' : ''}`}
              onClick={() => setTab('register')}
            >
              Üye Ol
            </button>
            <span className="auth-tab-indicator" data-pos={tab} aria-hidden="true" />
          </div>

          <div className="auth-form-wrap">
            {tab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </main>
  )
}
