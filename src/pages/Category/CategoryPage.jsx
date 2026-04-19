import { useState, useEffect } from 'react'
import './CategoryPage.css'

const CATEGORY_TR = {
  smartphones: 'Akıllı Telefon',
  laptops: 'Laptop',
  tablets: 'Tablet',
  'mobile-accessories': 'Telefon Aksesuarları',
  'mens-watches': 'Erkek Saat',
  'womens-watches': 'Kadın Saat',
  'sports-accessories': 'Spor',
  'home-decoration': 'Ev & Dekor',
  vehicle: 'Araç',
  'kitchen-accessories': 'Mutfak',
  sunglasses: 'Güneş Gözlüğü',
  fragrances: 'Parfüm',
}

const CATEGORY_ICONS = {
  smartphones: '📱', laptops: '💻', tablets: '📟',
  'mobile-accessories': '🔌', 'mens-watches': '⌚', 'womens-watches': '⌚',
  'sports-accessories': '⚽', 'home-decoration': '🏠', vehicle: '🚗',
  'kitchen-accessories': '🍳', sunglasses: '🕶️', fragrances: '🌸',
}

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

function ProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false)
  const discount = product.discountPercentage > 1 ? Math.round(product.discountPercentage) : null

  return (
    <div className="cat-product-card" onClick={() => onClick(product.id)}>
      {discount && <span className="cat-discount-badge">%{discount} İndirim</span>}
      <div className="cat-img-area">
        {imgError
          ? <span className="cat-product-emoji">📦</span>
          : <img
              src={product.thumbnail}
              alt={product.title}
              className="cat-api-img"
              onError={() => setImgError(true)}
            />
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

  useEffect(() => {
    setLoading(true)
    fetch(`https://dummyjson.com/products/category/${category}?limit=30&select=id,title,price,thumbnail,rating,discountPercentage,brand,category,reviews`)
      .then(r => r.json())
      .then(data => setProducts(data.products ?? []))
      .finally(() => setLoading(false))
  }, [category])

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
            {!loading && <p className="cat-page-subtitle">{products.length} ürün</p>}
          </div>
        </div>

        {loading ? (
          <div className="cat-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="cat-skeleton" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="cat-empty">
            <div className="cat-empty-icon">📦</div>
            <h2>Bu kategoride henüz ürün yok</h2>
            <button className="btn-outline" onClick={onBack}>Ana Sayfaya Dön</button>
          </div>
        ) : (
          <div className="cat-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onClick={onProductClick} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
