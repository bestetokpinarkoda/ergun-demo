import './HomePage.css'

const CATEGORIES = [
  { name: 'Elektronik', emoji: '💻' },
  { name: 'Giyim',      emoji: '👕' },
  { name: 'Ev & Yaşam', emoji: '🛋️' },
  { name: 'Spor',       emoji: '⚽' },
  { name: 'Kozmetik',   emoji: '💄' },
  { name: 'Kitap',      emoji: '📚' },
]

export default function HomePage() {
  return (
    <main className="home">
      <section className="hero-section">
        <div className="hero-bg-blur hero-bg-blur-1" />
        <div className="hero-bg-blur hero-bg-blur-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Yeni Sezon Koleksiyonu
          </div>

          <h1>
            Her şey burada,<br />
            <span>bir tık uzağında</span>
          </h1>

          <p>
            Binlerce ürün arasından seçimini yap,
            güvenli öde, kapına gelsin.
          </p>

          <div className="hero-actions">
            <button className="hero-cta">Alışverişe Başla</button>
            <button className="hero-cta-secondary">Kategorileri Keşfet</button>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Ürün</span>
            </div>
            <div className="stat">
              <span className="stat-number">200K+</span>
              <span className="stat-label">Mutlu Müşteri</span>
            </div>
            <div className="stat">
              <span className="stat-number">%99</span>
              <span className="stat-label">Memnuniyet</span>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-header">
          <h2>Kategoriler</h2>
          <a href="#">Tümünü gör →</a>
        </div>

        <div className="category-grid">
          {CATEGORIES.map(({ name, emoji }) => (
            <div key={name} className="category-card">
              <div className="category-icon-wrap">{emoji}</div>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="banner-section">
        <div className="banner-card">
          <div className="banner-text">
            <p className="banner-label">Sınırlı Süre</p>
            <h2>İlk siparişinde<br />%20 indirim kazan</h2>
            <p>Üye ol, ilk alışverişinde özel indirim kodunu al.</p>
          </div>
          <button className="banner-cta">Hemen Üye Ol</button>
        </div>
      </section>
    </main>
  )
}
