import { useEffect, useState } from 'react'
import { useAuth, useCart, useFav } from '../../store/AppContext'
import { supabase } from '../../lib/supabase'
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

function ProductCard({ product, onClick, onAddToCart, onToggleFav, isFav }) {
  const [imgError, setImgError] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const discountPct = product.discountPercentage > 1
    ? Math.round(product.discountPercentage)
    : null

  const handleCart = (e) => {
    e.stopPropagation()
    onAddToCart(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  const handleFav = (e) => {
    e.stopPropagation()
    onToggleFav(product)
  }

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
      <div className="product-card-footer">
        <p className="product-price"><strong>{formatTL(product.price)}</strong> TL</p>
        <div className="card-quick-actions">
          <button
            key={`fav-${isFav}`}
            className={`card-quick-btn fav ${isFav ? 'active' : ''}`}
            onClick={handleFav}
            aria-label="Favorilere ekle"
          >
            <svg viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button
            key={`cart-${justAdded}`}
            className={`card-quick-btn cart ${justAdded ? 'added' : ''}`}
            onClick={handleCart}
            aria-label="Sepete ekle"
          >
            {justAdded
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage({ onProductClick }) {
  const { requireAuth } = useAuth()
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFav()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(16)

  const handleAddToCart = (product) => {
    requireAuth(() => addToCart({
      id: product.id,
      name: product.title,
      price: formatTL(product.price),
      img: product.thumbnail,
      category: CATEGORY_TR[product.category] ?? product.category,
      supplierId: product.supplier_id || null,
      isSupabaseProduct: !!product.isSupabaseProduct,
    }))
  }

  const handleToggleFav = (product) => {
    requireAuth(() => toggleFavorite({
      id: product.id,
      name: product.title,
      price: formatTL(product.price),
      img: product.thumbnail,
      category: CATEGORY_TR[product.category] ?? product.category,
      supplierId: product.supplier_id || null,
      isSupabaseProduct: !!product.isSupabaseProduct,
    }))
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // 1. DummyJSON'dan örnek ürünleri çek
        const dummyRes = await fetch('https://dummyjson.com/products?limit=50&select=id,title,price,thumbnail,rating,stock,category,discountPercentage,brand')
        const dummyData = await dummyRes.json()
        let allProducts = dummyData.products || []

        // 2. Supabase'den Satıcı ürünlerini çek
        const { data: dbProducts, error } = await supabase
          .from('products')
          .select('*, supplier:suppliers(company_name)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (!error && dbProducts && dbProducts.length > 0) {
          // Supabase ürünlerini DummyJSON formatına uyumlu hale getir
          const formattedDbProducts = dbProducts.map(p => ({
            id: p.id,
            title: p.name,
            price: Number(p.price) / 5,
            thumbnail: p.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
            rating: 5.0,
            stock: p.stock,
            category: p.category || 'Diğer',
            brand: p.supplier?.company_name || 'Yerel Satıcı',
            isSupabaseProduct: true,
            supplier_id: p.supplier_id || null,
          }))
          
          // Supabase ürünlerini listenin EN BAŞINA ekle
          allProducts = [...formattedDbProducts, ...allProducts]
        }

        setProducts(allProducts)
        const unique = [...new Set(allProducts.map(p => p.category))]
        setCategories(unique)
      } catch (err) {
        console.error('Ürünler yüklenemedi:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
          <button className="btn-cta" onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}>Hemen Sor</button>
        </div>

        <div className="hero-mascot">
          <img
            src="https://icons.iconarchive.com/icons/noctuline/wall-e/128/EVE-icon.png"
            alt="EVE maskot"
            className="mascot-robot"
          />

          <div className="chat-bubble">
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
              <h2>Ergün Senin İçin Öneriyor</h2>
            </div>
            <div className="product-grid four">
              {recommended.map(p => (
                <ProductCard key={p.id} product={p} onClick={onProductClick} onAddToCart={handleAddToCart} onToggleFav={handleToggleFav} isFav={isFavorite(p.id)} />
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
                <ProductCard key={p.id} product={p} onClick={onProductClick} onAddToCart={handleAddToCart} onToggleFav={handleToggleFav} isFav={isFavorite(p.id)} />
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
                <ProductCard key={p.id} product={p} onClick={onProductClick} onAddToCart={handleAddToCart} onToggleFav={handleToggleFav} isFav={isFavorite(p.id)} />
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

