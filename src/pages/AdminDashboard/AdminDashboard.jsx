import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import './AdminDashboard.css'

export default function AdminDashboard({ onExit }) {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({ users: 0, customers: 0, suppliers: 0, admins: 0 })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, phone, created_at')
        .order('created_at', { ascending: false })

      if (!active) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setUsers(data || [])
      setStats({
        users: data.length,
        customers: data.filter(u => u.role === 'customer').length,
        suppliers: data.filter(u => u.role === 'supplier').length,
        admins: data.filter(u => u.role === 'admin').length,
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
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt="" referrerPolicy="no-referrer" />
                            : (u.full_name?.charAt(0)?.toUpperCase() || '?')}
                        </div>
                        <div className="admin-user-cell-info">
                          <span>{u.full_name || 'İsimsiz'}</span>
                          <small>{u.id.slice(0, 8)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || '-'}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user?.id}
                        className={`admin-role-select role-${u.role}`}
                      >
                        <option value="customer">customer</option>
                        <option value="supplier">supplier</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" className="admin-empty">Kayıt bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
