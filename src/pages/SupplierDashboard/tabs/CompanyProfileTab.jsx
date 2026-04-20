import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const IBAN_RE = /^TR[0-9]{24}$/

const formatIban = (v) => {
  const raw = String(v || '').replace(/\s/g, '').toUpperCase()
  const after = raw.startsWith('TR') ? raw.slice(2) : raw.replace(/^T?R?/, '')
  const digits = after.replace(/\D/g, '').slice(0, 24)
  const grouped = digits.match(/.{1,4}/g)?.join(' ') || ''
  return digits ? `TR ${grouped}` : 'TR'
}

export default function CompanyProfileTab({ supplier, onUpdated }) {
  const [form, setForm] = useState({
    company_name: '', tax_number: '', authorized_person: '',
    phone: '', company_address: '', city: '', iban: '',
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!supplier) return
    setForm({
      company_name: supplier.company_name || '',
      tax_number: supplier.tax_number || '',
      authorized_person: supplier.authorized_person || '',
      phone: supplier.phone || '',
      company_address: supplier.company_address || '',
      city: supplier.city || '',
      iban: supplier.iban ? formatIban(supplier.iban) : '',
    })
  }, [supplier])

  const handleSave = async (e) => {
    e.preventDefault()
    const ibanRaw = form.iban.replace(/\s/g, '')
    if (ibanRaw && !IBAN_RE.test(ibanRaw)) {
      setStatus({ type: 'error', message: 'TR ile başlayan ve 24 rakamdan oluşan IBAN gir.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const { error } = await supabase.from('suppliers').update({
        company_name: form.company_name.trim(),
        authorized_person: form.authorized_person.trim() || null,
        phone: form.phone.trim() || null,
        company_address: form.company_address.trim() || null,
        city: form.city.trim() || null,
        iban: ibanRaw || null,
      }).eq('id', supplier.id)
      if (error) throw error
      setStatus({ type: 'success', message: 'Firma bilgileri güncellendi.' })
      onUpdated?.()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Güncellenemedi.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sup-company">
      <header className="sup-products-header">
        <div>
          <h2>Firma Profili</h2>
          <p>Şirket bilgilerini güncelle. VKN değiştirilemez.</p>
        </div>
      </header>

      <form className="sup-company-form" onSubmit={handleSave}>
        <div className="sup-form-row">
          <div className="sup-form-group">
            <label>Firma Unvanı *</label>
            <input required value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </div>
          <div className="sup-form-group">
            <label>VKN</label>
            <input value={form.tax_number} disabled className="is-readonly" />
          </div>
        </div>
        <div className="sup-form-row">
          <div className="sup-form-group">
            <label>Yetkili Kişi</label>
            <input value={form.authorized_person}
              onChange={(e) => setForm({ ...form, authorized_person: e.target.value })} />
          </div>
          <div className="sup-form-group">
            <label>Telefon</label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="sup-form-row">
          <div className="sup-form-group">
            <label>Şehir</label>
            <input value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="sup-form-group">
            <label>IBAN</label>
            <input
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: formatIban(e.target.value) })}
              onFocus={() => { if (!form.iban) setForm((f) => ({ ...f, iban: 'TR ' })) }}
              placeholder="TR ____ ____ ____ ____ ____ ____"
              maxLength={32}
            />
          </div>
        </div>
        <div className="sup-form-group">
          <label>Şirket Adresi</label>
          <textarea rows="3" value={form.company_address}
            onChange={(e) => setForm({ ...form, company_address: e.target.value })} />
        </div>

        {status && (
          <div className={`sup-alert sup-alert-${status.type}`}>{status.message}</div>
        )}

        <div className="sup-company-actions">
          <button type="submit" className="sup-primary-btn" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Güncelle'}
          </button>
        </div>
      </form>
    </div>
  )
}
