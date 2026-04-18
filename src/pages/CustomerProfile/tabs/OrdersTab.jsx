import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import OrderDetailModal from '../OrderDetailModal'

const STATUS_LABELS = {
  preparing: 'Hazırlanıyor',
  shipped: 'Kargoya Verildi',
  in_transit: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal Edildi',
  returned: 'İade Edildi',
}

const fmtDate = (iso) => new Date(iso).toLocaleDateString('tr-TR', {
  day: '2-digit', month: 'long', year: 'numeric',
})
const fmtMoney = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)

export default function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
      if (!active) return
      if (error) setError(error.message)
      else setOrders(data || [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const selected = orders.find(o => o.id === selectedId)

  return (
    <div className="profile-section">
      <h2>Siparişlerim</h2>
      <p className="profile-section-desc">Geçmiş ve devam eden siparişlerinizi takip edin.</p>

      {error && <div className="profile-alert profile-alert-error">{error}</div>}

      {loading ? (
        <div className="profile-loading">Yükleniyor...</div>
      ) : orders.length === 0 ? (
        <div className="profile-empty-state">
          <span className="empty-icon">📦</span>
          <p>Henüz hiç sipariş vermemişsiniz.</p>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.id} className="order-item" onClick={() => setSelectedId(o.id)}>
              <div className="order-item-top">
                <div>
                  <span className="order-number">#{o.order_number}</span>
                  <span className="order-date">{fmtDate(o.created_at)}</span>
                </div>
                <span className={`order-status status-${o.status}`}>{STATUS_LABELS[o.status]}</span>
              </div>
              <div className="order-item-body">
                <span className="order-item-count">
                  {o.order_items?.length || 0} ürün
                </span>
                <span className="order-item-preview">
                  {o.order_items?.slice(0, 2).map(i => i.product_name).join(', ')}
                  {(o.order_items?.length || 0) > 2 && '...'}
                </span>
              </div>
              <div className="order-item-bottom">
                <span className="order-total">{fmtMoney(o.total_amount)}</span>
                <span className="order-chevron">Detay →</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
