import { useState } from 'react'
import './HomePage.css'

const RECOMMENDED = [
  { id: 1, name: 'TWS Kablosuz Kulaklık', tag: 'Bu fiyara kaçmaz!',  price: '249,90', img: '🎧' },
  { id: 2, name: '10.000 mAh Powerbank',  tag: 'İnce ve güçlü!',     price: '179,90', img: '🔋' },
  { id: 3, name: 'Araç içi Telefon Tutucu', tag: 'Yolda sağlam durur.', price: '125,90', img: '📱' },
  { id: 4, name: 'RGB Gaming Mouse',       tag: 'Oyuncular için ideal.', price: '199,90', img: '🖱️' },
]

const CATEGORIES = [
  { name: 'Şarj Aletleri',        icon: '🔌' },
  { name: 'Bluetooth Kulaklık',   icon: '🎧' },
  { name: 'Laptop Aksesuarları',  icon: '💻' },
  { name: 'Araç içi Ürünler',    icon: '🚗' },
]

const BESTSELLERS = [
  {
    id: 1, name: 'Hızlı Şarj Cihazı', price: '99,90',
    svg: (
      <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="20" width="60" height="90" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
        <rect x="40" y="30" width="40" height="55" rx="4" fill="#f8fafc"/>
        <rect x="45" y="36" width="12" height="5" rx="2" fill="#94a3b8"/>
        <rect x="63" y="36" width="12" height="5" rx="2" fill="#94a3b8"/>
        <rect x="45" y="48" width="12" height="5" rx="2" fill="#94a3b8"/>
        <rect x="63" y="48" width="12" height="5" rx="2" fill="#94a3b8"/>
        <rect x="48" y="100" width="24" height="14" rx="4" fill="#94a3b8"/>
        <rect x="54" y="114" width="12" height="8" rx="2" fill="#64748b"/>
        <path d="M52 62 L58 50 L58 62 L68 62 L62 74 L62 62 Z" fill="#F59E0B"/>
      </svg>
    ),
  },
  {
    id: 2, name: 'Mini Taşınabilir Hoparlör', price: '149,90',
    svg: (
      <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="80" rx="38" ry="38" fill="#1e293b"/>
        <ellipse cx="60" cy="80" rx="28" ry="28" fill="#334155"/>
        <ellipse cx="60" cy="80" rx="16" ry="16" fill="#475569"/>
        <ellipse cx="60" cy="80" rx="6" ry="6" fill="#94a3b8"/>
        <circle cx="60" cy="80" r="2" fill="#e2e8f0"/>
        <rect x="54" y="35" width="12" height="22" rx="6" fill="#334155"/>
        <ellipse cx="60" cy="35" rx="6" ry="4" fill="#475569"/>
        <circle cx="82" cy="68" r="3" fill="#F59E0B"/>
        <circle cx="82" cy="78" r="3" fill="#94a3b8"/>
        <circle cx="82" cy="88" r="3" fill="#94a3b8"/>
      </svg>
    ),
  },
  {
    id: 3, name: 'Akıllı LED Gece Lambası', price: '129,90',
    svg: (
      <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="118" rx="28" ry="6" fill="#e2e8f0"/>
        <rect x="32" y="58" width="56" height="60" rx="28" fill="#fef9c3"/>
        <rect x="32" y="58" width="56" height="60" rx="28" fill="url(#lampGrad)" opacity="0.8"/>
        <rect x="44" y="85" width="32" height="26" rx="16" fill="white" opacity="0.3"/>
        <ellipse cx="60" cy="58" rx="28" ry="12" fill="#fde68a"/>
        <ellipse cx="60" cy="56" rx="18" ry="8" fill="#fbbf24"/>
        <path d="M50 30 Q60 15 70 30" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M44 38 Q36 28 42 20" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M76 38 Q84 28 78 20" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <defs>
          <linearGradient id="lampGrad" x1="60" y1="58" x2="60" y2="118" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbbf24"/>
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0.4"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
]

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(true)

  return (
    <main className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-sub">Ne alacağını bilmiyor musun? <strong>Ergün'e sor!</strong></p>
          <h1 className="hero-title">Sor, Ergün söylesin.</h1>
          <button className="btn-cta">Hemen Sor</button>
        </div>

        <div className="hero-mascot">
          <div className="mascot-body">
            <div className="mascot-head">
              <div className="mascot-eye left" />
              <div className="mascot-eye right" />
              <div className="mascot-mouth" />
            </div>
            <div className="mascot-ears">
              <div className="mascot-ear" />
              <div className="mascot-ear" />
            </div>
          </div>

          {chatOpen && (
            <div className="chat-bubble">
              <div className="chat-avatar">🤖</div>
              <div className="chat-msg">
                <p>Merhaba! Sana nasıl yardımcı olabilirim? Nasılsın?</p>
              </div>
              <button className="chat-close" onClick={() => setChatOpen(false)}>×</button>
            </div>
          )}
        </div>

        <div className="hero-stars">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="star" style={{ '--i': i }}>✦</span>
          ))}
        </div>
      </section>

      {/* ── ERGÜN ÖNERİYOR ── */}
      <section className="section">
        <div className="section-head">
          <h2>Ergün Öneriyor</h2>
          <button className="btn-cta sm">Hemen Sor</button>
        </div>

        <div className="product-grid four">
          {RECOMMENDED.map(p => (
            <div key={p.id} className="product-card">
              <p className="product-tag">{p.tag}</p>
              <div className="product-img">{p.img}</div>
              <p className="product-name">{p.name}</p>
              <p className="product-price"><strong>{p.price}</strong> TL</p>
            </div>
          ))}
        </div>

        <div className="center-row">
          <button className="btn-outline">Tüm Önerileri Gör &gt;</button>
        </div>
      </section>

      {/* ── POPÜler KATEGORİLER ── */}
      <section className="section">
        <div className="section-head">
          <h2>Popüler Kategoriler</h2>
        </div>

        <div className="product-grid four">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="category-card">
              <div className="cat-img">{cat.icon}</div>
              <p className="cat-name">
                <span className="cat-dot">◇</span> {cat.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÇOK SATAN ── */}
      <section className="section">
        <div className="section-head">
          <h2>Çok Satan Ürünler</h2>
        </div>

        <div className="product-grid three">
          {BESTSELLERS.map(p => (
            <div key={p.id} className="product-card">
              <span className="badge-hot">Çok Satan</span>
              <div className="product-img-area">{p.svg}</div>
              <p className="product-name">{p.name}</p>
              <p className="product-price"><strong>{p.price}</strong> TL</p>
            </div>
          ))}
        </div>

        <div className="carousel-dots">
          {[0,1,2,3,4].map(i => (
            <span key={i} className={`dot${i === 0 ? ' active' : ''}`} />
          ))}
        </div>
      </section>

    </main>
  )
}
