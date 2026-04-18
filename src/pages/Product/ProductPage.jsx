import { useEffect, useState } from 'react'
import { useCart } from '../../store/AppContext'
import { useFav } from '../../store/AppContext'
import { useAuth } from '../../store/AppContext'
import './ProductPage.css'

const CATEGORY_TR = {
  beauty: 'Güzellik', fragrances: 'Parfüm', furniture: 'Mobilya',
  groceries: 'Market', 'home-decoration': 'Ev Dekorasyonu',
  'kitchen-accessories': 'Mutfak', laptops: 'Laptop',
  'mens-shirts': 'Erkek Gömlek', 'mens-shoes': 'Erkek Ayakkabı',
  'mens-watches': 'Erkek Saat', 'mobile-accessories': 'Telefon Aksesuarları',
  motorcycle: 'Motosiklet', 'skin-care': 'Cilt Bakımı',
  smartphones: 'Akıllı Telefon', 'sports-accessories': 'Spor',
  sunglasses: 'Güneş Gözlüğü', tablets: 'Tablet', tops: 'Üst Giyim',
  vehicle: 'Araç', 'womens-bags': 'Kadın Çanta', 'womens-dresses': 'Elbise',
  'womens-jewellery': 'Takı', 'womens-shoes': 'Kadın Ayakkabı', 'womens-watches': 'Kadın Saat',
}

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

function StarRating({ rating, size = 'md' }) {
  return (
    <div className={`star-rating ${size}`}>
      {[1, 2, 3, 4, 5].map(i => {
        let cls = ''
        if (i <= Math.floor(rating)) cls = 'filled'
        else if (i <= Math.ceil(rating) && rating % 1 >= 0.3) cls = 'half'
        return <span key={i} className={`star-icon ${cls}`}>★</span>
      })}
    </div>
  )
}

function avatarColor(name = '') {
  const colors = ['#345C9E', '#8B7CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']
  return colors[name.charCodeAt(0) % colors.length]
}

function buildSpecs(p) {
  const specs = []
  if (p.brand) specs.push({ label: 'Marka', value: p.brand })
  if (p.weight) specs.push({ label: 'Ağırlık', value: `${p.weight} kg` })
  if (p.dimensions) {
    const d = p.dimensions
    specs.push({ label: 'Boyutlar', value: `${d.width} × ${d.height} × ${d.depth} cm` })
  }
  if (p.sku) specs.push({ label: 'SKU', value: p.sku })
  if (p.warrantyInformation) specs.push({ label: 'Garanti', value: p.warrantyInformation })
  if (p.shippingInformation) specs.push({ label: 'Kargo', value: p.shippingInformation })
  if (p.returnPolicy) specs.push({ label: 'İade Politikası', value: p.returnPolicy })
  if (p.availabilityStatus) specs.push({ label: 'Durum', value: p.availabilityStatus })
  if (p.minimumOrderQuantity) specs.push({ label: 'Min. Sipariş', value: `${p.minimumOrderQuantity} adet` })
  return specs
}

const RATING_DIST = [
  { stars: 5, pct: 62 },
  { stars: 4, pct: 24 },
  { stars: 3, pct: 9 },
  { stars: 2, pct: 3 },
  { stars: 1, pct: 2 },
]

export default function ProductPage({ productId, onBack, onNavigate }) {
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(null)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addedToCart, setAddedToCart] = useState(false)

  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFav()
  const { requireAuth, user } = useAuth()

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    setProduct(null)
    setActiveImg(null)
    setQty(1)
    setActiveTab('description')
    fetch(`https://dummyjson.com/products/${productId}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setActiveImg(data.thumbnail)
        return fetch(`https://dummyjson.com/products/category/${data.category}?limit=6`)
          .then(r => r.json())
          .then(rel => setRelated(rel.products.filter(p => p.id !== data.id).slice(0, 4)))
      })
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <main className="product-page">
        <div className="pd-skeleton-wrap">
          <div className="pd-skeleton-img" />
          <div className="pd-skeleton-info">
            <div className="pd-skeleton-line w70" />
            <div className="pd-skeleton-line w50" />
            <div className="pd-skeleton-line w40" />
            <div className="pd-skeleton-line w60" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="product-page">
        <div className="pd-not-found">
          <span className="pd-nf-icon">😔</span>
          <p>Ürün bulunamadı.</p>
          <button className="btn-outline" onClick={onBack}>Ana Sayfaya Dön</button>
        </div>
      </main>
    )
  }

  const inFav = isFavorite(product.id)
  const categoryTR = CATEGORY_TR[product.category] ?? product.category
  const discountPct = product.discountPercentage > 1 ? Math.round(product.discountPercentage) : null
  const priceTL = formatTL(product.price)
  const originalTL = discountPct ? formatTL(product.price / (1 - product.discountPercentage / 100)) : null
  const specs = buildSpecs(product)
  const images = product.images?.length ? product.images : [product.thumbnail]
  const lowStock = product.stock <= 10

  const cartProduct = {
    id: product.id,
    name: product.title,
    price: priceTL,
    img: product.thumbnail,
    category: categoryTR,
  }

  const handleAddToCart = () => {
    requireAuth(() => {
      addToCart(cartProduct, qty)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2200)
    })
  }

  const handleToggleFav = () => {
    requireAuth(() => toggleFavorite(cartProduct))
  }

  const TABS = [
    { key: 'description', label: 'Açıklama' },
    { key: 'specs', label: 'Özellikler' },
    { key: 'reviews', label: `Yorumlar (${product.reviews?.length ?? 0})` },
  ]

  return (
    <main className="product-page">

      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="bc-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bc-sep">›</span>
          <span className="bc-link muted">{categoryTR}</span>
          <span className="bc-sep">›</span>
          <span className="bc-current">{product.title}</span>
        </div>
      </div>

      <div className="pd-container">

        {/* Top: Gallery + Info */}
        <div className="pd-top">

          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img">
              {discountPct && <span className="pd-discount-badge">%{discountPct} İndirim</span>}
              <div className="pd-img-display">
                <img
                  src={activeImg}
                  alt={product.title}
                  className="pd-product-photo"
                  onError={e => { e.target.style.display='none' }}
                />
              </div>
            </div>
            <div className="pd-thumbs">
              {images.slice(0, 5).map((img, i) => (
                <div
                  key={i}
                  className={`pd-thumb ${activeImg === img ? 'active' : ''}`}
                  onClick={() => setActiveImg(img)}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    className="pd-thumb-photo"
                    onError={e => { e.target.style.display='none' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            {product.brand && <p className="pd-category">{product.brand} · {categoryTR}</p>}
            {!product.brand && <p className="pd-category">{categoryTR}</p>}

            <h1 className="pd-name">{product.title}</h1>

            <div className="pd-rating-row">
              <StarRating rating={product.rating} />
              <span className="pd-rating-num">{product.rating?.toFixed(1)}</span>
              <span className="pd-review-cnt">({product.reviews?.length ?? 0} yorum)</span>
            </div>

            {product.tags?.length > 0 && (
              <div className="pd-tags">
                {product.tags.map(t => <span key={t} className="pd-tag">#{t}</span>)}
              </div>
            )}

            <div className="pd-price-block">
              {originalTL && <span className="pd-original-price">{originalTL} TL</span>}
              <div className="pd-price-row">
                <span className="pd-price">{priceTL} TL</span>
                {discountPct && <span className="pd-disc-tag">%{discountPct} İndirim</span>}
              </div>
            </div>

            {lowStock && (
              <p className="pd-stock-warn">⚠️ Son {product.stock} ürün kaldı!</p>
            )}

            <div className="pd-qty-row">
              <span className="pd-qty-label">Adet:</span>
              <div className="pd-qty-ctrl">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}>+</button>
              </div>
            </div>

            <div className="pd-actions">
              <button
                className={`btn-add-cart ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? '✓ Sepete Eklendi!' : '🛒 Sepete Ekle'}
              </button>
              <button
                className={`btn-fav ${user && inFav ? 'active' : ''}`}
                onClick={handleToggleFav}
                aria-label="Favorilere ekle"
              >
                {user && inFav ? '♥' : '♡'}
              </button>
            </div>

            <div className="pd-trust-badges">
              <div className="trust-item"><span className="trust-icon">🚚</span><span>Ücretsiz Kargo (1.000 TL üzeri)</span></div>
              <div className="trust-item"><span className="trust-icon">↩️</span><span>30 Gün Kolay İade Garantisi</span></div>
              <div className="trust-item"><span className="trust-icon">🔒</span><span>256-bit SSL Güvenli Ödeme</span></div>
              <div className="trust-item"><span className="trust-icon">🏷️</span><span>Orijinal Ürün Garantisi</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          <div className="tab-nav">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-description">
                <p>{product.description}</p>
                <div className="desc-highlights">
                  <div className="highlight-item"><span className="hl-icon">✓</span><span>Orijinal ürün garantisi</span></div>
                  <div className="highlight-item"><span className="hl-icon">✓</span><span>Hızlı ve güvenli kargo</span></div>
                  <div className="highlight-item"><span className="hl-icon">✓</span><span>30 gün içinde iade hakkı</span></div>
                  <div className="highlight-item"><span className="hl-icon">✓</span><span>7/24 müşteri desteği</span></div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="tab-specs">
                {specs.length > 0 ? (
                  <table className="specs-table">
                    <tbody>
                      {specs.map((s, i) => (
                        <tr key={i}>
                          <td className="spec-label">{s.label}</td>
                          <td className="spec-value">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bu ürün için özellik bilgisi bulunmuyor.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-reviews">
                <div className="reviews-summary">
                  <div className="rs-score">
                    <span className="rs-big">{product.rating?.toFixed(1)}</span>
                    <StarRating rating={product.rating} size="lg" />
                    <span className="rs-total">{product.reviews?.length ?? 0} değerlendirme</span>
                  </div>
                  <div className="rs-bars">
                    {RATING_DIST.map(({ stars, pct }) => (
                      <div key={stars} className="rs-bar-row">
                        <span className="rs-star-label">{stars} ★</span>
                        <div className="rs-bar-track">
                          <div className="rs-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="rs-pct">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="review-list">
                  {(product.reviews ?? []).map((r, i) => (
                    <div key={i} className="review-card">
                      <div className="review-avatar" style={{ background: avatarColor(r.reviewerName) }}>
                        {r.reviewerName?.charAt(0) ?? 'K'}
                      </div>
                      <div className="review-body">
                        <div className="review-header">
                          <span className="review-author">{r.reviewerName}</span>
                          <span className="verified-badge">✓ Doğrulanmış Alıcı</span>
                          <span className="review-date">
                            {r.date ? new Date(r.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                          </span>
                        </div>
                        <StarRating rating={r.rating} size="sm" />
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pd-related">
            <h2 className="related-title">Benzer Ürünler</h2>
            <div className="pd-related-grid">
              {related.map(p => (
                <div key={p.id} className="product-card" onClick={() => onNavigate('product', { productId: p.id })}>
                  {p.discountPercentage > 1 && <span className="badge-hot">%{Math.round(p.discountPercentage)} İndirim</span>}
                  <div className="product-img-area">
                    <RelatedImg product={p} />
                  </div>
                  <p className="product-name">{p.title}</p>
                  <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                    <span style={{ color:'#F59E0B', fontSize:'0.82rem' }}>★</span>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{p.rating?.toFixed(1)}</span>
                  </div>
                  <p className="product-price"><strong>{formatTL(p.price)}</strong> TL</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

function RelatedImg({ product }) {
  const [err, setErr] = useState(false)
  return err
    ? <span style={{ fontSize: '3rem' }}>📦</span>
    : <img src={product.thumbnail} alt={product.title} className="product-api-img" onError={() => setErr(true)} />
}
