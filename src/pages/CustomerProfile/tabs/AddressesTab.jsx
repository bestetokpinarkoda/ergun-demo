import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'

const EMPTY_FORM = {
  title: '', full_name: '', phone: '', city: '', district: '',
  address_line: '', zip_code: '', is_default: false,
}

export default function AddressesTab() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setAddresses(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setEditing('new')
    setForm(EMPTY_FORM)
    setError(null)
  }

  const openEdit = (addr) => {
    setEditing(addr.id)
    setForm({
      title: addr.title || '',
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      city: addr.city || '',
      district: addr.district || '',
      address_line: addr.address_line || '',
      zip_code: addr.zip_code || '',
      is_default: !!addr.is_default,
    })
    setError(null)
  }

  const closeModal = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (form.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      }
      if (editing === 'new') {
        const { error } = await supabase.from('addresses').insert({ ...form, user_id: user.id })
        if (error) throw error
      } else {
        const { error } = await supabase.from('addresses').update(form).eq('id', editing)
        if (error) throw error
      }
      await load()
      closeModal()
    } catch (err) {
      setError(err.message || 'Kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu adresi silmek istediğine emin misin?')) return
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (error) return alert(error.message)
    load()
  }

  const handleSetDefault = async (id) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    load()
  }

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <h2>Adres Defterim</h2>
        <button className="profile-add-btn" onClick={openNew}>+ Yeni Adres Ekle</button>
      </div>
      <p className="profile-section-desc">Siparişlerinizde kullanmak üzere adreslerinizi yönetin.</p>

      {loading ? (
        <div className="profile-loading">Yükleniyor...</div>
      ) : addresses.length === 0 ? (
        <div className="profile-empty-state">
          <span className="empty-icon">📍</span>
          <p>Henüz kayıtlı bir adresiniz bulunmuyor.</p>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((a) => (
            <article key={a.id} className={`address-card ${a.is_default ? 'is-default' : ''}`}>
              <header className="address-card-header">
                <h3>{a.title}</h3>
                {a.is_default && <span className="address-badge">Varsayılan</span>}
              </header>
              <p className="address-name">{a.full_name}</p>
              <p className="address-line">{a.address_line}</p>
              <p className="address-meta">{[a.district, a.city, a.zip_code].filter(Boolean).join(', ')}</p>
              <p className="address-phone">{a.phone}</p>
              <footer className="address-card-actions">
                {!a.is_default && (
                  <button className="address-link-btn" onClick={() => handleSetDefault(a.id)}>
                    Varsayılan yap
                  </button>
                )}
                <button className="address-link-btn" onClick={() => openEdit(a)}>Düzenle</button>
                <button className="address-link-btn text-danger" onClick={() => handleDelete(a.id)}>Sil</button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="profile-modal-backdrop" onClick={closeModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <header className="profile-modal-header">
              <h3>{editing === 'new' ? 'Yeni Adres' : 'Adresi Düzenle'}</h3>
              <button className="profile-modal-close" onClick={closeModal} aria-label="Kapat">×</button>
            </header>
            <form className="profile-modal-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Adres Başlığı</label>
                  <input required placeholder="Ev, İş..." value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} className="profile-input" />
                </div>
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input required value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="profile-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefon</label>
                  <input required type="tel" placeholder="+90 5XX XXX XX XX" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} className="profile-input" />
                </div>
                <div className="form-group">
                  <label>Posta Kodu</label>
                  <input value={form.zip_code}
                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })} className="profile-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Şehir</label>
                  <input required value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })} className="profile-input" />
                </div>
                <div className="form-group">
                  <label>İlçe</label>
                  <input value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })} className="profile-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Açık Adres</label>
                <textarea required rows="3" value={form.address_line}
                  onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="profile-input" />
              </div>
              <label className="profile-checkbox">
                <input type="checkbox" checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
                <span>Varsayılan adres olarak işaretle</span>
              </label>
              {error && <div className="profile-alert profile-alert-error">{error}</div>}
              <div className="profile-modal-actions">
                <button type="button" className="profile-btn-secondary" onClick={closeModal}>Vazgeç</button>
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
