import { useState } from 'react'
import AdminLoginForm from './AdminLoginForm'
import AdminRegisterForm from './AdminRegisterForm'
import './AdminAuthPage.css'

export default function AdminAuthPage({ onBack }) {
  const [tab, setTab] = useState('login')

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-container">
        <button
          type="button"
          className="admin-auth-back"
          onClick={onBack}
          aria-label="Geri dön"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="admin-auth-header">
          <h1 className="admin-auth-title">Satıcı Paneli</h1>
          <p className="admin-auth-desc">
            Ürün ekle, satışları yönet ve işletmeni büyüt.
          </p>
        </div>

        <div className="admin-auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`admin-auth-tab ${tab === 'login' ? 'is-active' : ''}`}
            onClick={() => setTab('login')}
          >
            Giriş yap
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            className={`admin-auth-tab ${tab === 'register' ? 'is-active' : ''}`}
            onClick={() => setTab('register')}
          >
            Başvuru yap
          </button>
          <span
            className="admin-auth-tab-indicator"
            data-pos={tab}
            aria-hidden="true"
          />
        </div>

        <div className="admin-auth-form-wrap">
          {tab === 'login' ? <AdminLoginForm /> : <AdminRegisterForm />}
        </div>
      </div>
    </main>
  )
}
