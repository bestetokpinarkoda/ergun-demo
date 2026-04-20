import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const fmtMoney = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0)

export default function OverviewTab({ supplier }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalStock: 0,
    stockValue: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supplier?.id) return
    let active = true
    const load = async () => {
      setLoading(true)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplier.id)

      const productNames = (products || []).map(p => p.name)
      let orderItems = []
      if (productNames.length > 0) {
        const { data } = await supabase
          .from('order_items')
          .select('*, orders!inner(id, order_number, created_at, status)')
          .in('product_name', productNames)
          .order('id', { ascending: false })
        orderItems = data || []
      }

      const totalRevenue = orderItems.reduce((sum, i) => sum + Number(i.total_price || 0), 0)
      const orderIds = new Set(orderItems.map(i => i.orders?.id).filter(Boolean))
      const stockValue = (products || []).reduce((s, p) => s + Number(p.price) * Number(p.stock), 0)

      const byOrder = new Map()
      for (const i of orderItems) {
        if (!i.orders) continue
        const prev = byOrder.get(i.orders.id)
        const itemTotal = Number(i.total_price || 0)
        if (prev) prev.total += itemTotal
        else byOrder.set(i.orders.id, { ...i.orders, total: itemTotal })
      }
      const recents = Array.from(byOrder.values())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)

      if (!active) return
      setStats({
        totalProducts: (products || []).length,
        activeProducts: (products || []).filter(p => p.status === 'active').length,
        totalStock: (products || []).reduce((s, p) => s + Number(p.stock), 0),
        stockValue: stockValue,
        totalOrders: orderIds.size,
        totalRevenue: totalRevenue,
      })
      setRecentOrders(recents)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [supplier?.id])

  if (loading) return <div className="sup-dash-loading">Yükleniyor...</div>

  return (
    <div className="sup-overview">
      <header className="sup-overview-header">
        <h2>Gösterge Paneli</h2>
        <p>{supplier.company_name} için özet istatistikler.</p>
      </header>

      <div className="sup-stats-grid">
        <StatCard label="Toplam Ciro" value={fmtMoney(stats.totalRevenue)} accent="emerald" icon="💰" />
        <StatCard label="Toplam Sipariş" value={stats.totalOrders} accent="blue" icon="🧾" />
        <StatCard label="Toplam Ürün" value={stats.totalProducts} accent="amber" icon="📦" />
        <StatCard label="Aktif Ürün" value={stats.activeProducts} accent="green" icon="✅" />
        <StatCard label="Toplam Stok" value={stats.totalStock} accent="purple" icon="📊" />
        <StatCard label="Stok Değeri" value={fmtMoney(stats.stockValue)} accent="pink" icon="💎" />
      </div>

      <section className="sup-recent">
        <h3>Son Siparişler</h3>
        <ul className="sup-recent-list">
          {recentOrders.map(o => (
            <li key={o.id} className="sup-recent-item">
              <div>
                <strong>#{o.order_number}</strong>
                <span className="sup-recent-date">
                  {new Date(o.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <span className={`sup-recent-status status-${o.status}`}>{o.status}</span>
              <strong>{fmtMoney(o.total)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function StatCard({ label, value, accent, icon }) {
  return (
    <article className={`sup-stat-card sup-stat-${accent}`}>
      <span className="sup-stat-icon">{icon}</span>
      <div>
        <span className="sup-stat-label">{label}</span>
        <span className="sup-stat-value">{value}</span>
      </div>
    </article>
  )
}
