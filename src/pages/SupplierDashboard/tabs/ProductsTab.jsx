import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { CATEGORIES } from '../../../data/categories'

const EMPTY_FORM = {
  name: '', description: '', category: '', price: '', stock: '', image_url: '', status: 'active',
}
 
const fmtMoney = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0)
 
export default function ProductsTab({ supplier }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // 'new' | id | null
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
 
  const load = useCallback(async () => {
    if (!supplier?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('supplier_id', supplier.id)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProducts(data || [])
    setLoading(false)
  }, [supplier?.id])
 
  useEffect(() => { load() }, [load])
 
  const openNew = () => { setEditing('new'); setForm(EMPTY_FORM); setError(null) }
  const openEdit = (p) => {
    setEditing(p.id)
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || '',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? ''),
      image_url: p.image_url || '',
      status: p.status || 'active',
    })
    setError(null)
  }
  const closeModal = () => { setEditing(null); setForm(EMPTY_FORM) }
 
  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    const price = Number(form.price)
    const stock = parseInt(form.stock, 10)
    if (!form.name.trim()) return setError('Ürün adı zorunlu.')
    if (isNaN(price) || price < 0) return setError('Geçerli bir fiyat gir.')
    if (isNaN(stock) || stock < 0) return setError('Geçerli bir stok miktarı gir.')
    setSaving(true)
    try {
      const payload = {
        supplier_id: supplier.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        price,
        stock,
        image_url: form.image_url.trim() || null,
        status: form.status,
      }
      if (editing === 'new') {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', editing)
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
    if (!confirm('Bu ürünü silmek istediğine emin misin?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return alert(error.message)
    load()
  }
 
  return (
    <div className="sup-products">
      <header className="sup-products-header">
        <div>
          <h2>Ürünlerim</h2>
          <p>Envanterini yönet, yeni ürünler ekle.</p>
        </div>
        <button className="sup-primary-btn" onClick={openNew}>+ Yeni Ürün</button>
      </header>
 
      {loading ? (
        <div className="sup-dash-loading">Yükleniyor...</div>
      ) : (
        <>
          {products.length === 0 && (
            <div className="sup-demo-banner">
              <span>✨</span>
              <p>Henüz ürün eklemedin. Buradan yeni ürünler eklediğinde listene düşecek.</p>
            </div>
          )}
          {products.length > 0 && (
            <div className="sup-product-grid">
              {products.map(p => (
                <article key={p.id} className="sup-product-card">
                  <div className="sup-product-img">
                    {p.image_url ? <img src={p.image_url} alt={p.name} /> : <span>📦</span>}
                  </div>
                  <div className="sup-product-info">
                    <header>
                      <h3>{p.name}</h3>
                      {p.category && <span className="sup-product-cat">{p.category}</span>}
                    </header>
                    <div className="sup-product-meta">
                      <span><strong>{fmtMoney(p.price)}</strong></span>
                      <span>Stok: <strong>{p.stock}</strong></span>
                      <span className={`sup-product-status status-${p.status}`}>
                        {p.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <footer className="sup-product-actions">
                      <>
                        <button className="sup-link-btn" onClick={() => openEdit(p)}>Düzenle</button>
                        <button className="sup-link-btn sup-danger" onClick={() => handleDelete(p.id)}>Sil</button>
                      </>
                    </footer>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
 
      {editing && (
        <div className="sup-modal-backdrop" onClick={closeModal}>
          <div className="sup-modal" onClick={(e) => e.stopPropagation()}>
            <header className="sup-modal-header">
              <h3>{editing === 'new' ? 'Yeni Ürün' : 'Ürünü Düzenle'}</h3>
              <button className="sup-modal-close" onClick={closeModal} aria-label="Kapat">×</button>
            </header>
            <form className="sup-modal-form" onSubmit={handleSave}>
              <div className="sup-form-group">
                <label>Ürün Adı *</label>
                <input required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="sup-form-row">
                <div className="sup-form-group">
                  <label>Kategori</label>
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Seçiniz...</option>
                    {CATEGORIES.map(c => <option key={c.slug} value={c.label}>{c.label}</option>)}
                  </select>
                </div>
                <div className="sup-form-group">
                  <label>Durum</label>
                  <select value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>
              <div className="sup-form-row">
                <div className="sup-form-group">
                  <label>Fiyat (TL) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="sup-form-group">
                  <label>Stok *</label>
                  <input required type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="sup-form-group">
                <label>Görsel URL</label>
                <input type="url" placeholder="https://..." value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
              <div className="sup-form-group">
                <label>Açıklama</label>
                <textarea rows="4" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <div className="sup-alert sup-alert-error">{error}</div>}
              <div className="sup-modal-actions">
                <button type="button" className="sup-secondary-btn" onClick={closeModal}>Vazgeç</button>
                <button type="submit" className="sup-primary-btn" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : (editing === 'new' ? 'Ürünü Ekle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}