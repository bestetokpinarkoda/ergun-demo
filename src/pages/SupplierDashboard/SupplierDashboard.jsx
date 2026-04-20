import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import OverviewTab from './tabs/OverviewTab'
import ProductsTab from './tabs/ProductsTab'
import SupplierOrdersTab from './tabs/SupplierOrdersTab'
import CompanyProfileTab from './tabs/CompanyProfileTab'
import './SupplierDashboard.css'

export default function SupplierDashboard({ onExit }) {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSupplier = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) setError(error.message)
    else setSupplier(data)
    setLoading(false)
  }, [user])

  useEffect(() => { loadSupplier() }, [loadSupplier])

  const handleSignOut = async () => {
    try { await signOut() } catch (err) { console.error('signOut error', err) }
    if (onExit) onExit()
  }

  const initial = profile?.full_name?.charAt(0)?.toUpperCase()
    || user?.email?.charAt(0)?.toUpperCase()
    || 'S'

  return (
    <main className="sup-dash">
      <aside className="sup-dash-sidebar">
        <div className="sup-dash-brand">
          <div className="sup-dash-avatar">{initial}</div>
          <div className="sup-dash-brand-info">
            <h3>{supplier?.company_name || profile?.full_name || 'Satıcı'}</h3>
            <p>{user?.email}</p>
            <span className="sup-dash-status sup-dash-status-active">Aktif</span>
          </div>
        </div>

        <nav className="sup-dash-nav">
          {[
            { key: 'overview', icon: '📊', label: 'Gösterge Paneli' },
            { key: 'products', icon: '📦', label: 'Ürünlerim' },
            { key: 'orders', icon: '🧾', label: 'Siparişler' },
            { key: 'company', icon: '🏢', label: 'Firma Profili' },
          ].map(item => (
            <button
              key={item.key}
              className={`sup-dash-nav-btn ${activeTab === item.key ? 'is-active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="sup-dash-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="sup-dash-nav-divider" />

          <button className="sup-dash-nav-btn sup-dash-danger" onClick={handleSignOut}>
            <span className="sup-dash-nav-icon">🚪</span>
            Çıkış Yap
          </button>
        </nav>
      </aside>

      <section className="sup-dash-content">
        {loading ? (
          <div className="sup-dash-loading">Yükleniyor...</div>
        ) : error ? (
          <div className="sup-dash-error">{error}</div>
        ) : !supplier ? (
          <div className="sup-dash-empty">
            <h2>Satıcı kaydın bulunamadı</h2>
            <p>Satıcı başvurusunu tamamla, sonra buraya dön.</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab supplier={supplier} />}
            {activeTab === 'products' && <ProductsTab supplier={supplier} />}
            {activeTab === 'orders' && <SupplierOrdersTab supplier={supplier} />}
            {activeTab === 'company' && <CompanyProfileTab supplier={supplier} onUpdated={loadSupplier} />}
          </>
        )}
      </section>
    </main>
  )
}
