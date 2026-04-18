import { useState } from 'react'
import { useAuth } from '../../store/AppContext'
import { useFav } from '../../store/AppContext'
import { useCart } from '../../store/AppContext'
import './FavoritesPage.css'

function FavCard({ item, onRemove, onAddToCart, addedId }) {
  const [imgErr, setImgErr] = useState(false)
  const isAdded = addedId === item.id

  return (
    <div className="fav-card">
      <button className="fav-remove-btn" onClick={() => onRemove(item)} aria-label="Favorilerden çıkar">
        ♥
      </button>
      <div className="fav-img-area">
        {imgErr
          ? <span className="fav-img-fallback">📦</span>
          : <img
              src={item.img}
              alt={item.name}
              className="fav-img"
              onError={() => setImgErr(true)}
            />
        }
      </div>
      <div className="fav-info">
        <p className="fav-category">{item.category}</p>
        <p className="fav-name">{item.name}</p>
        <p className="fav-price"><strong>{item.price}</strong> TL</p>
      </div>
      <button
        className={`fav-cart-btn ${isAdded ? 'added' : ''}`}
        onClick={() => onAddToCart(item)}
      >
        {isAdded ? '✓ Eklendi' : '🛒 Sepete Ekle'}
      </button>
    </div>
  )
}

export default function FavoritesPage({ onBack }) {
  const { user, openLoginModal, requireAuth } = useAuth()
  const { favItems, toggleFavorite } = useFav()
  const { addToCart } = useCart()
  const [addedId, setAddedId] = useState(null)
  const [allAdded, setAllAdded] = useState(false)

  const handleAddToCart = (item) => {
    requireAuth(() => {
      addToCart(item, 1)
      setAddedId(item.id)
      setTimeout(() => setAddedId(null), 2000)
    })
  }

  const handleAddAll = () => {
    requireAuth(() => {
      favItems.forEach(item => addToCart(item, 1))
      setAllAdded(true)
      setTimeout(() => setAllAdded(false), 2500)
    })
  }

  return (
    <main className="fav-page">
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="bc-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bc-sep">›</span>
          <span className="bc-current">Favorilerim</span>
        </div>
      </div>

      <div className="fav-container">
        <div className="fav-header">
          <div>
            <h1 className="fav-title">Favorilerim</h1>
            <p className="fav-subtitle">{favItems.length} ürün</p>
          </div>
          {favItems.length > 0 && (
            <button className={`fav-add-all-btn ${allAdded ? 'added' : ''}`} onClick={handleAddAll}>
              {allAdded ? '✓ Hepsi Eklendi!' : '🛒 Tümünü Sepete Ekle'}
            </button>
          )}
        </div>

        {!user ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">🔐</div>
            <h2>Favorilerinizi görmek için giriş yapın</h2>
            <p>Beğendiğiniz ürünleri favorilere ekleyip sonra kolayca bulabilirsiniz.</p>
            <button className="fav-login-btn" onClick={openLoginModal}>Giriş Yap</button>
          </div>
        ) : favItems.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">🤍</div>
            <h2>Henüz favori ürün eklemediniz</h2>
            <p>Ürün sayfalarındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</p>
            <button className="btn-outline" onClick={onBack}>Alışverişe Başla</button>
          </div>
        ) : (
          <div className="fav-grid">
            {favItems.map(item => (
              <FavCard
                key={item.id}
                item={item}
                onRemove={toggleFavorite}
                onAddToCart={handleAddToCart}
                addedId={addedId}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
