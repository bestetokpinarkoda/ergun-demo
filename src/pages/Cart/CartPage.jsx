import { useEffect, useState } from 'react'
import { useAuth } from '../../store/AppContext'
import { useCart } from '../../store/AppContext'
import { supabase } from '../../lib/supabase'
import './CartPage.css'

/* ─── Helpers ────────────────────────────── */
const parsePrice = (p) => parseInt(String(p).replace(/\./g, '').replace(/,/g, ''), 10) || 0
const fmtTL = (n) => Math.round(n).toLocaleString('tr-TR')

const CITIES = [
  'İstanbul','Ankara','İzmir','Bursa','Antalya','Adana','Konya','Gaziantep',
  'Mersin','Kocaeli','Diyarbakır','Eskişehir','Samsun','Trabzon','Denizli',
  'Kayseri','Malatya','Erzurum','Manisa','Balıkesir',
]

const DEMO_ADDRESSES = [
  { name:'Ahmet Yılmaz', phone:'532 123 45 67', city:'İstanbul', district:'Kadıköy', neighborhood:'Moda Mah.', fullAddress:'Moda Cad. No:42 Daire:3' },
  { name:'Fatma Kaya', phone:'542 987 65 43', city:'Ankara', district:'Çankaya', neighborhood:'Kızılay Mah.', fullAddress:'Atatürk Bul. No:17 Kat:5' },
  { name:'Mehmet Demir', phone:'505 555 55 55', city:'İzmir', district:'Karşıyaka', neighborhood:'Bostanlı Mah.', fullAddress:'Mustafa Kemal Cad. No:8/2' },
]

const DEMO_CARDS = [
  { cardNumber:'4111 1111 1111 1111', cardName:'AHMET YILMAZ', expiry:'12/27', cvv:'123' },
  { cardNumber:'5500 0000 0000 0004', cardName:'FATMA KAYA', expiry:'06/28', cvv:'456' },
  { cardNumber:'4000 0566 5566 5556', cardName:'MEHMET DEMIR', expiry:'09/26', cvv:'789' },
]

const INSTALLMENTS = [
  { months:1, label:'Tek Çekim (Peşin)', rate:0 },
  { months:3, label:'3 Taksit', rate:0.03 },
  { months:6, label:'6 Taksit', rate:0.06 },
  { months:9, label:'9 Taksit', rate:0.09 },
  { months:12, label:'12 Taksit', rate:0.13 },
]

/* ─── Step Indicator ─────────────────────── */
function StepIndicator({ step }) {
  const steps = [
    { n:1, icon:'🛒', label:'Sepetim' },
    { n:2, icon:'📍', label:'Teslimat' },
    { n:3, icon:'💳', label:'Ödeme' },
    { n:4, icon:'✓',  label:'Onay' },
  ]
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <div key={s.n} className="step-row">
          <div className={`step-bubble ${step >= s.n ? 'done' : ''} ${step === s.n ? 'active' : ''}`}>
            {step > s.n ? '✓' : s.icon}
          </div>
          <span className={`step-label ${step === s.n ? 'active' : ''}`}>{s.label}</span>
          {i < steps.length - 1 && <div className={`step-line ${step > s.n ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

/* ─── Order Summary ──────────────────────── */
function OrderSummary({ items, onNext, nextLabel, loading, couponApplied, step, payment }) {
  const [coupon, setCoupon] = useState('')
  const [couponOk, setCouponOk] = useState(couponApplied)
  
  const subtotal = items.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0)
  const shipping = subtotal >= 1000 ? 0 : 79.90
  const discount = couponOk ? Math.round(subtotal * 0.1) : 0
  
  // Taksit vade farkını hesapla
  let installmentFee = 0
  if (payment && payment.method === 'card' && payment.installment > 1) {
    const selectedInst = INSTALLMENTS.find(i => i.months === payment.installment)
    if (selectedInst) {
      installmentFee = Math.round((subtotal + shipping - discount) * selectedInst.rate)
    }
  }

  const total = subtotal + shipping - discount + installmentFee

  return (
    <div className="order-summary">
      <h3 className="os-title">Sipariş Özeti</h3>

      {step > 1 && (
        <div className="os-items">
          {items.slice(0, 3).map(i => (
            <div key={i.id} className="os-item">
              <span className="os-item-name">{i.name} ×{i.qty}</span>
              <span className="os-item-price">{fmtTL(parsePrice(i.price) * i.qty)} TL</span>
            </div>
          ))}
          {items.length > 3 && <p className="os-more">+{items.length - 3} ürün daha</p>}
          <div className="os-divider" />
        </div>
      )}

      <div className="os-rows">
        <div className="os-row"><span>Ara Toplam</span><span>{fmtTL(subtotal)} TL</span></div>
        <div className="os-row"><span>Kargo</span><span className={shipping === 0 ? 'os-free' : ''}>{shipping === 0 ? 'Ücretsiz' : `${fmtTL(shipping)} TL`}</span></div>
        {discount > 0 && <div className="os-row discount"><span>Kupon İndirimi</span><span>-{fmtTL(discount)} TL</span></div>}
        {installmentFee > 0 && <div className="os-row"><span>Vade Farkı</span><span>+{fmtTL(installmentFee)} TL</span></div>}
        <div className="os-divider" />
        <div className="os-row total"><span>Toplam</span><span>{fmtTL(total)} TL</span></div>
      </div>

      {step === 1 && (
        <div className="os-coupon">
          <input
            className="coupon-input"
            placeholder="Kupon kodu (ERGUN10)"
            value={coupon}
            onChange={e => setCoupon(e.target.value.toUpperCase())}
          />
          <button
            className="coupon-btn"
            disabled={!coupon.trim()}
            onClick={() => {
              if (coupon === 'ERGUN10') { setCouponOk(true) }
            }}
          >
            Uygula
          </button>
          {couponOk && <p className="coupon-ok">✓ %10 indirim uygulandı!</p>}
        </div>
      )}

      {shipping > 0 && (
        <p className="os-shipping-note">
          🚚 {fmtTL(1000 - subtotal)} TL daha alışveriş yaparsanız kargo ücretsiz!
        </p>
      )}

      {onNext && (
        <button className="os-next-btn" onClick={onNext} disabled={loading}>
          {loading ? <span className="os-spinner" /> : nextLabel ?? 'Devam Et →'}
        </button>
      )}

      <div className="os-secure">
        <span>🔒</span>
        <span>256-bit SSL ile güvenli alışveriş</span>
      </div>
    </div>
  )
}

/* ─── Cart Item Row ──────────────────────── */
function CartItemRow({ item, onQty, onRemove }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div className="cart-item">
      <div className="ci-img">
        {imgErr
          ? <span className="ci-img-fallback">📦</span>
          : <img src={item.img} alt={item.name} onError={() => setImgErr(true)} />
        }
      </div>
      <div className="ci-info">
        <p className="ci-category">{item.category}</p>
        <p className="ci-name">{item.name}</p>
        <p className="ci-price-unit">{item.price} TL / adet</p>
      </div>
      <div className="ci-actions">
        <div className="ci-qty">
          <button className="ci-qty-btn" onClick={() => onQty(item.id, item.qty - 1)}>−</button>
          <span className="ci-qty-val">{item.qty}</span>
          <button className="ci-qty-btn" onClick={() => onQty(item.id, item.qty + 1)}>+</button>
        </div>
        <p className="ci-total">{fmtTL(parsePrice(item.price) * item.qty)} TL</p>
        <button className="ci-remove" onClick={() => onRemove(item.id)} aria-label="Kaldır">✕</button>
      </div>
    </div>
  )
}

/* ─── Address Form ───────────────────────── */
function AddressStep({ address, setAddress, onNext, savedAddresses, selectedAddressId, setSelectedAddressId }) {
  const [errors, setErrors] = useState({})

  const fill = () => {
    const d = DEMO_ADDRESSES[Math.floor(Math.random() * DEMO_ADDRESSES.length)]
    setAddress(d)
    setSelectedAddressId(null)
    setErrors({})
  }

  const pickSaved = (a) => {
    setSelectedAddressId(a.id)
    setAddress({
      name: a.full_name || '',
      phone: a.phone || '',
      city: a.city || '',
      district: a.district || '',
      neighborhood: '',
      fullAddress: a.address_line || '',
    })
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!address.name.trim()) e.name = 'Ad soyad gerekli'
    if (!address.phone.trim()) e.phone = 'Telefon gerekli'
    if (!address.city) e.city = 'İl seçiniz'
    if (!address.district.trim()) e.district = 'İlçe gerekli'
    if (!address.fullAddress.trim()) e.fullAddress = 'Açık adres gerekli'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) onNext() }

  const field = (key) => ({
    value: address[key],
    onChange: (e) => { setAddress(a => ({ ...a, [key]: e.target.value })); if (errors[key]) setErrors(er => ({ ...er, [key]:'' })) },
    className: `addr-input${errors[key] ? ' has-error' : ''}`,
  })

  return (
    <div className="addr-form-wrap">
      <div className="addr-form-header">
        <h2 className="step-section-title">Teslimat Adresi</h2>
        <button className="auto-fill-btn" onClick={fill}>⚡ Otomatik Doldur</button>
      </div>

      {savedAddresses && savedAddresses.length > 0 && (
        <div className="saved-picker">
          <p className="saved-picker-title">Kayıtlı Adreslerim</p>
          <div className="saved-picker-list">
            {savedAddresses.map(a => (
              <button
                key={a.id}
                type="button"
                className={`saved-picker-item ${selectedAddressId === a.id ? 'is-selected' : ''}`}
                onClick={() => pickSaved(a)}
              >
                <span className="saved-picker-label">
                  {a.title} {a.is_default && <em>(Varsayılan)</em>}
                </span>
                <span className="saved-picker-detail">{a.full_name} · {a.city}</span>
                <span className="saved-picker-detail-sm">{a.address_line}</span>
              </button>
            ))}
          </div>
          <p className="saved-picker-hint">veya aşağıdan yeni adres gir:</p>
        </div>
      )}

      <div className="addr-grid">
        <label className="addr-field">
          <span className="addr-label">Ad Soyad *</span>
          <input type="text" placeholder="Adınız Soyadınız" {...field('name')} />
          {errors.name && <span className="addr-err">{errors.name}</span>}
        </label>

        <label className="addr-field">
          <span className="addr-label">Telefon *</span>
          <input type="tel" placeholder="5XX XXX XX XX" {...field('phone')} />
          {errors.phone && <span className="addr-err">{errors.phone}</span>}
        </label>

        <label className="addr-field">
          <span className="addr-label">İl *</span>
          <select {...field('city')} className={`addr-input addr-select${errors.city ? ' has-error' : ''}`}>
            <option value="">İl seçiniz</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.city && <span className="addr-err">{errors.city}</span>}
        </label>

        <label className="addr-field">
          <span className="addr-label">İlçe *</span>
          <input type="text" placeholder="İlçe" {...field('district')} />
          {errors.district && <span className="addr-err">{errors.district}</span>}
        </label>

        <label className="addr-field">
          <span className="addr-label">Mahalle</span>
          <input type="text" placeholder="Mahalle / Köy" {...field('neighborhood')} />
        </label>

        <label className="addr-field addr-field-full">
          <span className="addr-label">Açık Adres *</span>
          <textarea
            rows={3}
            placeholder="Cadde, sokak, bina no, daire no..."
            className={`addr-input addr-textarea${errors.fullAddress ? ' has-error' : ''}`}
            value={address.fullAddress}
            onChange={e => { setAddress(a => ({ ...a, fullAddress: e.target.value })); if (errors.fullAddress) setErrors(er => ({ ...er, fullAddress:'' })) }}
          />
          {errors.fullAddress && <span className="addr-err">{errors.fullAddress}</span>}
        </label>

        <label className="addr-field addr-field-full addr-checkbox-wrap">
          <input type="checkbox" defaultChecked /> &nbsp;Fatura adresi, teslimat adresi ile aynı
        </label>
      </div>

      <button className="step-next-btn" onClick={handleNext}>
        Ödemeye Geç →
      </button>
    </div>
  )
}

/* ─── Credit Card Visual ─────────────────── */
function CardVisual({ cardNumber, cardName, expiry, cvv, flipped }) {
  const raw = cardNumber.replace(/\s/g, '')
  const type = raw.startsWith('4') ? 'visa' : raw.startsWith('5') ? 'mc' : raw.startsWith('3') ? 'amex' : 'default'
  const display = (raw.match(/.{1,4}/g) ?? []).join(' ').padEnd(19, '•').replace(/([^ •]{4})(?=[^ •])/g, '$1 ')
  const formatted = cardNumber
    ? cardNumber.replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim()
    : '•••• •••• •••• ••••'

  return (
    <div className={`cv-wrap ${flipped ? 'flipped' : ''}`}>
      <div className="cv-inner">
        <div className={`cv-front cv-${type}`}>
          <div className="cv-top">
            <div className="cv-chip">
              <div className="cv-chip-h" /><div className="cv-chip-v" />
            </div>
            <div className="cv-brand">
              {type === 'visa' && <span className="cv-visa">VISA</span>}
              {type === 'mc' && <div className="cv-mc"><div /><div /></div>}
              {type === 'amex' && <span className="cv-amex">AMEX</span>}
              {type === 'default' && <span className="cv-default-brand">CARD</span>}
            </div>
          </div>
          <div className="cv-number">{formatted}</div>
          <div className="cv-bottom">
            <div>
              <div className="cv-field-label">Kart Sahibi</div>
              <div className="cv-field-val">{cardName || 'AD SOYAD'}</div>
            </div>
            <div>
              <div className="cv-field-label">Son Kullanma</div>
              <div className="cv-field-val">{expiry || 'MM/YY'}</div>
            </div>
          </div>
        </div>
        <div className={`cv-back cv-${type}`}>
          <div className="cv-stripe" />
          <div className="cv-cvv-row">
            <div className="cv-cvv-label">CVV</div>
            <div className="cv-cvv-box">{'•'.repeat(cvv.length || 3)}</div>
          </div>
          <div className="cv-back-brand">
            {type === 'visa' && <span className="cv-visa sm">VISA</span>}
            {type === 'mc' && <div className="cv-mc sm"><div /><div /></div>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Payment Step ───────────────────────── */
function PaymentStep({ payment, setPayment, total, onNext, loading, savedCards }) {
  const [errors, setErrors] = useState({})
  const [cvvFocus, setCvvFocus] = useState(false)

  const fill = () => {
    const d = DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)]
    setPayment(p => ({ ...p, ...d }))
    setErrors({})
  }

  const pickSaved = (c) => {
    setPayment(p => ({
      ...p,
      cardName: c.holder_name || '',
      expiry: `${String(c.expiry_month).padStart(2, '0')}/${String(c.expiry_year).slice(-2)}`,
      cardNumber: `•••• •••• •••• ${c.last4}`,
      cvv: '',
    }))
    setErrors({})
  }

  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d
  }

  const set = (key, val) => {
    setPayment(p => ({ ...p, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]:'' }))
  }

  const validate = () => {
    if (payment.method !== 'card') return true
    const e = {}
    if (payment.cardNumber.replace(/\s/g,'').length < 16) e.cardNumber = 'Geçerli kart numarası girin'
    if (!payment.cardName.trim()) e.cardName = 'Kart sahibi adı gerekli'
    if (payment.expiry.length < 5) e.expiry = 'Geçerli tarih girin (AA/YY)'
    if (payment.cvv.length < 3) e.cvv = 'CVV en az 3 haneli'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const selectedInst = INSTALLMENTS.find(i => i.months === payment.installment) ?? INSTALLMENTS[0]
  const instTotal = Math.round(total * (1 + selectedInst.rate))
  const monthly = Math.round(instTotal / selectedInst.months)

  return (
    <div className="pay-wrap">
      <div className="pay-method-tabs">
        {[
          { key:'card', label:'💳 Kredi / Banka Kartı' },
          { key:'bank', label:'🏦 Banka Havalesi' },
          { key:'door', label:'🚪 Kapıda Ödeme' },
        ].map(m => (
          <button
            key={m.key}
            className={`pay-tab ${payment.method === m.key ? 'active' : ''}`}
            onClick={() => setPayment(p => ({ ...p, method: m.key }))}
          >
            {m.label}
          </button>
        ))}
      </div>

      {payment.method === 'card' && (
        <>
          <CardVisual
            cardNumber={payment.cardNumber}
            cardName={payment.cardName}
            expiry={payment.expiry}
            cvv={payment.cvv}
            flipped={cvvFocus}
          />

          {savedCards && savedCards.length > 0 && (
            <div className="saved-picker">
              <p className="saved-picker-title">Kayıtlı Kartlarım</p>
              <div className="saved-picker-list">
                {savedCards.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className="saved-picker-item"
                    onClick={() => pickSaved(c)}
                  >
                    <span className="saved-picker-label">
                      {c.brand?.toUpperCase() || 'KART'} •••• {c.last4}
                    </span>
                    <span className="saved-picker-detail">{c.holder_name}</span>
                    <span className="saved-picker-detail-sm">
                      Son Kul: {String(c.expiry_month).padStart(2, '0')}/{String(c.expiry_year).slice(-2)}
                    </span>
                  </button>
                ))}
              </div>
              <p className="saved-picker-hint">veya yeni kart bilgilerini gir:</p>
            </div>
          )}

          <div className="pay-form-header">
            <span className="pay-form-title">Kart Bilgileri</span>
            <button className="auto-fill-btn" onClick={fill}>⚡ Test Kartı Doldur</button>
          </div>

          <div className="pay-fields">
            <label className="pay-field pay-field-full">
              <span className="addr-label">Kart Numarası *</span>
              <input
                className={`addr-input pay-card-input${errors.cardNumber ? ' has-error' : ''}`}
                placeholder="1234 5678 9012 3456"
                value={payment.cardNumber}
                maxLength={19}
                onChange={e => set('cardNumber', formatCardNumber(e.target.value))}
              />
              {errors.cardNumber && <span className="addr-err">{errors.cardNumber}</span>}
            </label>

            <label className="pay-field pay-field-full">
              <span className="addr-label">Kart Sahibinin Adı *</span>
              <input
                className={`addr-input${errors.cardName ? ' has-error' : ''}`}
                placeholder="AD SOYAD"
                value={payment.cardName}
                onChange={e => set('cardName', e.target.value.toUpperCase())}
              />
              {errors.cardName && <span className="addr-err">{errors.cardName}</span>}
            </label>

            <label className="pay-field">
              <span className="addr-label">Son Kullanma Tarihi *</span>
              <input
                className={`addr-input${errors.expiry ? ' has-error' : ''}`}
                placeholder="AA/YY"
                maxLength={5}
                value={payment.expiry}
                onChange={e => set('expiry', formatExpiry(e.target.value))}
              />
              {errors.expiry && <span className="addr-err">{errors.expiry}</span>}
            </label>

            <label className="pay-field">
              <span className="addr-label">CVV *</span>
              <input
                className={`addr-input${errors.cvv ? ' has-error' : ''}`}
                placeholder="•••"
                maxLength={4}
                value={payment.cvv}
                onChange={e => set('cvv', e.target.value.replace(/\D/g,'').slice(0,4))}
                onFocus={() => setCvvFocus(true)}
                onBlur={() => setCvvFocus(false)}
              />
              {errors.cvv && <span className="addr-err">{errors.cvv}</span>}
            </label>
          </div>

          <div className="inst-section">
            <h4 className="inst-title">Taksit Seçenekleri</h4>
            <div className="inst-options">
              {INSTALLMENTS.map(opt => {
                const optTotal = Math.round(total * (1 + opt.rate))
                const optMonthly = Math.round(optTotal / opt.months)
                return (
                  <label key={opt.months} className={`inst-option ${payment.installment === opt.months ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="installment"
                      value={opt.months}
                      checked={payment.installment === opt.months}
                      onChange={() => setPayment(p => ({ ...p, installment: opt.months }))}
                    />
                    <div className="inst-info">
                      <span className="inst-label">{opt.label}</span>
                      {opt.months === 1
                        ? <span className="inst-amount">{fmtTL(optTotal)} TL</span>
                        : <span className="inst-amount">{opt.months} × {fmtTL(optMonthly)} TL</span>
                      }
                      {opt.rate > 0 && <span className="inst-rate">+%{Math.round(opt.rate*100)} faiz</span>}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </>
      )}

      {payment.method === 'bank' && (
        <div className="pay-info-box">
          <h4>Banka Havalesi / EFT Bilgileri</h4>
          <div className="bank-info">
            <div className="bank-row"><span>Banka</span><strong>Ziraat Bankası</strong></div>
            <div className="bank-row"><span>Hesap Sahibi</span><strong>Ergün Shop A.Ş.</strong></div>
            <div className="bank-row"><span>IBAN</span><strong>TR12 0001 0025 7832 1234 56</strong></div>
            <div className="bank-row"><span>Açıklama</span><strong>Sipariş No (sistem tarafından atanacak)</strong></div>
          </div>
          <p className="bank-note">⚠️ Havale/EFT işleminden sonra siparişiniz onaylanacaktır. İşlem süresi 1-2 iş günüdür.</p>
        </div>
      )}

      {payment.method === 'door' && (
        <div className="pay-info-box">
          <h4>Kapıda Ödeme</h4>
          <p>Siparişiniz teslim edilirken kapıda nakit veya kart ile ödeme yapabilirsiniz.</p>
          <div className="door-fee"><span>Kapıda ödeme ücreti:</span><strong>+{fmtTL(9.90)} TL</strong></div>
        </div>
      )}

      <button className="step-next-btn" onClick={() => { if (validate()) onNext() }} disabled={loading}>
        {loading ? 'Sipariş oluşturuluyor...' : 'Siparişi Tamamla →'}
      </button>
    </div>
  )
}

/* ─── Success Step ───────────────────────── */
function SuccessStep({ orderNumber, onHome, onOrders }) {
  const orderId = orderNumber ? `#${orderNumber}` : ''
  const delivery = new Date()
  delivery.setDate(delivery.getDate() + 3)
  const deliveryStr = delivery.toLocaleDateString('tr-TR', { day:'numeric', month:'long' })

  return (
    <div className="success-wrap">
      <div className="success-animation">
        <div className="success-circle">
          <span className="success-check">✓</span>
        </div>
      </div>
      <h2 className="success-title">Siparişiniz Alındı!</h2>
      <p className="success-sub">Teşekkürler! Siparişiniz başarıyla oluşturuldu.</p>

      <div className="success-card">
        <div className="sc-row">
          <span>Sipariş No</span>
          <strong className="sc-order-id">{orderId}</strong>
        </div>
        <div className="sc-row">
          <span>Tahmini Teslimat</span>
          <strong>{deliveryStr}</strong>
        </div>
        <div className="sc-row">
          <span>Durum</span>
          <span className="sc-status">🟡 Hazırlanıyor</span>
        </div>
      </div>

      <div className="success-steps">
        {[
          { icon:'📦', label:'Sipariş Alındı', done:true },
          { icon:'🔧', label:'Hazırlanıyor', active:true },
          { icon:'🚚', label:'Kargoya Verildi', done:false },
          { icon:'🏠', label:'Teslim Edildi', done:false },
        ].map((s,i) => (
          <div key={i} className={`track-step ${s.done ? 'done' : ''} ${s.active ? 'active' : ''}`}>
            <div className="track-icon">{s.icon}</div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="success-actions">
        <button className="success-btn-primary" onClick={onOrders}>Siparişlerime Git</button>
        <button className="success-btn-outline" onClick={onHome}>Ana Sayfaya Dön</button>
      </div>
    </div>
  )
}

/* ─── Main CartPage ──────────────────────── */
export default function CartPage({ onBack, onNavigate }) {
  const { user, requireAuth } = useAuth()
  const { cartItems, removeFromCart, updateCartQty, clearCart } = useCart()

  const [step, setStep] = useState(1)
  const [address, setAddress] = useState({ name:'', phone:'', city:'', district:'', neighborhood:'', fullAddress:'' })
  const [payment, setPayment] = useState({ method:'card', cardNumber:'', cardName:'', expiry:'', cvv:'', installment:1 })

  const [savedAddresses, setSavedAddresses] = useState([])
  const [savedCards, setSavedCards] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)

  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState(null)
  const [completedOrderNumber, setCompletedOrderNumber] = useState(null)

  const subtotal = cartItems.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0)
  const shipping = subtotal >= 1000 ? 0 : 79.90
  let installmentFee = 0
  if (payment.method === 'card' && payment.installment > 1) {
    const selectedInst = INSTALLMENTS.find(i => i.months === payment.installment)
    if (selectedInst) {
      installmentFee = Math.round((subtotal + shipping) * selectedInst.rate)
    }
  }
  const total = subtotal + shipping + installmentFee

  useEffect(() => {
    if (!user) {
      setSavedAddresses([])
      setSavedCards([])
      return
    }
    let active = true
    const load = async () => {
      const [{ data: addrs }, { data: cards }] = await Promise.all([
        supabase.from('addresses').select('*')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('saved_cards').select('*')
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false }),
      ])
      if (!active) return
      setSavedAddresses(addrs || [])
      setSavedCards(cards || [])
      const defaultAddr = (addrs || []).find(a => a.is_default) || (addrs || [])[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
        setAddress({
          name: defaultAddr.full_name || '',
          phone: defaultAddr.phone || '',
          city: defaultAddr.city || '',
          district: defaultAddr.district || '',
          neighborhood: '',
          fullAddress: defaultAddr.address_line || '',
        })
      }
    }
    load()
    return () => { active = false }
  }, [user])

  const generateOrderNumber = () =>
    `ER${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`

  const PAYMENT_METHOD_LABELS = { card: 'Kredi / Banka Kartı', bank: 'Banka Havalesi', door: 'Kapıda Ödeme' }

  const placeOrder = () => {
    requireAuth(async () => {
      if (!user) return
      setPlacing(true)
      setPlaceError(null)
      try {
        const orderNumber = generateOrderNumber()
        const shippingPayload = {
          title: savedAddresses.find(a => a.id === selectedAddressId)?.title || 'Teslimat Adresi',
          full_name: address.name,
          phone: address.phone,
          city: address.city,
          district: address.district,
          address_line: [address.neighborhood, address.fullAddress].filter(Boolean).join(' ').trim(),
          zip_code: null,
        }
        const { data: orderRow, error: orderErr } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            order_number: orderNumber,
            status: 'preparing',
            total_amount: total,
            payment_method: PAYMENT_METHOD_LABELS[payment.method] || payment.method,
            shipping_address: shippingPayload,
          })
          .select()
          .single()
        if (orderErr) throw orderErr

        const supaIds = Array.from(new Set(
          cartItems
            .filter(i => (i.isSupabaseProduct || String(i.id).length > 10) && !i.supplierId)
            .map(i => i.id)
        ))

        let supplierMap = new Map()
        if (supaIds.length > 0) {
          const { data: supaProducts, error: supaErr } = await supabase
            .from('products')
            .select('id, supplier_id')
            .in('id', supaIds)
          if (supaErr) throw supaErr
          supplierMap = new Map((supaProducts || []).map(p => [p.id, p.supplier_id]))
        }

        const items = cartItems.map(i => {
          const unit = parsePrice(i.price)
          const isSupa = i.isSupabaseProduct || String(i.id).length > 10
          const supplierId = isSupa ? (i.supplierId || supplierMap.get(i.id) || null) : null
          return {
            order_id: orderRow.id,
            product_name: i.name,
            product_image: i.img,
            quantity: i.qty,
            unit_price: unit,
            total_price: unit * i.qty,
            product_id: isSupa ? i.id : null,
            supplier_id: supplierId,
          }
        })
        const { error: itemsErr } = await supabase.from('order_items').insert(items)
        if (itemsErr) throw itemsErr

        setCompletedOrderNumber(orderNumber)
        clearCart()
        setStep(4)
      } catch (err) {
        setPlaceError(err.message || 'Sipariş oluşturulamadı.')
      } finally {
        setPlacing(false)
      }
    })
  }

  if (step === 4) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <StepIndicator step={4} />
          <SuccessStep
            orderNumber={completedOrderNumber}
            onHome={onBack}
            onOrders={() => onNavigate?.('profile', { tab: 'orders' })}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="breadcrumb-bar">
        <div className="breadcrumb-inner">
          <button className="bc-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bc-sep">›</span>
          <span className="bc-current">Sepetim</span>
        </div>
      </div>

      <div className="cart-container">
        <StepIndicator step={step} />

        {cartItems.length === 0 && step === 1 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Sepetiniz boş</h2>
            <p>Alışverişe başlamak için ürünleri keşfedin.</p>
            <button className="step-next-btn" style={{maxWidth:240}} onClick={onBack}>
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: step content */}
            <div className="cart-main">

              {step === 1 && (
                <div className="cart-items-wrap">
                  <h2 className="step-section-title">Sepetim ({cartItems.length} ürün)</h2>
                  <div className="cart-items-list">
                    {cartItems.map(item => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onQty={updateCartQty}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                  <button className="step-next-btn" onClick={() => requireAuth(() => setStep(2))}>
                    Teslimat Adresine Geç →
                  </button>
                </div>
              )}

              {step === 2 && (
                <AddressStep
                  address={address}
                  setAddress={setAddress}
                  onNext={() => setStep(3)}
                  savedAddresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  setSelectedAddressId={setSelectedAddressId}
                />
              )}

              {step === 3 && (
                <>
                  <PaymentStep
                    payment={payment}
                    setPayment={setPayment}
                    total={total}
                    onNext={placeOrder}
                    loading={placing}
                    savedCards={savedCards}
                  />
                  {placeError && (
                    <div className="cart-error-alert">{placeError}</div>
                  )}
                </>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="cart-sidebar">
              <OrderSummary
                items={cartItems}
                step={step}
                payment={payment}
                loading={placing}
                onNext={step < 3 ? () => requireAuth(() => setStep(s => s + 1)) : placeOrder}
                nextLabel={step === 3 ? 'Siparişi Tamamla' : 'Devam Et →'}
              />

              {step > 1 && (
                <button className="back-step-btn" onClick={() => setStep(s => s - 1)}>
                  ← Geri Dön
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
