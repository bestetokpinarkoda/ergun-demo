import { useState } from 'react'
import { useAuth } from '../../store/AppContext'
import { useFav } from '../../store/AppContext'
import { useCart } from '../../store/AppContext'
import './ProfilePage.css'

const MOCK_ORDERS = [
  {
    id: '#ER2026-48291',
    date: '14 Nisan 2026',
    status: 'delivered',
    statusLabel: 'Teslim Edildi',
    items: [
      { name: 'Apple iPhone 15 Pro Max', qty: 1, price: '89.995' },
      { name: 'Kablosuz Şarj Standı', qty: 2, price: '1.250' },
    ],
    total: '92.495',
    cargo: 'Ücretsiz',
  },
  {
    id: '#ER2026-37104',
    date: '8 Nisan 2026',
    status: 'shipped',
    statusLabel: 'Kargoda',
    items: [
      { name: 'Samsung 65" 4K QLED TV', qty: 1, price: '67.490' },
    ],
    total: '67.490',
    cargo: 'Ücretsiz',
  },
  {
    id: '#ER2026-22817',
    date: '1 Nisan 2026',
    status: 'preparing',
    statusLabel: 'Hazırlanıyor',
    items: [
      { name: 'Logitech MX Keys Klavye', qty: 1, price: '5.490' },
      { name: 'Logitech MX Master 3S', qty: 1, price: '4.290' },
    ],
    total: '9.860',
    cargo: '79,90 TL',
  },
  {
    id: '#ER2026-11043',
    date: '15 Mart 2026',
    status: 'cancelled',
    statusLabel: 'İptal Edildi',
    items: [
      { name: 'Sony WH-1000XM5 Kulaklık', qty: 1, price: '12.990' },
    ],
    total: '12.990',
    cargo: 'Ücretsiz',
  },
]

const STATUS_COLORS = {
  delivered: { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
  shipped:   { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  preparing: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
}

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana',
  'Konya', 'Gaziantep', 'Mersin', 'Kocaeli', 'Diyarbakır',
  'Eskişehir', 'Samsun', 'Trabzon', 'Denizli', 'Kayseri',
]

function StatusBadge({ status, label }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.preparing
  return (
    <span className="order-status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="status-dot" style={{ background: s.dot }} />
      {label}
    </span>
  )
}

/* ── Hesabım Tab ── */
function AccountTab({ user, updateUser, favCount, cartCount, addressCount }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    birthdate: user.birthdate ?? '',
    gender: user.gender ?? '',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateUser(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCancel = () => {
    setEditing(false)
    setForm({ name: user.name ?? '', email: user.email ?? '', phone: user.phone ?? '', birthdate: user.birthdate ?? '', gender: user.gender ?? '' })
  }

  const field = (key, type = 'text', placeholder = '') => ({
    type,
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    placeholder,
    disabled: !editing,
    className: `prof-input${editing ? '' : ' readonly'}`,
  })

  return (
    <div className="prof-tab-content">
      <div className="prof-section-header">
        <h2 className="prof-section-title">Hesap Bilgilerim</h2>
        {!editing
          ? <button className="prof-edit-btn" onClick={() => setEditing(true)}>✏️ Düzenle</button>
          : (
            <div className="prof-edit-actions">
              <button className="prof-cancel-btn" onClick={handleCancel}>İptal</button>
              <button className="prof-save-btn" onClick={handleSave}>Kaydet</button>
            </div>
          )
        }
      </div>

      {saved && <div className="prof-success-bar">✓ Bilgileriniz başarıyla güncellendi!</div>}

      <div className="prof-avatar-section">
        <div className="prof-avatar-big">{user.name?.charAt(0).toUpperCase() ?? 'K'}</div>
        <div>
          <p className="prof-avatar-name">{user.name}</p>
          <p className="prof-avatar-email">{user.email}</p>
          <p className="prof-member-since">Üyelik: Nisan 2026</p>
        </div>
      </div>

      <div className="prof-form-grid">
        <label className="prof-field">
          <span className="prof-label">Ad Soyad</span>
          <input {...field('name', 'text', 'Ad Soyad')} />
        </label>
        <label className="prof-field">
          <span className="prof-label">E-posta</span>
          <input {...field('email', 'email', 'ornek@email.com')} />
        </label>
        <label className="prof-field">
          <span className="prof-label">Telefon</span>
          <input {...field('phone', 'tel', '5XX XXX XX XX')} />
        </label>
        <label className="prof-field">
          <span className="prof-label">Doğum Tarihi</span>
          <input {...field('birthdate', 'date')} />
        </label>
        <label className="prof-field">
          <span className="prof-label">Cinsiyet</span>
          <select
            className={`prof-input prof-select${editing ? '' : ' readonly'}`}
            value={form.gender}
            onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            disabled={!editing}
          >
            <option value="">Belirtmek istemiyorum</option>
            <option value="male">Erkek</option>
            <option value="female">Kadın</option>
          </select>
        </label>
      </div>

      <div className="prof-stats-row">
        <div className="prof-stat">
          <span className="prof-stat-val">{MOCK_ORDERS.length}</span>
          <span className="prof-stat-label">Sipariş</span>
        </div>
        <div className="prof-stat">
          <span className="prof-stat-val">{addressCount}</span>
          <span className="prof-stat-label">Adres</span>
        </div>
        <div className="prof-stat">
          <span className="prof-stat-val">{favCount}</span>
          <span className="prof-stat-label">Favori</span>
        </div>
        <div className="prof-stat">
          <span className="prof-stat-val">{cartCount}</span>
          <span className="prof-stat-label">Sepette</span>
        </div>
      </div>
    </div>
  )
}

/* ── Siparişlerim Tab ── */
function OrdersTab() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="prof-tab-content">
      <div className="prof-section-header">
        <h2 className="prof-section-title">Siparişlerim</h2>
        <span className="prof-order-count">{MOCK_ORDERS.length} sipariş</span>
      </div>

      <div className="orders-list">
        {MOCK_ORDERS.map(order => (
          <div key={order.id} className="order-card">
            <div
              className="order-card-header"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="order-meta">
                <span className="order-id">{order.id}</span>
                <span className="order-date">{order.date}</span>
              </div>
              <div className="order-right">
                <StatusBadge status={order.status} label={order.statusLabel} />
                <span className="order-total"><strong>{order.total}</strong> TL</span>
                <span className="order-chevron">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="order-card-body">
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span className="oi-name">{item.name}</span>
                      <span className="oi-qty">×{item.qty}</span>
                      <span className="oi-price">{item.price} TL</span>
                    </div>
                  ))}
                </div>
                <div className="order-summary-row">
                  <span>Kargo: {order.cargo}</span>
                  <span>Toplam: <strong>{order.total} TL</strong></span>
                </div>

                {order.status === 'shipped' && (
                  <div className="order-tracking">
                    <div className="track-steps-row">
                      {['Sipariş Alındı', 'Hazırlandı', 'Kargoya Verildi', 'Teslim Edildi'].map((s, i) => (
                        <div key={i} className={`mini-track ${i < 3 ? 'done' : ''}`}>
                          <div className="mini-track-dot" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="order-card-actions">
                  {order.status === 'delivered' && (
                    <button className="order-action-btn outline">Yorum Yaz</button>
                  )}
                  {order.status !== 'cancelled' && (
                    <button className="order-action-btn outline">Fatura İndir</button>
                  )}
                  {order.status === 'cancelled' && (
                    <span className="order-cancelled-note">Bu sipariş iptal edilmiştir.</span>
                  )}
                  <button className="order-action-btn primary">Tekrar Sipariş Ver</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Adres Modal ── */
function AddressModal({ addr, onSave, onClose }) {
  const [form, setForm] = useState(addr ?? {
    title: '', name: '', phone: '', city: '', district: '', neighborhood: '', fullAddress: '',
  })
  const [errors, setErrors] = useState({})

  const field = (key) => ({
    value: form[key],
    onChange: e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors(er => ({ ...er, [key]: '' }))
    },
    className: `prof-input${errors[key] ? ' has-error' : ''}`,
  })

  const handleSave = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Adres başlığı gerekli'
    if (!form.name.trim()) e.name = 'Ad soyad gerekli'
    if (!form.city) e.city = 'İl seçiniz'
    if (!form.district.trim()) e.district = 'İlçe gerekli'
    if (!form.fullAddress.trim()) e.fullAddress = 'Açık adres gerekli'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{addr ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="prof-form-grid">
            <label className="prof-field" style={{ gridColumn: '1/-1' }}>
              <span className="prof-label">Adres Başlığı *</span>
              <input type="text" placeholder="Ev, İş, Diğer..." {...field('title')} />
              {errors.title && <span className="prof-err">{errors.title}</span>}
            </label>
            <label className="prof-field">
              <span className="prof-label">Ad Soyad *</span>
              <input type="text" placeholder="Adınız Soyadınız" {...field('name')} />
              {errors.name && <span className="prof-err">{errors.name}</span>}
            </label>
            <label className="prof-field">
              <span className="prof-label">Telefon</span>
              <input type="tel" placeholder="5XX XXX XX XX" {...field('phone')} />
            </label>
            <label className="prof-field">
              <span className="prof-label">İl *</span>
              <select
                value={form.city}
                onChange={e => { setForm(f => ({ ...f, city: e.target.value })); if (errors.city) setErrors(er => ({ ...er, city: '' })) }}
                className={`prof-input prof-select${errors.city ? ' has-error' : ''}`}
              >
                <option value="">İl seçiniz</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <span className="prof-err">{errors.city}</span>}
            </label>
            <label className="prof-field">
              <span className="prof-label">İlçe *</span>
              <input type="text" placeholder="İlçe" {...field('district')} />
              {errors.district && <span className="prof-err">{errors.district}</span>}
            </label>
            <label className="prof-field">
              <span className="prof-label">Mahalle</span>
              <input type="text" placeholder="Mahalle / Köy" {...field('neighborhood')} />
            </label>
            <label className="prof-field" style={{ gridColumn: '1/-1' }}>
              <span className="prof-label">Açık Adres *</span>
              <textarea
                rows={3}
                placeholder="Cadde, sokak, bina no, daire no..."
                value={form.fullAddress}
                onChange={e => {
                  setForm(f => ({ ...f, fullAddress: e.target.value }))
                  if (errors.fullAddress) setErrors(er => ({ ...er, fullAddress: '' }))
                }}
                className={`prof-input prof-textarea${errors.fullAddress ? ' has-error' : ''}`}
              />
              {errors.fullAddress && <span className="prof-err">{errors.fullAddress}</span>}
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="prof-cancel-btn" onClick={onClose}>İptal</button>
          <button className="prof-save-btn" onClick={handleSave}>Kaydet</button>
        </div>
      </div>
    </div>
  )
}

/* ── Adreslerim Tab ── */
function AddressesTab({ addresses, addAddress, removeAddress, editAddress }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddr, setEditingAddr] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)

  const handleSave = (form) => {
    if (editingIndex !== null) editAddress(editingIndex, form)
    else addAddress(form)
    setModalOpen(false)
    setEditingAddr(null)
    setEditingIndex(null)
  }

  const openEdit = (addr, i) => {
    setEditingAddr(addr)
    setEditingIndex(i)
    setModalOpen(true)
  }

  return (
    <div className="prof-tab-content">
      <div className="prof-section-header">
        <h2 className="prof-section-title">Adreslerim</h2>
        <button className="prof-add-btn" onClick={() => { setEditingAddr(null); setEditingIndex(null); setModalOpen(true) }}>
          + Yeni Adres Ekle
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="prof-empty">
          <div className="prof-empty-icon">📍</div>
          <h3>Kayıtlı adresiniz yok</h3>
          <p>Teslimat adresinizi ekleyerek alışverişi hızlandırın.</p>
          <button className="prof-add-btn" style={{ marginTop: '0.5rem' }} onClick={() => setModalOpen(true)}>Adres Ekle</button>
        </div>
      ) : (
        <div className="addr-cards-grid">
          {addresses.map((addr, i) => (
            <div key={i} className="addr-card">
              <div className="addr-card-header">
                <span className="addr-card-title">📍 {addr.title}</span>
                <div className="addr-card-btns">
                  <button className="addr-action-btn" onClick={() => openEdit(addr, i)}>✏️</button>
                  <button className="addr-action-btn danger" onClick={() => removeAddress(i)}>🗑️</button>
                </div>
              </div>
              <p className="addr-card-name">{addr.name}</p>
              {addr.phone && <p className="addr-card-detail">{addr.phone}</p>}
              <p className="addr-card-detail">{addr.city} / {addr.district}</p>
              {addr.neighborhood && <p className="addr-card-detail">{addr.neighborhood}</p>}
              <p className="addr-card-full">{addr.fullAddress}</p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddressModal
          addr={editingAddr}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingAddr(null); setEditingIndex(null) }}
        />
      )}
    </div>
  )
}

/* ── Güvenlik Tab ── */
function SecurityTab() {
  const [form, setForm] = useState({ currentPw: '', newPw: '', confirmPw: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const field = (key, placeholder) => ({
    type: 'password',
    value: form[key],
    placeholder,
    className: `prof-input${errors[key] ? ' has-error' : ''}`,
    onChange: e => {
      setForm(f => ({ ...f, [key]: e.target.value }))
      if (errors[key]) setErrors(er => ({ ...er, [key]: '' }))
    },
  })

  const handleSave = () => {
    const e = {}
    if (!form.currentPw) e.currentPw = 'Mevcut şifrenizi girin'
    if (form.newPw.length < 6) e.newPw = 'Yeni şifre en az 6 karakter olmalı'
    if (form.newPw !== form.confirmPw) e.confirmPw = 'Şifreler eşleşmiyor'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSuccess(true)
    setForm({ currentPw: '', newPw: '', confirmPw: '' })
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="prof-tab-content">
      <div className="prof-section-header">
        <h2 className="prof-section-title">Güvenlik</h2>
      </div>

      {success && <div className="prof-success-bar">✓ Şifreniz başarıyla güncellendi!</div>}

      <div className="sec-section">
        <h3 className="sec-subtitle">Şifre Değiştir</h3>
        <div className="prof-form-grid single-col">
          <label className="prof-field">
            <span className="prof-label">Mevcut Şifre</span>
            <input {...field('currentPw', '••••••••')} />
            {errors.currentPw && <span className="prof-err">{errors.currentPw}</span>}
          </label>
          <label className="prof-field">
            <span className="prof-label">Yeni Şifre</span>
            <input {...field('newPw', 'En az 6 karakter')} />
            {errors.newPw && <span className="prof-err">{errors.newPw}</span>}
          </label>
          <label className="prof-field">
            <span className="prof-label">Yeni Şifre (Tekrar)</span>
            <input {...field('confirmPw', 'Şifreyi tekrar girin')} />
            {errors.confirmPw && <span className="prof-err">{errors.confirmPw}</span>}
          </label>
        </div>
        <button className="prof-save-btn" style={{ marginTop: '0.5rem' }} onClick={handleSave}>
          Şifreyi Güncelle
        </button>
      </div>

      <div className="sec-section">
        <h3 className="sec-subtitle">Hesap Güvenliği</h3>
        <div className="sec-items">
          <div className="sec-item">
            <div>
              <p className="sec-item-title">İki Faktörlü Doğrulama</p>
              <p className="sec-item-desc">SMS ile ekstra güvenlik katmanı ekleyin</p>
            </div>
            <button className="sec-setup-btn">Etkinleştir</button>
          </div>
          <div className="sec-item">
            <div>
              <p className="sec-item-title">Aktif Oturumlar</p>
              <p className="sec-item-desc">Cihazlarınızdaki aktif oturumları görün ve sonlandırın</p>
            </div>
            <button className="sec-setup-btn">Görüntüle</button>
          </div>
        </div>
      </div>

      <div className="sec-section danger-zone">
        <h3 className="sec-subtitle danger">Tehlikeli Bölge</h3>
        <div className="sec-items">
          <div className="sec-item">
            <div>
              <p className="sec-item-title">Hesabımı Sil</p>
              <p className="sec-item-desc">Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinir.</p>
            </div>
            <button className="sec-delete-btn">Hesabı Sil</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Bildirimler Tab ── */
const NOTIF_ITEMS = [
  { key: 'orderUpdates', label: 'Sipariş Güncellemeleri', desc: 'Siparişinizin durumu değiştiğinde bildirim alın', default: true },
  { key: 'promotions',   label: 'Kampanya ve Fırsatlar', desc: 'Özel indirim ve kampanyalardan haberdar olun', default: false },
  { key: 'priceAlerts',  label: 'Fiyat Uyarıları', desc: 'Favorilerdeki ürünlerin fiyatı düştüğünde bildirim alın', default: true },
  { key: 'sms',          label: 'SMS Bildirimleri', desc: 'Önemli güncellemeler için SMS alın', default: false },
  { key: 'newsletter',   label: 'E-posta Bülteni', desc: 'Haftalık ürün önerileri ve haberler', default: false },
]

function NotificationsTab() {
  const [notifs, setNotifs] = useState(() =>
    Object.fromEntries(NOTIF_ITEMS.map(i => [i.key, i.default]))
  )
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="prof-tab-content">
      <div className="prof-section-header">
        <h2 className="prof-section-title">Bildirim Tercihleri</h2>
        <button className="prof-save-btn" onClick={handleSave}>Kaydet</button>
      </div>
      {saved && <div className="prof-success-bar">✓ Tercihleriniz kaydedildi!</div>}
      <div className="notif-list">
        {NOTIF_ITEMS.map(item => (
          <div key={item.key} className="notif-item">
            <div>
              <p className="notif-title">{item.label}</p>
              <p className="notif-desc">{item.desc}</p>
            </div>
            <button
              className={`notif-toggle ${notifs[item.key] ? 'on' : ''}`}
              onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
              aria-label={item.label}
            >
              <span className="notif-thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Nav ── */
const NAV_ITEMS = [
  { key: 'account',       icon: '👤', label: 'Hesabım' },
  { key: 'orders',        icon: '📦', label: 'Siparişlerim' },
  { key: 'addresses',     icon: '📍', label: 'Adreslerim' },
  { key: 'security',      icon: '🔒', label: 'Güvenlik' },
  { key: 'notifications', icon: '🔔', label: 'Bildirimler' },
]

/* ── Main ProfilePage ── */
export default function ProfilePage({ onBack, initialTab }) {
  const { user, updateUser, logout, savedAddresses, addAddress, removeAddress, editAddress } = useAuth()
  const { favCount } = useFav()
  const { cartCount } = useCart()
  const [activeTab, setActiveTab] = useState(initialTab ?? 'account')

  const handleLogout = () => { logout(); onBack() }

  return (
    <main className="prof-page">
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="bc-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bc-sep">›</span>
          <span className="bc-current">Profilim</span>
        </div>
      </div>

      <div className="prof-container">
        <aside className="prof-sidebar">
          <div className="prof-sidebar-top">
            <div className="prof-avatar-md">{user?.name?.charAt(0).toUpperCase() ?? 'K'}</div>
            <div className="prof-sb-info">
              <p className="prof-sb-name">{user?.name}</p>
              <p className="prof-sb-email">{user?.email}</p>
            </div>
          </div>

          <nav className="prof-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`prof-nav-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="prof-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.key === 'orders' && <span className="prof-nav-badge">{MOCK_ORDERS.length}</span>}
                {item.key === 'addresses' && savedAddresses.length > 0 && (
                  <span className="prof-nav-badge">{savedAddresses.length}</span>
                )}
              </button>
            ))}
          </nav>

          <button className="prof-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Çıkış Yap
          </button>
        </aside>

        <div className="prof-content">
          {activeTab === 'account' && (
            <AccountTab
              user={user}
              updateUser={updateUser}
              favCount={favCount}
              cartCount={cartCount}
              addressCount={savedAddresses.length}
            />
          )}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'addresses' && (
            <AddressesTab
              addresses={savedAddresses}
              addAddress={addAddress}
              removeAddress={removeAddress}
              editAddress={editAddress}
            />
          )}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </main>
  )
}
