import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AddressesTab from './tabs/AddressesTab'
import CardsTab from './tabs/CardsTab'
import OrdersTab from './tabs/OrdersTab'
import './ProfilePage.css'

export default function ProfilePage({ onLogout }) {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
  }, [profile])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('signOut error', error)
    }
    if (onLogout) onLogout()
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveStatus(null)
    try {
      await updateProfile({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      })
      setSaveStatus({ type: 'success', message: 'Bilgilerin güncellendi.' })
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message || 'Güncelleme başarısız.' })
    } finally {
      setSaving(false)
    }
  }

  const avatarInitial = profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'M'

  return (
    <main className="profile-page">
      <div className="profile-container">
        
        <aside className="profile-sidebar">
          <div className="profile-user-summary">
            <div className="profile-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile?.full_name || 'Avatar'} referrerPolicy="no-referrer" />
              ) : (
                avatarInitial
              )}
            </div>
            <div className="profile-user-details">
              <h3>{profile?.full_name || 'İsimsiz Kullanıcı'}</h3>
              <p>{user?.email}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <button 
              className={`profile-nav-btn ${activeTab === 'info' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <span className="profile-nav-icon">👤</span>
              Profil Bilgileri
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'addresses' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <span className="profile-nav-icon">📍</span>
              Adres Defteri
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'cards' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('cards')}
            >
              <span className="profile-nav-icon">💳</span>
              Kayıtlı Kartlar
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'orders' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="profile-nav-icon">📦</span>
              Siparişlerim
            </button>
            
            <div className="profile-nav-divider"></div>
            
            <button type="button" className="profile-nav-btn text-danger" onClick={handleSignOut}>
              <span className="profile-nav-icon">🚪</span>
              Çıkış Yap
            </button>
          </nav>
        </aside>

        <section className="profile-content">
          {activeTab === 'info' && (
            <div className="profile-section">
              <h2>Profil Bilgilerim</h2>
              <p className="profile-section-desc">Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</p>
              
              <form className="profile-form" onSubmit={handleSave}>
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="profile-input"
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>E-posta Adresi</label>
                  <input type="email" value={user?.email || ''} readOnly className="profile-input is-readonly" />
                  <span className="form-hint">E-posta adresinizi değiştirmek için destekle iletişime geçin.</span>
                </div>
                <div className="form-group">
                  <label>Telefon Numarası</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="profile-input"
                    disabled={saving}
                  />
                </div>
                {saveStatus && (
                  <div className={`profile-alert profile-alert-${saveStatus.type}`}>
                    {saveStatus.message}
                  </div>
                )}
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Bilgilerimi Güncelle'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'cards' && <CardsTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </section>

      </div>
    </main>
  )
}
