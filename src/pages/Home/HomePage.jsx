import { useEffect, useRef, useState } from 'react'
import './HomePage.css'

const CHAT_PRODUCTS = [
  { id: 1, name: 'TWS Kablosuz Kulaklık',      tag: 'Bu fiyata kaçmaz!',    price: '249,90', img: '🎧', slug: 'tws-kulaklik' },
  { id: 2, name: '10.000 mAh Powerbank',        tag: 'İnce ve güçlü!',       price: '179,90', img: '🔋', slug: 'powerbank' },
  { id: 3, name: 'Araç içi Telefon Tutucu',     tag: 'Yolda sağlam durur.',  price: '125,90', img: '📱', slug: 'arac-tutucu' },
  { id: 4, name: 'RGB Gaming Mouse',            tag: 'Oyuncular için ideal.', price: '199,90', img: '🖱️', slug: 'gaming-mouse' },
  { id: 5, name: 'Hızlı Şarj Cihazı',          tag: 'Çok Satan',            price: '99,90',  img: '⚡', slug: 'sarj-cihazi' },
  { id: 6, name: 'Mini Taşınabilir Hoparlör',   tag: 'Çok Satan',            price: '149,90', img: '🔊', slug: 'hoparlor' },
  { id: 7, name: 'Akıllı LED Gece Lambası',     tag: 'Çok Satan',            price: '129,90', img: '💡', slug: 'gece-lambasi' },
]

const KEYWORD_MAP = [
  { keywords: ['tws', 'kablosuz kulaklık', 'kulaklık', 'bluetooth kulaklık', 'kulaklik'], id: 1 },
  { keywords: ['powerbank', 'güç bankası', 'taşınabilir şarj', 'şarj bankası'],           id: 2 },
  { keywords: ['telefon tutucu', 'araç tutucu', 'araç içi tutucu'],                       id: 3 },
  { keywords: ['mouse', 'gaming mouse', 'oyun faresi', 'rgb'],                             id: 4 },
  { keywords: ['şarj cihazı', 'hızlı şarj', 'şarj aleti'],                               id: 5 },
  { keywords: ['hoparlör', 'hoparlor', 'speaker', 'taşınabilir hoparlör'],                id: 6 },
  { keywords: ['gece lambası', 'led lamba', 'gece lambasi', 'lamba'],                     id: 7 },
]

const GENERAL_REPLIES = [
  { keywords: ['merhaba', 'selam', 'hey', 'nasılsın', 'nasilsin'],
    text: 'Merhaba! 😊 Hangi ürünü arıyorsun? Sana en uygun seçeneği bulabilirim.' },
  { keywords: ['teşekkür', 'tesekkur', 'sağ ol', 'eyvallah'],
    text: 'Rica ederim! Başka bir konuda yardımcı olabilir miyim? 🙂' },
  { keywords: ['en ucuz', 'ucuz', 'uygun fiyat', 'fiyat'],
    text: 'En uygun fiyatlı ürünlerimiz:\n• Hızlı Şarj Cihazı — 99,90 TL\n• Araç içi Telefon Tutucu — 125,90 TL\n• Akıllı LED Gece Lambası — 129,90 TL\nHangisini göstereyim?' },
  { keywords: ['ne var', 'ürünler', 'neler var', 'kategoriler'],
    text: 'Şu an şu ürünlerimiz mevcut:\n🎧 TWS Kablosuz Kulaklık\n🔋 Powerbank\n📱 Araç Tutucu\n🖱️ Gaming Mouse\n⚡ Hızlı Şarj Cihazı\n🔊 Mini Hoparlör\n💡 LED Gece Lambası\nHangisini merak ediyorsun?' },
]

function getBotResponse(text) {
  const lower = text.toLowerCase()
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      const product = CHAT_PRODUCTS.find(p => p.id === entry.id)
      return { type: 'product', text: 'Tabii! İşte aradığın ürün 👇', product }
    }
  }
  for (const entry of GENERAL_REPLIES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { type: 'text', text: entry.text }
    }
  }
  return {
    type: 'text',
    text: 'Üzgünüm, tam olarak anlayamadım 🤔 Kulaklık, powerbank, şarj cihazı, mouse, hoparlör veya gece lambası hakkında soru sorabilirsin.',
  }
}

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
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ergun-chat-messages')
      return saved ? JSON.parse(saved) : [{ from: 'bot', type: 'text', text: 'Merhaba! Sana nasıl yardımcı olabilirim? Nasılsın?' }]
    } catch {
      return [{ from: 'bot', type: 'text', text: 'Merhaba! Sana nasıl yardımcı olabilirim? Nasılsın?' }]
    }
  })
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(16)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    localStorage.setItem('ergun-chat-messages', JSON.stringify(messages))
  }, [messages])

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

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const userMsg = { from: 'user', type: 'text', text: trimmed }
    const botMsg  = { from: 'bot', ...getBotResponse(trimmed) }
    setMessages(prev => [...prev, userMsg, botMsg])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

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
          <button className="btn-cta" onClick={() => setChatOpen(true)}>Hemen Sor</button>
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

          <div className="chat-bubble">
            <div className="chat-avatar">🤖</div>
            <div className="chat-msg">
              <p>Merhaba! Sana nasıl yardımcı olabilirim?</p>
            </div>
          </div>
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
              <button className="btn-cta sm" onClick={() => setChatOpen(true)}>Hemen Sor</button>
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

      {!chatOpen && (
        <button className="chat-fab" onClick={() => setChatOpen(true)} aria-label="Sohbeti aç">
          🤖
        </button>
      )}

      {chatOpen && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <span>🤖 Ergün AI</span>
            <button className="chat-widget-close" onClick={() => setChatOpen(false)}>×</button>
          </div>
          <div className="chat-widget-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-widget-row ${msg.from}`}>
                {msg.from === 'bot' && <span className="chat-widget-avatar">🤖</span>}
                <div className="chat-widget-bubble">
                  <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  {msg.type === 'product' && msg.product && (
                    <a href={`#${msg.product.slug}`} className="chat-product-card">
                      <span className="chat-product-img">{msg.product.img}</span>
                      <div className="chat-product-info">
                        <p className="chat-product-name">{msg.product.name}</p>
                        <p className="chat-product-tag">{msg.product.tag}</p>
                        <p className="chat-product-price">{msg.product.price} TL</p>
                      </div>
                      <span className="chat-product-link">İncele →</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-widget-input-area">
            <input
              type="text"
              className="chat-widget-input"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button className="chat-widget-send" onClick={handleSend}>Gönder</button>
          </div>
        </div>
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
