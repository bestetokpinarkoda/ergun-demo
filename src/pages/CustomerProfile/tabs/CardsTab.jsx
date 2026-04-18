import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'

// Kart numarasından markayı belirle (Luhn değil, prefix'e göre)
function detectBrand(number) {
  const n = number.replace(/\D/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^(9792|65|6011)/.test(n)) return 'troy'
  return 'other'
}

const BRAND_LABELS = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', troy: 'Troy', other: 'Kart',
}

const EMPTY_FORM = {
  holder_name: '', number: '', expiry_month: '', expiry_year: '', cvv: '', is_default: false,
}

export default function CardsTab() {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('saved_cards')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setCards(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setAdding(true)
    setForm(EMPTY_FORM)
    setError(null)
  }

  const closeModal = () => {
    setAdding(false)
    setForm(EMPTY_FORM)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    const cleanNumber = form.number.replace(/\s/g, '')
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      setError('Kart numarası 13-19 hane olmalı.')
      return
    }
    const month = parseInt(form.expiry_month, 10)
    const year = parseInt(form.expiry_year, 10)
    if (!month || month < 1 || month > 12) {
      setError('Geçerli bir ay gir (01-12).')
      return
    }
    if (!year || year < new Date().getFullYear()) {
      setError('Kartın son kullanma yılı geçmiş.')
      return
    }
    setSaving(true)
    try {
      if (form.is_default) {
        await supabase.from('saved_cards').update({ is_default: false }).eq('user_id', user.id)
      }
      const payload = {
        user_id: user.id,
        holder_name: form.holder_name.trim(),
        last4: cleanNumber.slice(-4),
        brand: detectBrand(cleanNumber),
        expiry_month: month,
        expiry_year: year,
        is_default: form.is_default,
      }
      const { error } = await supabase.from('saved_cards').insert(payload)
      if (error) throw error
      await load()
      closeModal()
    } catch (err) {
      setError(err.message || 'Kart kaydedilemedi.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu kartı silmek istediğine emin misin?')) return
    const { error } = await supabase.from('saved_cards').delete().eq('id', id)
    if (error) return alert(error.message)
    load()
  }

  const handleSetDefault = async (id) => {
    await supabase.from('saved_cards').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('saved_cards').update({ is_default: true }).eq('id', id)
    load()
  }

  const formatCardInput = (v) => v.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || ''

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <h2>Kayıtlı Kartlarım</h2>
        <button className="profile-add-btn" onClick={openNew}>+ Yeni Kart Ekle</button>
      </div>
      <p className="profile-section-desc">
        Hızlı ve güvenli alışveriş için kartlarınızı kaydedin. Kart numaranın tamamı sistemimizde saklanmaz; yalnızca son 4 hanesi görünür.
      </p>

      {loading ? (
        <div className="profile-loading">Yükleniyor...</div>
      ) : cards.length === 0 ? (
        <div className="profile-empty-state">
          <span className="empty-icon">💳</span>
          <p>Kayıtlı bir kredi/banka kartınız bulunmuyor.</p>
        </div>
      ) : (
        <div className="card-grid">
          {cards.map((c) => (
            <article key={c.id} className={`saved-card brand-${c.brand}`}>
              <div className="saved-card-top">
                <span className="saved-card-brand">{BRAND_LABELS[c.brand] || 'Kart'}</span>
                {c.is_default && <span className="saved-card-badge">Varsayılan</span>}
              </div>
              <div className="saved-card-number">•••• •••• •••• {c.last4}</div>
              <div className="saved-card-bottom">
                <div>
                  <span className="saved-card-label">Kart Sahibi</span>
                  <span className="saved-card-value">{c.holder_name}</span>
                </div>
                <div>
                  <span className="saved-card-label">Son Kul.</span>
                  <span className="saved-card-value">
                    {String(c.expiry_month).padStart(2, '0')}/{String(c.expiry_year).slice(-2)}
                  </span>
                </div>
              </div>
              <footer className="saved-card-actions">
                {!c.is_default && (
                  <button className="address-link-btn" onClick={() => handleSetDefault(c.id)}>Varsayılan yap</button>
                )}
                <button className="address-link-btn text-danger" onClick={() => handleDelete(c.id)}>Sil</button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {adding && (
        <div className="profile-modal-backdrop" onClick={closeModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <header className="profile-modal-header">
              <h3>Yeni Kart Ekle</h3>
              <button className="profile-modal-close" onClick={closeModal} aria-label="Kapat">×</button>
            </header>
            <form className="profile-modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Kart Üzerindeki İsim</label>
                <input required placeholder="AD SOYAD" value={form.holder_name}
                  onChange={(e) => setForm({ ...form, holder_name: e.target.value.toUpperCase() })}
                  className="profile-input" />
              </div>
              <div className="form-group">
                <label>Kart Numarası</label>
                <input required inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000"
                  value={formatCardInput(form.number)}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="profile-input" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ay</label>
                  <input required inputMode="numeric" maxLength={2} placeholder="MM"
                    value={form.expiry_month}
                    onChange={(e) => setForm({ ...form, expiry_month: e.target.value.replace(/\D/g, '') })}
                    className="profile-input" />
                </div>
                <div className="form-group">
                  <label>Yıl</label>
                  <input required inputMode="numeric" maxLength={4} placeholder="YYYY"
                    value={form.expiry_year}
                    onChange={(e) => setForm({ ...form, expiry_year: e.target.value.replace(/\D/g, '') })}
                    className="profile-input" />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input required inputMode="numeric" maxLength={4} placeholder="•••"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '') })}
                    className="profile-input" />
                </div>
              </div>
              <p className="form-hint">CVV ve tam kart numarası kaydedilmez, sadece son 4 hane saklanır.</p>
              <label className="profile-checkbox">
                <input type="checkbox" checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
                <span>Varsayılan kart olarak işaretle</span>
              </label>
              {error && <div className="profile-alert profile-alert-error">{error}</div>}
              <div className="profile-modal-actions">
                <button type="button" className="profile-btn-secondary" onClick={closeModal}>Vazgeç</button>
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kartı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
