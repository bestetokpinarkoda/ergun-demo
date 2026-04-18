import { useState } from 'react'
import Logo from '../ui/Logo'
import { useCart } from '../../store/AppContext'
import { useFav } from '../../store/AppContext'
import { useAuth } from '../../store/AppContext'
import './Header.css'

const CATEGORIES = [
  'Telefon Aksesuarları',
  'Ses Ürünleri',
  'Bilgisayar Aksesuarları',
  'Araç içi Teknoloji',
  'Günlük Tech',
]

export default function Header({ onLoginClick, onAdminClick, onHomeClick, onCartClick, onFavClick, onProfileClick }) {
  const [search, setSearch] = useState('')
  const { cartCount } = useCart()
  const { favCount } = useFav()
  const { user, logout, openLoginModal } = useAuth()

  return (
    <header className="header">
      <div className="header-main">
        <button className="logo-btn" onClick={onHomeClick} aria-label="Ana Sayfa">
          <Logo className="header-logo" />
        </button>

        <div className="header-search">
          <input
            className="search-input"
            type="text"
            placeholder="Ürün arayın..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="search-btn" aria-label="Ara">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        <nav className="header-actions">
          <button className="action-btn" onClick={onAdminClick}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Panel</span>
          </button>

          <button className="action-btn" onClick={user ? onFavClick : openLoginModal}>
            <svg viewBox="0 0 24 24" fill={favCount > 0 && user ? 'var(--danger)' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favoriler</span>
            {favCount > 0 && user && <span className="action-badge">{favCount}</span>}
          </button>

          <button className="action-btn" onClick={user ? onCartClick : openLoginModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Sepetim</span>
            {cartCount > 0 && user && <span className="action-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.name?.charAt(0).toUpperCase() ?? 'U'}</div>
              <div className="user-dropdown">
                <span className="user-name">{user.name}</span>
                <button className="user-profile-btn" onClick={onProfileClick}>👤 Profilim</button>
                <button className="user-logout" onClick={logout}>Çıkış Yap</button>
              </div>
            </div>
          ) : (
            <button className="action-btn" onClick={onLoginClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Hesabım</span>
            </button>
          )}
        </nav>
      </div>

      <nav className="header-cats">
        {CATEGORIES.map(cat => (
          <button key={cat} className="cat-link">{cat}</button>
        ))}
      </nav>
    </header>
  )
}
