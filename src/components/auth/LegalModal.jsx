import { useEffect } from 'react'
import './LegalModal.css'

export default function LegalModal({ isOpen, onClose, type }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const content = {
    terms: {
      title: 'Kullanım Koşulları',
      text: (
        <>
          <p><strong>1. Taraflar</strong></p>
          <p>İşbu Kullanım Koşulları, ErgunShop (bundan böyle "Platform" olarak anılacaktır) ile Platform'a üye olan veya Platform'u ziyaret eden kullanıcılar (bundan böyle "Kullanıcı" olarak anılacaktır) arasında geçerlidir.</p>
          
          <p><strong>2. Kabul ve Onay</strong></p>
          <p>Platform'a kayıt olarak veya Platform'u kullanarak, bu Kullanım Koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz. Şartları kabul etmiyorsanız lütfen Platform'u kullanmayınız.</p>
          
          <p><strong>3. Hizmetlerin Kapsamı</strong></p>
          <p>ErgunShop, kullanıcıların çeşitli ürünleri inceleyebileceği, satın alabileceği ve satıcıların ürünlerini listeleyebileceği bir pazar yeri platformu sunar. Platform, dilediği zaman hizmetlerin kapsamını değiştirme hakkını saklı tutar.</p>

          <p><strong>4. Kullanıcı Yükümlülükleri</strong></p>
          <p>Kullanıcı, Platform'u kullanırken yasalara, genel ahlak kurallarına ve işbu sözleşme hükümlerine uygun davranacağını kabul eder. Kayıt sırasında verilen bilgilerin doğruluğu kullanıcının sorumluluğundadır.</p>

          <p><strong>5. Fikri Mülkiyet Hakları</strong></p>
          <p>Platform'da yer alan tüm içerik, tasarım, logo, metin ve grafiklerin telif hakları ErgunShop'a aittir. İzinsiz kopyalanamaz, çoğaltılamaz ve kullanılamaz.</p>
        </>
      )
    },
    privacy: {
      title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni',
      text: (
        <>
          <p><strong>1. Veri Sorumlusu</strong></p>
          <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla ErgunShop tarafından işlenmektedir.</p>

          <p><strong>2. İşlenen Kişisel Verileriniz</strong></p>
          <p>Adınız, soyadınız, e-posta adresiniz, telefon numaranız, adres bilgileriniz, IP adresiniz ve işlem güvenliği bilgileriniz platform hizmetlerinden yararlanabilmeniz amacıyla işlenmektedir.</p>

          <p><strong>3. Verilerin İşlenme Amacı</strong></p>
          <p>Kişisel verileriniz; üyelik işlemlerinin gerçekleştirilmesi, sipariş süreçlerinin yönetimi, ödeme işlemlerinin tamamlanması, müşteri hizmetleri desteği sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla işlenmektedir.</p>

          <p><strong>4. Verilerin Aktarımı</strong></p>
          <p>Verileriniz, yalnızca sözleşmesel yükümlülüklerimizin yerine getirilmesi amacıyla yetkili iş ortaklarımızla (kargo firmaları, ödeme kuruluşları vb.) ve yasal talepler doğrultusunda yetkili kamu kurumlarıyla paylaşılabilir.</p>

          <p><strong>5. Haklarınız</strong></p>
          <p>KVKK'nın 11. maddesi kapsamında; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini talep etme, silinmesini veya yok edilmesini isteme haklarına sahipsiniz.</p>
        </>
      )
    }
  }

  const current = content[type] || content.terms

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <h2 className="legal-modal-title">{current.title}</h2>
          <button className="legal-modal-close" onClick={onClose} aria-label="Kapat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="legal-modal-body">
          {current.text}
        </div>
        <div className="legal-modal-footer">
          <button className="legal-modal-btn" onClick={onClose}>Okudum, anladım</button>
        </div>
      </div>
    </div>
  )
}