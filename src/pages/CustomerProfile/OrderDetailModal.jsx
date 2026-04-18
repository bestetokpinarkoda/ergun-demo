import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_LABELS = {
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  in_transit: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  returned: 'İade Edildi',
}

const SHIPPING_STEPS = [
  { key: 'preparing', label: 'Hazırlanıyor', icon: '📦' },
  { key: 'shipped', label: 'Kargoya Verildi', icon: '🚚' },
  { key: 'in_transit', label: 'Dağıtımda', icon: '🛣️' },
  { key: 'delivered', label: 'Teslim Edildi', icon: '✅' },
]

const fmtDate = (iso) => new Date(iso).toLocaleDateString('tr-TR', {
  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
})
const fmtMoney = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)

export default function OrderDetailModal({ order, onClose }) {
  const { user, profile } = useAuth()
  const [view, setView] = useState('detail') // 'detail' | 'invoice'

  const currentStepIndex = SHIPPING_STEPS.findIndex(s => s.key === order.status)
  const isCancelled = ['cancelled', 'returned'].includes(order.status)

  const subtotal = (order.order_items || []).reduce((sum, i) => sum + Number(i.total_price), 0)
  const tax = subtotal * 0.20 / 1.20
  const net = subtotal - tax

  if (view === 'invoice') {
    return (
      <div className="profile-modal-backdrop" onClick={onClose}>
        <div className="profile-modal invoice-modal" onClick={(e) => e.stopPropagation()}>
          <header className="profile-modal-header no-print">
            <h3>Fatura</h3>
            <div className="invoice-actions">
              <button className="profile-btn-secondary" onClick={() => window.print()}>Yazdır / PDF</button>
              <button className="profile-btn-secondary" onClick={() => setView('detail')}>← Geri</button>
              <button className="profile-modal-close" onClick={onClose}>×</button>
            </div>
          </header>

          <div className="invoice-body">
            <div className="invoice-brand">
              <h1>ERGUN SHOP</h1>
              <p>Ergün Teknoloji Perakende A.Ş.</p>
              <p>Maslak Mah. Teknoloji Cad. No:1 Sarıyer / İstanbul</p>
              <p>VKN: 1234567890 • info@ergunshop.com</p>
            </div>

            <div className="invoice-meta">
              <div>
                <h4>Fatura No</h4>
                <p>{order.order_number}</p>
                <h4>Tarih</h4>
                <p>{fmtDate(order.created_at)}</p>
              </div>
              <div>
                <h4>Müşteri</h4>
                <p>{profile?.full_name || user?.email}</p>
                <p>{user?.email}</p>
                {order.shipping_address && (
                  <>
                    <h4>Teslimat Adresi</h4>
                    <p>{order.shipping_address.address_line}</p>
                    <p>{order.shipping_address.city}</p>
                  </>
                )}
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Adet</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {(order.order_items || []).map(i => (
                  <tr key={i.id}>
                    <td>{i.product_name}</td>
                    <td>{i.quantity}</td>
                    <td>{fmtMoney(i.unit_price)}</td>
                    <td>{fmtMoney(i.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-totals">
              <div><span>Ara Toplam (Vergisiz):</span><strong>{fmtMoney(net)}</strong></div>
              <div><span>KDV (%20):</span><strong>{fmtMoney(tax)}</strong></div>
              <div className="invoice-total-grand">
                <span>Genel Toplam:</span><strong>{fmtMoney(subtotal)}</strong>
              </div>
            </div>

            <p className="invoice-footer">Bu belge elektronik olarak oluşturulmuştur. Ödeme: {order.payment_method}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal order-detail-modal" onClick={(e) => e.stopPropagation()}>
        <header className="profile-modal-header">
          <div>
            <h3>Sipariş #{order.order_number}</h3>
            <p className="order-detail-date">{fmtDate(order.created_at)}</p>
          </div>
          <button className="profile-modal-close" onClick={onClose} aria-label="Kapat">×</button>
        </header>

        <div className="order-detail-body">
          {/* Kargo Durumu */}
          <section className="order-section">
            <h4>Kargo Takibi</h4>
            {isCancelled ? (
              <div className="tracking-cancelled">
                Bu sipariş <strong>{STATUS_LABELS[order.status].toLowerCase()}</strong>.
              </div>
            ) : (
              <>
                <div className="tracking-timeline">
                  {SHIPPING_STEPS.map((step, idx) => {
                    const done = idx <= currentStepIndex
                    const current = idx === currentStepIndex
                    return (
                      <div key={step.key} className={`tracking-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}>
                        <div className="tracking-dot">{done ? step.icon : idx + 1}</div>
                        <div className="tracking-label">{step.label}</div>
                        {idx < SHIPPING_STEPS.length - 1 && <div className="tracking-line" />}
                      </div>
                    )
                  })}
                </div>
                {order.tracking_number && (
                  <div className="tracking-info">
                    <div><span>Kargo Firması:</span><strong>{order.carrier}</strong></div>
                    <div><span>Takip No:</span><strong>{order.tracking_number}</strong></div>
                    {order.delivered_at && (
                      <div><span>Teslim Tarihi:</span><strong>{fmtDate(order.delivered_at)}</strong></div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Ürünler */}
          <section className="order-section">
            <h4>Ürünler ({order.order_items?.length || 0})</h4>
            <ul className="order-products">
              {(order.order_items || []).map(i => (
                <li key={i.id} className="order-product">
                  <div className="order-product-img">
                    {i.product_image
                      ? <img src={i.product_image} alt={i.product_name} />
                      : <span>📦</span>}
                  </div>
                  <div className="order-product-info">
                    <span className="order-product-name">{i.product_name}</span>
                    <span className="order-product-meta">{i.quantity} adet × {fmtMoney(i.unit_price)}</span>
                  </div>
                  <span className="order-product-total">{fmtMoney(i.total_price)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Adres + Ödeme */}
          <section className="order-section order-two-col">
            {order.shipping_address && (
              <div>
                <h4>Teslimat Adresi</h4>
                <p className="order-address">
                  <strong>{order.shipping_address.title}</strong><br />
                  {order.shipping_address.address_line}<br />
                  {order.shipping_address.city}
                </p>
              </div>
            )}
            <div>
              <h4>Ödeme</h4>
              <p className="order-address">{order.payment_method || '-'}</p>
            </div>
          </section>

          <section className="order-section order-total-row">
            <span>Toplam Tutar</span>
            <strong>{fmtMoney(order.total_amount)}</strong>
          </section>

          <div className="order-detail-actions">
            <button className="profile-btn-secondary" onClick={onClose}>Kapat</button>
            <button className="profile-save-btn" onClick={() => setView('invoice')}>Faturayı Görüntüle</button>
          </div>
        </div>
      </div>
    </div>
  )
}
