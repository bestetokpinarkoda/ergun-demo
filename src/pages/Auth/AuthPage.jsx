import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import './AuthPage.css'

export default function AuthPage({ onBack }) {
  const [tab, setTab] = useState('login')

  return (
    <main className="auth-page">
      <div className="auth-bg-blur auth-bg-blur-1" />
      <div className="auth-bg-blur auth-bg-blur-2" />

      <div className="auth-card">
        <button
          type="button"
          className="auth-back"
          onClick={onBack}
          aria-label="Geri dön"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="auth-brand">
          <span className="auth-brand-text">ErgunShop</span>
          <p className="auth-brand-sub">Hoş geldin, devam etmek için giriş yap.</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-tab ${tab === 'login' ? 'is-active' : ''}`}
            onClick={() => setTab('login')}
          >
            Giriş yap
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-tab ${tab === 'register' ? 'is-active' : ''}`}
            onClick={() => setTab('register')}
          >
            Üye ol
          </button>
          <span
            className="auth-tab-indicator"
            data-pos={tab}
            aria-hidden="true"
          />
        </div>

        <div className="auth-form-wrap">
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </main>
  )
}
