import { useState, useEffect, useRef } from 'react'
import Logo from '../ui/Logo'
import { useAuth } from '../../store/AppContext'
import { useCart, useFav } from '../../store/AppContext'
import './Header.css'

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

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
  beauty: 'Güzellik',
  'skin-care': 'Cilt Bakımı',
  'mens-shirts': 'Erkek Gömlek',
  'mens-shoes': 'Erkek Ayakkabı',
  'womens-shoes': 'Kadın Ayakkabı',
  'womens-bags': 'Kadın Çanta',
  'womens-dresses': 'Elbise',
  'womens-jewellery': 'Takı',
  furniture: 'Mobilya',
  groceries: 'Market',
  tops: 'Üst Giyim',
  motorcycle: 'Motosiklet',
}

const FEATURED_SLUGS = [
  'home-decoration', 'smartphones', 'laptops', 'sports-accessories',
  'mobile-accessories', 'tablets', 'groceries',
]

const OTHER_CATEGORIES = [
  { slug: 'womens-watches', label: 'Kadın Saat', icon: '⌚' },
  { slug: 'kitchen-accessories', label: 'Mutfak', icon: '🍳' },
  { slug: 'sunglasses', label: 'Güneş Gözlüğü', icon: '🕶️' },
  { slug: 'fragrances', label: 'Parfüm', icon: '🌸' },
  { slug: 'beauty', label: 'Güzellik', icon: '💄' },
  { slug: 'skin-care', label: 'Cilt Bakımı', icon: '✨' },
  { slug: 'mens-shirts', label: 'Erkek Gömlek', icon: '👔' },
  { slug: 'mens-shoes', label: 'Erkek Ayakkabı', icon: '👟' },
  { slug: 'womens-shoes', label: 'Kadın Ayakkabı', icon: '👠' },
  { slug: 'womens-bags', label: 'Kadın Çanta', icon: '👜' },
  { slug: 'womens-dresses', label: 'Elbise', icon: '👗' },
  { slug: 'womens-jewellery', label: 'Takı', icon: '💍' },
  { slug: 'furniture', label: 'Mobilya', icon: '🛋️' },
  { slug: 'groceries', label: 'Market', icon: '🛒' },
  { slug: 'tops', label: 'Üst Giyim', icon: '👕' },
  { slug: 'motorcycle', label: 'Motosiklet', icon: '🏍️' },
]

const MEGA_MENU_DATA = [
  {
    slug: 'smartphones', label: 'Akıllı Telefon', icon: '📱',
    groups: [
      { title: 'Marka', items: ['Apple iPhone', 'Samsung Galaxy', 'Xiaomi', 'OnePlus', 'Huawei', 'OPPO'] },
      { title: 'Özellikler', items: ['5G Destekli', 'Katlanabilir Ekran', 'Gaming Telefon', '108MP Kamera', 'Büyük Pil'] },
    ],
  },
  {
    slug: 'laptops', label: 'Laptop', icon: '💻',
    groups: [
      { title: 'Tür', items: ['Gaming Laptop', 'Ultrabook', 'İş Laptopu', '2-in-1 Laptop', 'Chromebook'] },
      { title: 'Marka', items: ['Apple MacBook', 'Dell', 'HP', 'Lenovo', 'ASUS', 'MSI'] },
    ],
  },
  {
    slug: 'tablets', label: 'Tablet', icon: '📟',
    groups: [
      { title: 'Marka', items: ['Apple iPad', 'Samsung Galaxy Tab', 'Huawei MatePad', 'Lenovo Tab', 'Amazon Fire'] },
      { title: 'Kullanım', items: ['Çizim Tableti', 'Eğitim Tableti', 'Oyun Tableti', 'E-Kitap Okuyucu'] },
    ],
  },
  {
    slug: 'mobile-accessories', label: 'Telefon Aksesuarları', icon: '🔌',
    groups: [
      { title: 'Ürün Tipi', items: ['Telefon Kılıfı', 'Ekran Koruyucu', 'Şarj Kablosu', 'Powerbank', 'Kablosuz Şarj'] },
      { title: 'Uyumluluk', items: ['iPhone Aksesuarları', 'Samsung Aksesuarları', 'Xiaomi Aksesuarları', 'Universal'] },
    ],
  },
  {
    slug: 'mens-watches', label: 'Saat', icon: '⌚',
    groups: [
      { title: 'Tür', items: ['Akıllı Saat', 'Spor Saati', 'Klasik Saat', 'Kronograf', 'Dijital Saat'] },
      { title: 'Marka', items: ['Apple Watch', 'Samsung Galaxy Watch', 'Garmin', 'Fitbit', 'Casio'] },
    ],
  },
  {
    slug: 'sports-accessories', label: 'Spor', icon: '⚽',
    groups: [
      { title: 'Kategori', items: ['Fitness', 'Outdoor', 'Su Sporları', 'Bisiklet', 'Koşu'] },
      { title: 'Ürün', items: ['Spor Bilekliği', 'Nabız Ölçer', 'Aksiyon Kamera', 'GPS Tracker', 'Su Şişesi'] },
    ],
  },
  {
    slug: 'home-decoration', label: 'Ev & Dekor', icon: '🏠',
    groups: [
      { title: 'Kategori', items: ['Aydınlatma', 'Dekorasyon', 'Mutfak', 'Banyo', 'Yatak Odası'] },
      { title: 'Akıllı Ev', items: ['Akıllı Ampul', 'Robot Süpürge', 'Akıllı Priz', 'Güvenlik Kamerası', 'Kapı Zili'] },
    ],
  },
  {
    slug: 'vehicle', label: 'Araç', icon: '🚗',
    groups: [
      { title: 'Ürün Tipi', items: ['Araç İçi Tutucu', 'Araç Şarj Cihazı', 'Dash Kamera', 'GPS Navigasyon', 'Araç Hoparlörü'] },
      { title: 'Teknoloji', items: ['Araç İçi Ekran', 'Bluetooth Kiti', 'OBD-II Scanner', 'Park Sensörü', 'Geri Görüş Kamerası'] },
    ],
  },
]

export default function Header({ onLoginClick, onAdminClick, onProfileClick, onHomeClick, onFavClick, onCartClick, onCategoryClick, onProductClick, onBecomeSupplierClick }) {
  const { user, profile, role, openLoginModal } = useAuth()
  const { cartCount } = useCart()
  const { favCount } = useFav()

  // Search
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef(null)
  const searchWrapperRef = useRef(null)

  // Category nav
  const [categories, setCategories] = useState(FEATURED_SLUGS)

  // Mega menu
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState(MEGA_MENU_DATA[0].slug)
  const megaRef = useRef(null)


  useEffect(() => {
    const q = search.trim()
    if (q.length < 2) { setSearchResults([]); setShowDropdown(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchLoading(true)
      fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(q)}&limit=6&select=id,title,price,thumbnail`)
        .then(r => r.json())
        .then(data => { setSearchResults(data.products ?? []); setShowDropdown(true) })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  useEffect(() => {
    const handleClick = (e) => {
      if (!searchWrapperRef.current?.contains(e.target)) setShowDropdown(false)
      if (!megaRef.current?.contains(e.target)) setMegaOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleResultClick = (id) => {
    setShowDropdown(false)
    setSearch('')
    onProductClick(id)
  }

  const handleMegaCategoryClick = (slug) => {
    setMegaOpen(false)
    onCategoryClick(slug)
  }

  const activeMenuData = MEGA_MENU_DATA.find(c => c.slug === activeGroup)

  return (
    <header className="header">
      <div className="header-main">
        <button className="logo-btn" onClick={onHomeClick} aria-label="Ana Sayfa">
          <Logo className="header-logo" />
        </button>

        <div className="search-wrapper" ref={searchWrapperRef}>
          <div className="header-search">
            <input
              className="search-input"
              type="text"
              placeholder="Ürün arayın..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
            />
            <button className="search-btn" aria-label="Ara">
              {searchLoading
                ? <span className="search-spinner" />
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
              }
            </button>
          </div>

          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(p => (
                <button key={p.id} className="search-result-item" onClick={() => handleResultClick(p.id)}>
                  <img src={p.thumbnail} alt={p.title} className="search-result-img" />
                  <div className="search-result-info">
                    <p className="search-result-name">{p.title}</p>
                    <p className="search-result-price">{formatTL(p.price)} TL</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="header-actions">
          {user && role === 'customer' ? (
            <button className="action-btn action-btn--become-supplier" onClick={onBecomeSupplierClick}>
              <span>Satıcı Ol</span>
            </button>
          ) : (
            <button className="action-btn" onClick={onAdminClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Panel</span>
            </button>
          )}

          <button className="action-btn" onClick={user ? onFavClick : openLoginModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Favoriler</span>
          </button>

          <button className="action-btn" onClick={user ? onCartClick : openLoginModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Sepetim</span>
            {cartCount > 0 && user && <span className="action-badge action-badge--cart">{cartCount}</span>}
          </button>

          {user ? (
            <button className="action-btn is-user-logged" onClick={onProfileClick}>
              <div className="action-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile?.full_name || 'Avatar'} referrerPolicy="no-referrer" />
                ) : (
                  profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'M'
                )}
              </div>
              <div className="action-user-info">
                <span className="user-greeting">Hoş Geldin,</span>
                <span className="user-name">{profile?.full_name?.split(' ')[0] || 'Müşteri'}</span>
              </div>
            </button>
          ) : (
            <button className="action-btn" onClick={onLoginClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Hesabım</span>
            </button>
          )}
        </nav>
      </div>

      {/* ── ROW 2: Cats + Hamburger ── */}
      <div className="header-cats-row" ref={megaRef}>
        <button
          className={`hamburger-btn ${megaOpen ? 'open' : ''}`}
          onClick={() => setMegaOpen(o => !o)}
          aria-label="Tüm Kategoriler"
        >
          <span className="hamburger-lines">
            <span /><span /><span />
          </span>
          <span className="hamburger-label">Kategoriler</span>
        </button>

        <nav className="header-cats">
          {categories.map(slug => (
            <button key={slug} className="cat-link" onClick={() => onCategoryClick(slug)}>
              {CATEGORY_TR[slug] ?? slug}
            </button>
          ))}
        </nav>

        {/* Mega Menu */}
        {megaOpen && (
          <div className="mega-menu">
            {/* Left sidebar */}
            <div className="mega-sidebar">
              {MEGA_MENU_DATA.map(cat => (
                <div
                  key={cat.slug}
                  className={`mega-cat-item ${activeGroup === cat.slug ? 'active' : ''}`}
                  onMouseEnter={() => setActiveGroup(cat.slug)}
                  onClick={() => handleMegaCategoryClick(cat.slug)}
                >
                  <span className="mega-cat-icon">{cat.icon}</span>
                  <span className="mega-cat-label">{cat.label}</span>
                  <svg className="mega-cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              ))}
              <div className="mega-sidebar-divider" />
              {OTHER_CATEGORIES.map(cat => (
                <div
                  key={cat.slug}
                  className="mega-cat-item mega-cat-simple"
                  onClick={() => handleMegaCategoryClick(cat.slug)}
                >
                  <span className="mega-cat-icon">{cat.icon}</span>
                  <span className="mega-cat-label">{cat.label}</span>
                </div>
              ))}
            </div>

            {/* Right content */}
            <div className="mega-content">
              {activeMenuData?.groups.map(group => (
                <div key={group.title} className="mega-group">
                  <button
                    className="mega-group-title"
                    onClick={() => handleMegaCategoryClick(activeMenuData.slug)}
                  >
                    {group.title} →
                  </button>
                  {group.items.map(item => (
                    <button
                      key={item}
                      className="mega-group-item"
                      onClick={() => handleMegaCategoryClick(activeMenuData.slug)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
