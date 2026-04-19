import { useMemo, useState, useEffect } from 'react'
import './CategoryPage.css'

const CATEGORY_TR = {
  smartphones: 'Akıllı Telefon', laptops: 'Laptop', tablets: 'Tablet',
  'mobile-accessories': 'Telefon Aksesuarları', 'mens-watches': 'Erkek Saat',
  'womens-watches': 'Kadın Saat', 'sports-accessories': 'Spor',
  'home-decoration': 'Ev & Dekor', vehicle: 'Araç',
  'kitchen-accessories': 'Mutfak', sunglasses: 'Güneş Gözlüğü', fragrances: 'Parfüm',
}

const CATEGORY_ICONS = {
  smartphones: '📱', laptops: '💻', tablets: '📟',
  'mobile-accessories': '🔌', 'mens-watches': '⌚', 'womens-watches': '⌚',
  'sports-accessories': '⚽', 'home-decoration': '🏠', vehicle: '🚗',
  'kitchen-accessories': '🍳', sunglasses: '🕶️', fragrances: '🌸',
}

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

const COLOR_FILTERS = [
  { label: 'Siyah',   hex: '#1a1a1a', words: ['black', 'siyah', 'noir', 'dark'] },
  { label: 'Beyaz',   hex: '#f0f0f0', words: ['white', 'beyaz', 'blanc', 'ivory', 'cream'] },
  { label: 'Kırmızı', hex: '#e53e3e', words: ['red', 'kırmızı', 'rouge', 'crimson', 'scarlet'] },
  { label: 'Mavi',    hex: '#3182ce', words: ['blue', 'mavi', 'bleu', 'navy', 'azure', 'indigo'] },
  { label: 'Yeşil',   hex: '#38a169', words: ['green', 'yeşil', 'vert', 'olive', 'emerald', 'mint'] },
  { label: 'Sarı',    hex: '#d69e2e', words: ['yellow', 'sarı', 'gold', 'jaune', 'amber'] },
  { label: 'Gümüş',  hex: '#a0aec0', words: ['silver', 'gümüş', 'grey', 'gray', 'platinum'] },
  { label: 'Kahve',   hex: '#8b4513', words: ['brown', 'kahve', 'tan', 'bronze', 'beige', 'camel'] },
]

const SORT_OPTIONS = [
  { value: 'default',      label: 'Varsayılan' },
  { value: 'price-asc',    label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc',   label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating-desc',  label: 'En Yüksek Puan' },
  { value: 'discount-desc',label: 'En Yüksek İndirim' },
]

function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false)
  const discount = product.discountPercentage > 1 ? Math.round(product.discountPercentage) : null

  return (
    <div className="cat-product-card" onClick={() => onClick(product.id)}>
      {discount && <span className="cat-discount-badge">%{discount} İndirim</span>}
      <div className="cat-img-area">
        {imgError
          ? <span className="cat-product-emoji">📦</span>
          : <img src={product.thumbnail} alt={product.title} className="cat-api-img" onError={() => setImgError(true)} />
        }
      </div>
      <div className="cat-product-info">
        <p className="cat-product-tag">{product.brand ?? CATEGORY_TR[product.category] ?? product.category}</p>
        <p className="cat-product-name">{product.title}</p>
        <div className="cat-product-rating">
          <span className="cat-star">★</span>
          <span>{product.rating?.toFixed(1)}</span>
          <span className="cat-review-count">({product.reviews?.length ?? 0} yorum)</span>
        </div>
        <p className="cat-product-price"><strong>{formatTL(product.price)}</strong> TL</p>
      </div>
    </div>
  )
}

export default function CategoryPage({ category, onBack, onProductClick }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('default')
  const [filterBrands, setFilterBrands] = useState([])
  const [filterRating, setFilterRating] = useState(0)
  const [filterColors, setFilterColors] = useState([])

  useEffect(() => {
    setLoading(true)
    setFilterBrands([])
    setFilterRating(0)
    setFilterColors([])
    setSortBy('default')
    fetch(`https://dummyjson.com/products/category/${category}?limit=30&select=id,title,price,thumbnail,rating,discountPercentage,brand,category,reviews`)
      .then(r => r.json())
      .then(data => setProducts(data.products ?? []))
      .finally(() => setLoading(false))
  }, [category])

  const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products])

  const displayProducts = useMemo(() => {
    let result = [...products]

    if (filterBrands.length > 0) {
      result = result.filter(p => filterBrands.includes(p.brand))
    }
    if (filterRating > 0) {
      result = result.filter(p => (p.rating ?? 0) >= filterRating)
    }
    if (filterColors.length > 0) {
      result = result.filter(p => {
        const t = p.title.toLowerCase()
        return filterColors.some(label => {
          const entry = COLOR_FILTERS.find(c => c.label === label)
          return entry?.words.some(w => t.includes(w))
        })
      })
    }

    switch (sortBy) {
      case 'price-asc':     result.sort((a, b) => a.price - b.price); break
      case 'price-desc':    result.sort((a, b) => b.price - a.price); break
      case 'rating-desc':   result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break
      case 'discount-desc': result.sort((a, b) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0)); break
    }

    return result
  }, [products, filterBrands, filterRating, filterColors, sortBy])

  const toggleBrand = (brand) =>
    setFilterBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])

  const toggleColor = (label) =>
    setFilterColors(prev => prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label])

  const clearAll = () => { setFilterBrands([]); setFilterRating(0); setFilterColors([]); setSortBy('default') }

  const hasFilters = filterBrands.length > 0 || filterRating > 0 || filterColors.length > 0 || sortBy !== 'default'

  const title = CATEGORY_TR[category] ?? category
  const icon = CATEGORY_ICONS[category] ?? '📦'

  return (
    <main className="cat-page">
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="bc-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bc-sep">›</span>
          <span className="bc-current">{title}</span>
        </div>
      </div>

      <div className="cat-container">
        <div className="cat-page-header">
          <span className="cat-page-icon">{icon}</span>
          <div>
            <h1 className="cat-page-title">{title}</h1>
            {!loading && (
              <p className="cat-page-subtitle">
                {displayProducts.length} ürün
                {hasFilters && ` (${products.length} içinde filtrelendi)`}
              </p>
            )}
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className="cat-filters-bar">
            {/* Sıralama */}
            <div className="cat-filter-group">
              <span className="cat-filter-label">Sırala</span>
              <select
                className="cat-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="cat-filter-divider" />

            {/* Puan filtresi */}
            <div className="cat-filter-group">
              <span className="cat-filter-label">Değerlendirme</span>
              <div className="cat-rating-options">
                {[4, 3, 2].map(r => (
                  <button
                    key={r}
                    className={`cat-rating-btn ${filterRating === r ? 'active' : ''}`}
                    onClick={() => setFilterRating(prev => prev === r ? 0 : r)}
                  >
                    {'★'.repeat(r)} {r}+
                  </button>
                ))}
              </div>
            </div>

            <div className="cat-filter-divider" />

            {/* Renk filtresi */}
            <div className="cat-filter-group">
              <span className="cat-filter-label">Renk</span>
              <div className="cat-color-options">
                {COLOR_FILTERS.map(c => (
                  <button
                    key={c.label}
                    className={`cat-color-btn ${filterColors.includes(c.label) ? 'active' : ''}`}
                    title={c.label}
                    onClick={() => toggleColor(c.label)}
                    style={{ '--swatch': c.hex }}
                  >
                    <span className="cat-color-swatch" />
                    <span className="cat-color-name">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {brands.length > 0 && (
              <>
                <div className="cat-filter-divider" />
                {/* Marka filtresi */}
                <div className="cat-filter-group cat-filter-group--brands">
                  <span className="cat-filter-label">Marka</span>
                  <div className="cat-brand-options">
                    {brands.map(b => (
                      <button
                        key={b}
                        className={`cat-brand-btn ${filterBrands.includes(b) ? 'active' : ''}`}
                        onClick={() => toggleBrand(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {hasFilters && (
              <button className="cat-clear-btn" onClick={clearAll}>
                Filtreleri Temizle ×
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="cat-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="cat-skeleton" />)}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="cat-empty">
            <div className="cat-empty-icon">🔍</div>
            <h2>{hasFilters ? 'Filtreye uyan ürün bulunamadı' : 'Bu kategoride henüz ürün yok'}</h2>
            {hasFilters
              ? <button className="btn-outline" onClick={clearAll}>Filtreleri Temizle</button>
              : <button className="btn-outline" onClick={onBack}>Ana Sayfaya Dön</button>
            }
          </div>
        ) : (
          <div className="cat-grid">
            {displayProducts.map(p => (
              <ProductCard key={p.id} product={p} onClick={onProductClick} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
