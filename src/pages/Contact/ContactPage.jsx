import './ContactPage.css'

export default function ContactPage({ onBack }) {
  return (
    <main className="contact-page">
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="bc-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bc-sep">›</span>
          <span className="bc-current">İletişim</span>
        </div>
      </div>

      <div className="contact-container">
        <h1 className="contact-page-title">İLETİŞİM BİLGİLERİ</h1>

        <div className="contact-cards">
          <div className="contact-card">
            <span className="contact-card-icon">📍</span>
            <div>
              <h3>Adres</h3>
              <p>İşkuleleri Kule 2 Kat:24<br />Levent Beşiktaş / İSTANBUL</p>
            </div>
          </div>

          <div className="contact-card">
            <span className="contact-card-icon">✉️</span>
            <div>
              <h3>E-posta</h3>
              <a href="mailto:info@ergunholding.com">info@ergunholding.com</a>
            </div>
          </div>

          <div className="contact-card">
            <span className="contact-card-icon">📞</span>
            <div>
              <h3>Telefon</h3>
              <a href="tel:+902129063838">+90 (212) 906 38 38</a>
            </div>
          </div>
        </div>

        <div className="contact-social-section">
          <h2>Bizi Takip Edin</h2>
          <div className="contact-social-links">
            <a
              href="https://www.linkedin.com/company/erg%C3%BCn-holding/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-social-btn contact-social-btn--linkedin"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/ergun_holding/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-social-btn contact-social-btn--instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/ergunholding/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-social-btn contact-social-btn--facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
