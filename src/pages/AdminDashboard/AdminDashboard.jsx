import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './AdminDashboard.css'

export default function AdminDashboard({ onExit }) {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({ users: 0, customers: 0, suppliers: 0, admins: 0, totalOrders: 0, totalRevenue: 0 })
  const [users, setUsers] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      
      const { data: usersData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, phone, created_at')
        .order('created_at', { ascending: false })

      const { data: ordersData, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at, user_id')
        .order('created_at', { ascending: false })

      if (!active) return
      if (userError) setError(userError.message)
      if (orderError && !userError) setError(orderError.message)

      const safeUsers = userError ? [] : (usersData || [])
      const safeOrders = orderError ? [] : (ordersData || [])

      const usersById = new Map(safeUsers.map(u => [u.id, u]))

      const ordersWithNames = safeOrders.map(o => ({
        ...o,
        customer_name: usersById.get(o.user_id)?.full_name || null,
      }))

      setUsers(safeUsers)
      setRecentOrders(ordersWithNames)
      
      const totalRevenue = safeOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

      setStats({
        users: safeUsers.length,
        customers: safeUsers.filter(u => u.role === 'customer').length,
        suppliers: safeUsers.filter(u => u.role === 'supplier').length,
        admins: safeUsers.filter(u => u.role === 'admin').length,
        totalOrders: ordersWithNames.length,
        totalRevenue
      })
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const handleSignOut = async () => {
    try { await signOut() } catch (e) { console.error(e) }
    if (onExit) onExit()
  }

  const handleRoleChange = async (id, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id)
    if (error) {
      alert('Rol güncellenemedi: ' + error.message)
      return
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-brand-logo">ERGUN</span>
          <span className="admin-brand-tag">Admin Paneli</span>
        </div>
        <div className="admin-user">
          <div className="admin-user-info">
            <span className="admin-user-name">{profile?.full_name || user?.email}</span>
            <span className="admin-user-role">{profile?.role}</span>
          </div>
          <button className="admin-signout-btn" onClick={handleSignOut}>Çıkış Yap</button>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Kullanıcılar
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Siparişler
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <section className="admin-stats">
            <StatCard label="Toplam Kullanıcı" value={stats.users} />
            <StatCard label="Müşteri" value={stats.customers} accent="blue" />
            <StatCard label="Tedarikçi" value={stats.suppliers} accent="amber" />
            <StatCard label="Admin" value={stats.admins} accent="rose" />
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>Kullanıcı Yönetimi</h2>
              <p>Sistemdeki kullanıcıları görüntüle ve rollerini düzenle.</p>
            </div>

            {error && <div className="admin-alert">{error}</div>}

            {loading ? (
              <div className="admin-loading">Yükleniyor...</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kullanıcı</th>
                      <th>Telefon</th>
                      <th>Rol</th>
                      <th>Kayıt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar">
                              {u.avatar_url ? <img src={u.avatar_url} alt="" /> : (u.full_name?.charAt(0) || '?')}
                            </div>
                            <div className="admin-user-cell-info">
                              <span>{u.full_name || 'İsimsiz'}</span>
                              <small>{u.id.slice(0, 8)}...</small>
                            </div>
                          </div>
                        </td>
                        <td className="admin-phone-cell">{u.phone || '-'}</td>
                        <td>
                          <select
                            className={`admin-role-select role-${u.role}`}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user.id}
                          >
                            <option value="customer">Müşteri</option>
                            <option value="supplier">Tedarikçi</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="admin-date-cell">
                          {new Date(u.created_at).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <section className="admin-stats">
            <StatCard label="Toplam Sipariş" value={stats.totalOrders} accent="blue" />
            <StatCard label="Toplam Gelir" value={`${new Intl.NumberFormat('tr-TR').format(stats.totalRevenue)} TL`} accent="amber" />
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>Tüm Siparişler</h2>
              <p>Sistemdeki tüm alışveriş hareketleri.</p>
            </div>

            {error && <div className="admin-alert">{error}</div>}

            {loading ? (
              <div className="admin-loading">Yükleniyor...</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sipariş No</th>
                      <th>Müşteri</th>
                      <th>Tutar</th>
                      <th>Tarih</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.order_number}</strong></td>
                        <td>{o.customer_name || 'Bilinmiyor'}</td>
                        <td>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(o.total_amount)}</td>
                        <td className="admin-date-cell">
                          {new Date(o.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </td>
                        <td>
                          <span className={`admin-status-badge status-${o.status}`}>
                            {o.status === 'preparing' ? 'Hazırlanıyor' : o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Henüz sipariş bulunmuyor.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`admin-stat-card ${accent ? `accent-${accent}` : ''}`}>
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
    </div>
  )
}
