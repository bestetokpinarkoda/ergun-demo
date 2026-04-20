import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const STATUS_LABELS = {
  preparing: 'Hazırlanıyor', shipped: 'Kargoya Verildi', in_transit: 'Yolda',
  delivered: 'Teslim Edildi', cancelled: 'İptal Edildi', returned: 'İade Edildi',
}
const fmtDate = (iso) => new Date(iso).toLocaleDateString('tr-TR', {
  day: '2-digit', month: 'long', year: 'numeric',
})
const fmtMoney = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0)

export default function SupplierOrdersTab({ supplier }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supplier?.id) return
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('*, orders!inner(id, order_number, status, created_at, shipping_address)')
          .eq('supplier_id', supplier.id)

        if (itemsErr) throw itemsErr

        const allItems = items || []

        if (!active) return

        const grouped = new Map()
        for (const i of allItems) {
          if (!i.orders) continue
          const key = i.orders.id
          const prev = grouped.get(key)
          const itemTotal = Number(i.total_price || 0)
          if (prev) {
            prev.total += itemTotal
            prev.items.push(i)
          } else {
            grouped.set(key, { ...i.orders, total: itemTotal, items: [i] })
          }
        }
        setRows(Array.from(grouped.values())
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      } catch (err) {
        if (active) setError(err.message || 'Siparişler yüklenemedi.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [supplier?.id])

  if (loading) return <div className="sup-dash-loading">Yükleniyor...</div>

  return (
    <div className="sup-orders">
      <header className="sup-products-header">
        <div>
          <h2>Siparişler</h2>
          <p>Ürünlerine gelen siparişler burada listelenir.</p>
        </div>
      </header>

      {error && <div className="sup-alert sup-alert-error">{error}</div>}

      {rows.length === 0 && !error && (
        <div className="sup-demo-banner">
          <span>📦</span>
          <p>Henüz hiç sipariş almadınız. Yeni siparişleriniz olduğunda burada listelenecek.</p>
        </div>
      )}

      <ul className="sup-order-list">
        {rows.map(o => (
          <li key={o.id} className="sup-order-item">
            <div className="sup-order-top">
              <div>
                <strong>#{o.order_number}</strong>
                <span className="sup-order-date">{fmtDate(o.created_at)}</span>
              </div>
              <span className={`sup-recent-status status-${o.status}`}>
                {STATUS_LABELS[o.status] || o.status}
              </span>
            </div>
            <div className="sup-order-items">
              {o.items.map(i => (
                <div key={i.id} className="sup-order-item-row">
                  <span>{i.product_name}</span>
                  <span>{i.quantity} × {fmtMoney(i.unit_price)}</span>
                  <strong>{fmtMoney(i.total_price)}</strong>
                </div>
              ))}
            </div>
            <div className="sup-order-bottom">
              {o.shipping_address?.city && (
                <span>📍 {o.shipping_address.city}</span>
              )}
              <strong>Toplam: {fmtMoney(o.total)}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
