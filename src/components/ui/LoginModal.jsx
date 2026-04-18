import { useState } from 'react'
import { useAuth } from '../../store/AppContext'
import './LoginModal.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function fakeAuth(email, password, isRegister) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isRegister) {
        if (password.length < 6) { reject(new Error('Şifre en az 6 karakter olmalı.')); return }
        resolve({ email, name: email.split('@')[0] })
      } else {
        if (password.length < 6) { reject(new Error('E-posta veya şifre hatalı.')); return }
        resolve({ email, name: email.split('@')[0] })
      }
    }, 800)
  })
}

function MiniForm({ isRegister, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!EMAIL_RE.test(email)) { setError('Geçerli bir e-posta girin.'); return }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return }
    setLoading(true)
    try {
      const user = await fakeAuth(email, password, isRegister)
      onSuccess(isRegister ? { ...user, name } : user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="lm-form" onSubmit={handleSubmit}>
      {isRegister && (
        <input
          className="lm-input"
          type="text"
          placeholder="Ad Soyad"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
          required
        />
      )}
      <input
        className="lm-input"
        type="email"
        placeholder="E-posta adresi"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <input
        className="lm-input"
        type="password"
        placeholder={isRegister ? 'Şifre (en az 6 karakter)' : 'Şifre'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={loading}
        required
      />
      {error && <p className="lm-error">{error}</p>}
      <button type="submit" className="lm-submit" disabled={loading}>
        {loading
          ? <span className="lm-spinner" />
          : isRegister ? 'Üye Ol' : 'Giriş Yap'
        }
      </button>
    </form>
  )
}

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth()
  const [tab, setTab] = useState('login')

  if (!loginModalOpen) return null

  return (
    <div className="lm-overlay" onClick={closeLoginModal}>
      <div className="lm-box" onClick={e => e.stopPropagation()}>
        <button className="lm-close" onClick={closeLoginModal} aria-label="Kapat">×</button>

        <div className="lm-header">
          <div className="lm-lock-icon">🔐</div>
          <h2 className="lm-title">Devam etmek için giriş yapın</h2>
          <p className="lm-subtitle">
            Sepete eklemek ve favorilere kaydetmek için hesabınıza giriş yapmanız gerekiyor.
          </p>
        </div>

        <div className="lm-tabs">
          <button
            className={`lm-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Giriş Yap
          </button>
          <button
            className={`lm-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Üye Ol
          </button>
          <span className="lm-tab-bar" data-tab={tab} />
        </div>

        <MiniForm
          key={tab}
          isRegister={tab === 'register'}
          onSuccess={(userData) => login(userData)}
        />

        <div className="lm-divider"><span>veya hızlı giriş</span></div>

        <div className="lm-sso">
          <button
            className="lm-sso-btn"
            onClick={() => login({ email: 'demo@ergun.shop', name: 'Demo Kullanıcı' })}
          >
            <span>🧪</span>
            Demo Hesabıyla Devam Et
          </button>
        </div>
      </div>
    </div>
  )
}
