import { useEffect, useRef, useState } from 'react'
import { useCart, useAuth } from '../../store/AppContext'
import './ChatWidget.css'

const CHAT_KEY = 'ergun-chat'
const CHAT_TTL = 10 * 60 * 1000

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

const CATEGORY_KEYWORDS = {
  smartphones: ['telefon', 'akıllı telefon', 'smartphone', 'iphone', 'samsung', 'android'],
  laptops: ['laptop', 'dizüstü', 'bilgisayar', 'notebook', 'macbook'],
  tablets: ['tablet', 'ipad', 'tab'],
  'mobile-accessories': ['aksesuar', 'kılıf', 'şarj', 'powerbank', 'kulaklık', 'kablo'],
  'mens-watches': ['erkek saat', 'saat', 'watch', 'kol saati'],
  'womens-watches': ['kadın saat', 'bayan saat'],
  'sports-accessories': ['spor', 'fitness', 'koşu', 'bisiklet', 'outdoor'],
  'home-decoration': ['dekorasyon', 'ev', 'dekor', 'akıllı ev', 'aydınlatma'],
  vehicle: ['araç', 'araba', 'otomobil', 'gps', 'oto'],
  'kitchen-accessories': ['mutfak', 'tencere', 'pişirme'],
  sunglasses: ['gözlük', 'güneş gözlüğü', 'güneş'],
  fragrances: ['parfüm', 'koku', 'kolonya'],
  beauty: ['güzellik', 'makyaj', 'kozmetik'],
  'skin-care': ['cilt', 'bakım', 'krem', 'losyon', 'serum'],
  'mens-shirts': ['gömlek', 'erkek gömlek', 'erkek giyim'],
  'mens-shoes': ['erkek ayakkabı', 'ayakkabı', 'bot', 'sneaker'],
  'womens-shoes': ['kadın ayakkabı', 'bayan ayakkabı', 'topuklu'],
  'womens-bags': ['çanta', 'kadın çanta', 'el çantası'],
  'womens-dresses': ['elbise', 'kadın elbise', 'etek'],
  'womens-jewellery': ['takı', 'kolye', 'bilezik', 'yüzük', 'küpe'],
  furniture: ['mobilya', 'koltuk', 'masa', 'sandalye', 'yatak'],
  groceries: ['market', 'gıda', 'yiyecek', 'içecek'],
  tops: ['tişört', 't-shirt', 'bluz', 'kazak', 'sweatshirt'],
  motorcycle: ['motosiklet', 'motor', 'moto'],
}

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

const GENERAL_REPLIES = [
  {
    keywords: ['merhaba', 'selam', 'hey', 'nasılsın', 'nasilsin', 'iyi misin'],
    text: 'Merhaba! 😊 Hangi ürünü arıyorsun? Ürün adı veya kategori yazarak arama yapabilirsin.',
  },
  {
    keywords: ['teşekkür', 'tesekkur', 'sağ ol', 'eyvallah', 'tamam', 'harika'],
    text: 'Rica ederim! Başka bir konuda yardımcı olabilir miyim? 🙂',
  },
  {
    keywords: ['en ucuz', 'ucuz', 'uygun fiyat', 'bütçe', 'ekonomik'],
    getResponse: (products) => {
      const cheap = [...products].sort((a, b) => a.price - b.price).slice(0, 3)
      return { type: 'product-list', text: 'En uygun fiyatlı ürünlerimizden bazıları:', products: cheap, footer: 'Hangisini göstereyim?' }
    },
  },
  {
    keywords: ['en iyi', 'en yüksek puan', 'kaliteli', 'popüler', 'trend'],
    getResponse: (products) => {
      const top = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3)
      return { type: 'product-list', text: 'En yüksek puanlı ürünlerimiz:', products: top, footer: 'Hangisini göstereyim?' }
    },
  },
  {
    keywords: ['indirim', 'kampanya', 'fırsat', 'indirimli'],
    getResponse: (products) => {
      const discounted = [...products]
        .filter(p => p.discountPercentage > 5)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 3)
      if (!discounted.length) return { type: 'text', text: 'Şu an aktif kampanyamız yok, yakında ekleyeceğiz!' }
      return { type: 'product-list', text: 'En yüksek indirimliler:', products: discounted, footer: 'Hangisini göstereyim?' }
    },
  },
  {
    keywords: ['ne var', 'ürünler', 'neler var', 'kategoriler', 'kategori'],
    getText: (products) => {
      const cats = [...new Set(products.map(p => p.category))]
      return `Şu an şu kategorilerimiz mevcut:\n${cats.map(c => `${CATEGORY_ICONS[c] || '📦'} ${CATEGORY_TR[c] || c}`).join('\n')}\nHangisini merak ediyorsun?`
    },
  },
]

const INTENT_CHEAP = ['en ucuz', 'ucuz', 'uygun fiyat', 'bütçe', 'ekonomik']
const INTENT_BEST  = ['en iyi', 'en yüksek puan', 'kaliteli', 'popüler', 'trend']
const INTENT_SALE  = ['indirim', 'kampanya', 'fırsat', 'indirimli']

function detectCategory(lower) {
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return slug
  }
  return null
}

function getBotResponse(text, products, catProducts = []) {
  const lower = text.toLowerCase()
  const matchedSlug = detectCategory(lower)
  const resolvedCat = catProducts.length > 0 ? catProducts : (matchedSlug ? products.filter(p => p.category === matchedSlug) : [])

  // 1. Kategori + intent kombinasyonu
  if (matchedSlug && resolvedCat.length > 0) {
    const catName = `${CATEGORY_ICONS[matchedSlug] || '📦'} ${CATEGORY_TR[matchedSlug]}`

    if (INTENT_CHEAP.some(kw => lower.includes(kw))) {
      const sorted = [...resolvedCat].sort((a, b) => a.price - b.price).slice(0, 3)
      return { type: 'product-list', text: `${catName} kategorisinde en uygun fiyatlılar:`, products: sorted, footer: 'Hangisini göstereyim?' }
    }
    if (INTENT_BEST.some(kw => lower.includes(kw))) {
      const sorted = [...resolvedCat].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 3)
      return { type: 'product-list', text: `${catName} kategorisinde en yüksek puanlılar:`, products: sorted, footer: 'Hangisini göstereyim?' }
    }
    if (INTENT_SALE.some(kw => lower.includes(kw))) {
      const sorted = [...resolvedCat].filter(p => p.discountPercentage > 5).sort((a, b) => b.discountPercentage - a.discountPercentage).slice(0, 3)
      if (!sorted.length) return { type: 'text', text: `${catName} kategorisinde şu an aktif kampanya yok.` }
      return { type: 'product-list', text: `${catName} kategorisinde en yüksek indirimler:`, products: sorted, footer: 'Hangisini göstereyim?' }
    }

    // Sadece kategori, intent yok → en iyi ürünü öner
    const best = [...resolvedCat].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]
    return { type: 'product', text: `${catName} kategorisinden önerim 👇`, product: best }
  }

  // 2. Kategori yok → genel intent kontrolü
  for (const entry of GENERAL_REPLIES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      if (entry.getResponse) return entry.getResponse(products)
      return { type: 'text', text: entry.getText ? entry.getText(products) : entry.text }
    }
  }

  // 3. Ürün adı / marka eşleşmesi
  if (products.length > 0) {
    const words = lower.split(/\s+/).filter(w => w.length > 2)
    const match = products.find(p => {
      const title = p.title.toLowerCase()
      const brand = (p.brand || '').toLowerCase()
      const catTR = (CATEGORY_TR[p.category] || '').toLowerCase()
      return words.some(w => title.includes(w) || brand.includes(w) || catTR.includes(w) || p.category.includes(w))
    })
    if (match) return { type: 'product', text: 'Tabii! İşte aradığın ürün 👇', product: match }
  }

  return {
    type: 'text',
    text: 'Üzgünüm, tam olarak anlayamadım 🤔\nÜrün adı, marka veya kategori yazarak arama yapabilirsin.\nÖrn: "laptop", "parfüm", "spor aksesuarı"',
  }
}

function loadChatMessages() {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    if (!raw) return null
    const { messages, expiresAt } = JSON.parse(raw)
    if (Date.now() > expiresAt) { localStorage.removeItem(CHAT_KEY); return null }
    return messages
  } catch { return null }
}

function saveChatMessages(messages) {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    const existing = raw ? JSON.parse(raw) : null
    const expiresAt = existing?.expiresAt ?? Date.now() + CHAT_TTL
    localStorage.setItem(CHAT_KEY, JSON.stringify({ messages, expiresAt }))
  } catch {}
}

const DEFAULT_MSG = { from: 'bot', type: 'text', text: 'Merhaba! Sana nasıl yardımcı olabilirim? 😊' }

export default function ChatWidget({ onProductClick }) {
  const { addToCart } = useCart()
  const { requireAuth } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => loadChatMessages() ?? [DEFAULT_MSG])
  const [input, setInput] = useState('')
  const [products, setProducts] = useState([])
  const [addedIds, setAddedIds] = useState(new Set())
  const endRef = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    saveChatMessages(messages)
  }, [messages])

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=100&select=id,title,price,thumbnail,rating,category,discountPercentage,brand')
      .then(r => r.json())
      .then(data => setProducts(data.products ?? []))
  }, [])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openChat', handler)
    return () => window.removeEventListener('openChat', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleChatAddToCart = (product, e) => {
    e.stopPropagation()
    requireAuth(() => {
      addToCart({
        id: product.id,
        name: product.title,
        price: formatTL(product.price),
        img: product.thumbnail,
        category: CATEGORY_TR[product.category] ?? product.category,
      })
      setAddedIds(prev => new Set([...prev, product.id]))
      setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(product.id); return s }), 1800)
    })
  }

  const send = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    setMessages(prev => [...prev,
      { from: 'user', type: 'text', text: trimmed },
      { from: 'bot', type: 'typing', text: '...' },
    ])

    const slug = detectCategory(trimmed.toLowerCase())
    let catProducts = []
    if (slug) {
      try {
        const res = await fetch(`https://dummyjson.com/products/category/${slug}?limit=200&select=id,title,price,thumbnail,rating,category,discountPercentage,brand`)
        const data = await res.json()
        catProducts = data.products ?? []
      } catch {}
    }

    const response = getBotResponse(trimmed, products, catProducts)
    setMessages(prev => [...prev.filter(m => m.type !== 'typing'), { from: 'bot', ...response }])
  }

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Sohbeti aç">
          🤖
        </button>
      )}

      {open && (
        <div className="chat-widget" ref={widgetRef}>
          <div className="chat-widget-header">
            <span>🤖 Ergün AI</span>
            <button className="chat-widget-close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chat-widget-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-widget-row ${msg.from}`}>
                {msg.from === 'bot' && <span className="chat-widget-avatar">🤖</span>}
                <div className={`chat-widget-bubble${msg.type === 'typing' ? ' typing' : ''}`}>
                  <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  {msg.type === 'product' && msg.product && (
                    <div className="chat-product-card">
                      <div
                        className="chat-product-top"
                        onClick={() => { onProductClick(msg.product.id); setOpen(false) }}
                      >
                        <div className="chat-product-img">
                          <img
                            src={msg.product.thumbnail}
                            alt={msg.product.title}
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        </div>
                        <div className="chat-product-info">
                          <p className="chat-product-name">{msg.product.title}</p>
                          <p className="chat-product-tag">{CATEGORY_TR[msg.product.category] || msg.product.category}</p>
                          <p className="chat-product-price">{formatTL(msg.product.price)} TL</p>
                        </div>
                        <span className="chat-product-link">İncele →</span>
                      </div>
                      <button
                        className={`chat-cart-btn ${addedIds.has(msg.product.id) ? 'added' : ''}`}
                        onClick={(e) => handleChatAddToCart(msg.product, e)}
                      >
                        {addedIds.has(msg.product.id) ? '✓ Eklendi' : '🛒 Sepete Ekle'}
                      </button>
                    </div>
                  )}
                  {msg.type === 'product-list' && msg.products && (
                    <div className="chat-product-list">
                      {msg.products.map(product => (
                        <div
                          key={product.id}
                          className="chat-product-list-item"
                          onClick={() => { onProductClick(product.id); setOpen(false) }}
                        >
                          <img
                            className="chat-product-list-thumb"
                            src={product.thumbnail}
                            alt={product.title}
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <span className="chat-product-list-name">{product.title}</span>
                          <span className="chat-product-list-price">{formatTL(product.price)} TL</span>
                          <span className="chat-product-list-arrow">→</span>
                        </div>
                      ))}
                      {msg.footer && <p className="chat-product-list-footer">{msg.footer}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="chat-widget-input-area">
            <input
              className="chat-widget-input"
              placeholder="Mesajınızı yazın..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              autoFocus
            />
            <button className="chat-widget-send" onClick={send}>Gönder</button>
          </div>
        </div>
      )}
    </>
  )
}
