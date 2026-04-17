import { useState } from 'react'
import './Header.css'

export default function Header() {
  const [cartCount] = useState(0)
  const [favCount] = useState(0)

  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-text">ErgunShop</span>
      </div>

      <nav className="header-nav">
        <button className="nav-btn favorites-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="nav-btn-label">Favorilerim</span>
          {favCount > 0 && <span className="badge">{favCount}</span>}
        </button>

        <button className="nav-btn cart-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="nav-btn-label">Sepetim</span>
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>

        <button className="nav-btn login-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="nav-btn-label">Giriş Yap</span>
        </button>
      </nav>
    </header>
  )
}
