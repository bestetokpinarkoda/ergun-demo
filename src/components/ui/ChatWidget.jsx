import { useEffect, useRef, useState } from 'react'
import './ChatWidget.css'

const CHAT_KEY = 'ergun-chat'
const CHAT_TTL = 60 * 60 * 1000

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

const formatTL = (usd) => Math.round(usd * 5).toLocaleString('tr-TR')

const GENERAL_REPLIES = [
  {
    keywords: ['merhaba', 'selam', 'hey', 'nasılsın', 'nasilsin'],
    text: 'Merhaba! 😊 Hangi ürünü arıyorsun? Ürün adı veya kategori yazarak arama yapabilirsin.',
  },
  {
    keywords: ['teşekkür', 'tesekkur', 'sağ ol', 'eyvallah'],
    text: 'Rica ederim! Başka bir konuda yardımcı olabilir miyim? 🙂',
  },
  {
    keywords: ['en ucuz', 'ucuz', 'uygun fiyat', 'fiyat'],
    getText: (products) => {
      const cheap = [...products].sort((a, b) => a.price - b.price).slice(0, 3)
      return `En uygun fiyatlı ürünlerimizden bazıları:\n${cheap.map(p => `• ${p.title} — ${formatTL(p.price)} TL`).join('\n')}\nHangisini göstereyim?`
    },
  },
  {
    keywords: ['ne var', 'ürünler', 'neler var', 'kategoriler'],
    getText: (products) => {
      const cats = [...new Set(products.map(p => p.category))].slice(0, 8)
      return `Şu an şu kategorilerimiz mevcut:\n${cats.map(c => `${CATEGORY_ICONS[c] || '📦'} ${CATEGORY_TR[c] || c}`).join('\n')}\nHangisini merak ediyorsun?`
    },
  },
]

function getBotResponse(text, products) {
  const lower = text.toLowerCase()
  for (const entry of GENERAL_REPLIES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { type: 'text', text: entry.getText ? entry.getText(products) : entry.text }
    }
  }
  if (products.length > 0) {
    const words = lower.split(/\s+/).filter(w => w.length > 2)
    const match = products.find(p => {
      const title = p.title.toLowerCase()
      const catTR = (CATEGORY_TR[p.category] || '').toLowerCase()
      return words.some(w => title.includes(w) || catTR.includes(w) || p.category.includes(w))
    })
    if (match) return { type: 'product', text: 'Tabii! İşte aradığın ürün 👇', product: match }
  }
  return {
    type: 'text',
    text: 'Üzgünüm, tam olarak anlayamadım 🤔 Ürün adı veya kategori (örn: "laptop", "telefon", "saat") yazarak arama yapabilirsin.',
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
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => loadChatMessages() ?? [DEFAULT_MSG])
  const [input, setInput] = useState('')
  const [products, setProducts] = useState([])
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

  const send = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages(prev => [...prev,
      { from: 'user', type: 'text', text: trimmed },
      { from: 'bot', ...getBotResponse(trimmed, products) },
    ])
    setInput('')
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
                <div className="chat-widget-bubble">
                  <span style={{ whiteSpace: 'pre-line' }}>{msg.text}</span>
                  {msg.type === 'product' && msg.product && (
                    <div
                      className="chat-product-card"
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
