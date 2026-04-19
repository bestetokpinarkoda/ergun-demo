import { useEffect, useState } from 'react'
import './HomePage.css'

const CATEGORY_TR = {
  beauty: 'Güzellik',
  fragrances: 'Parfüm',
  furniture: 'Mobilya',
  groceries: 'Market',
  'home-decoration': 'Ev Dekorasyonu',
  'kitchen-accessories': 'Mutfak',
  laptops: 'Laptop',
  'mens-shirts': 'Erkek Gömlek',
  'mens-shoes': 'Erkek Ayakkabı',
  'mens-watches': 'Erkek Saat',
  'mobile-accessories': 'Telefon Aksesuarları',
  motorcycle: 'Motosiklet',
  'skin-care': 'Cilt Bakımı',
  smartphones: 'Akıllı Telefon',
  'sports-accessories': 'Spor',
  sunglasses: 'Güneş Gözlüğü',
  tablets: 'Tablet',
  tops: 'Üst Giyim',
  vehicle: 'Araç',
  'womens-bags': 'Kadın Çanta',
  'womens-dresses': 'Elbise',
  'womens-jewellery': 'Takı',
  'womens-shoes': 'Kadın Ayakkabı',
  'womens-watches': 'Kadın Saat',
}

const CATEGORY_ICONS = {
  smartphones: '📱', laptops: '💻', tablets: '📟',
  'mobile-accessories': '🔌', 'mens-watches': '⌚', 'womens-watches': '⌚',
  'mens-shoes': '👟', 'womens-shoes': '👠', furniture: '🛋️',
  'home-decoration': '🏠', beauty: '💄', fragrances: '🌸',
  'skin-care': '✨', 'sports-accessories': '⚽', groceries: '🛒',
  'kitchen-accessories': '🍳', sunglasses: '🕶️', tops: '👕',
  'mens-shirts': '👔', 'womens-dresses': '👗', 'womens-bags': '👜',
  'womens-jewellery': '💍', vehicle: '🚗', motorcycle: '🏍️',
}

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false)
  const discountPct = product.discountPercentage > 1
    ? Math.round(product.discountPercentage)
    : null

  return (
    <div className="product-card" onClick={() => onClick(product.id)}>
      {discountPct && <span className="badge-hot">%{discountPct} İndirim</span>}
      <div className="product-img-area">
        {imgError
          ? <span style={{ fontSize: '3rem' }}>📦</span>
          : <img
              src={product.thumbnail}
              alt={product.title}
              className="product-api-img"
              onError={() => setImgError(true)}
            />
        }
      </div>
      <p className="product-brand">{product.brand ?? CATEGORY_TR[product.category] ?? product.category}</p>
      <p className="product-name">{product.title}</p>
      <div className="product-rating-row">
        <span className="mini-star">★</span>
        <span className="mini-rating">{product.rating?.toFixed(1)}</span>
      </div>
      <p className="product-price"><strong>{formatTL(product.price)}</strong> TL</p>
    </div>
  )
}

export default function HomePage({ onProductClick }) {
  const [chatOpen, setChatOpen] = useState(true)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(16)

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=100&select=id,title,price,thumbnail,rating,stock,category,discountPercentage,brand')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products)
        const unique = [...new Set(data.products.map(p => p.category))].slice(0, 12)
        setCategories(unique)
      })
      .finally(() => setLoading(false))
  }, [])

  const recommended = products.slice(0, 8)
  const bestsellers = [...products].sort((a, b) => b.rating - a.rating).slice(0, 6)
  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory)
  const visible = filtered.slice(0, visibleCount)

  return (
    <main className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-sub">Ne alacağını bilmiyor musun? <strong>Ergün&apos;e sor!</strong></p>
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
                <p>Merhaba! Sana nasıl yardımcı olabilirim?</p>
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

      {loading ? (
        <div className="hp-loading">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <>
          {/* ── ERGÜN ÖNERİYOR ── */}
          <section className="section">
            <div className="section-head">
              <h2>Ergün Öneriyor</h2>
              <button className="btn-cta sm">Hemen Sor</button>
            </div>
            <div className="product-grid four">
              {recommended.map(p => (
                <ProductCard key={p.id} product={p} onClick={onProductClick} />
              ))}
            </div>
          </section>

          {/* ── POPÜler KATEGORİLER ── */}
          <section className="section">
            <div className="section-head">
              <h2>Popüler Kategoriler</h2>
            </div>
            <div className="product-grid four">
              {categories.map(cat => (
                <div
                  key={cat}
                  className={`category-card ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(activeCategory === cat ? 'all' : cat)
                    setVisibleCount(16)
                    document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <div className="cat-img">{CATEGORY_ICONS[cat] ?? '📦'}</div>
                  <p className="cat-name">
                    <span className="cat-dot">◇</span>
                    {CATEGORY_TR[cat] ?? cat}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── ÇOK SATAN ── */}
          <section className="section">
            <div className="section-head">
              <h2>En Çok Satanlar</h2>
            </div>
            <div className="product-grid three">
              {bestsellers.map(p => (
                <div key={p.id} className="product-card" onClick={() => onProductClick(p.id)}>
                  <span className="badge-hot">⭐ Çok Satan</span>
                  <BestsellerImg product={p} />
                  <p className="product-name">{p.title}</p>
                  <div className="product-rating-row">
                    <span className="mini-star">★</span>
                    <span className="mini-rating">{p.rating?.toFixed(1)}</span>
                  </div>
                  <p className="product-price"><strong>{formatTL(p.price)}</strong> TL</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── TÜM ÜRÜNLER ── */}
          <section className="section" id="all-products">
            <div className="section-head">
              <h2>
                {activeCategory === 'all'
                  ? 'Tüm Ürünler'
                  : CATEGORY_TR[activeCategory] ?? activeCategory}
                <span className="product-count"> ({filtered.length} ürün)</span>
              </h2>
              {activeCategory !== 'all' && (
                <button className="btn-outline sm" onClick={() => setActiveCategory('all')}>
                  × Filtreyi Kaldır
                </button>
              )}
            </div>
            <div className="product-grid four">
              {visible.map(p => (
                <ProductCard key={p.id} product={p} onClick={onProductClick} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="center-row">
                <button className="btn-outline" onClick={() => setVisibleCount(v => v + 16)}>
                  Daha Fazla Göster ({filtered.length - visibleCount} ürün daha)
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

function BestsellerImg({ product }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="product-img-area">
      {imgError
        ? <span style={{ fontSize: '4rem' }}>📦</span>
        : <img
            src={product.thumbnail}
            alt={product.title}
            className="product-api-img"
            onError={() => setImgError(true)}
          />
      }
    </div>
  )
}
