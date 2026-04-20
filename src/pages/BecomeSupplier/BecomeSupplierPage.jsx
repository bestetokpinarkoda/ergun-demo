import { useAuth } from '../../store/AppContext'
import './BecomeSupplierPage.css'

const STEPS = [
  {
    id: 1,
    title: 'Hesap Oluştur',
    desc: 'Sisteme ücretsiz kayıt olun ya da mevcut hesabınızla giriş yapın.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Başvuru Formunu Doldurun',
    desc: 'Şirket adı, vergi numarası ve iletişim bilgilerinizi eksiksiz girin.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Belgelerinizi Yükleyin',
    desc: 'Vergi levhası ve imza sirkülerini sisteme yükleyin.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'İnceleme Sürecini Bekleyin',
    desc: 'Ekibimiz başvurunuzu 2–3 iş günü içinde inceler ve size bildirim gönderir.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Satışa Başlayın',
    desc: 'Onaylandıktan sonra ürünlerinizi ekleyin, mağazanızı yönetin ve kazanmaya başlayın.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
]

export default function BecomeSupplierPage({ onBack, onNavigate }) {
  const { user } = useAuth()

  return (
    <main className="bs-page">
      <div className="bs-container">

        <div className="bs-breadcrumb">
          <button className="bs-breadcrumb-link" onClick={onBack}>Ana Sayfa</button>
          <span className="bs-breadcrumb-sep">›</span>
          <span>Satıcı Ol</span>
        </div>

        <div className="bs-hero">
          <h1 className="bs-hero-title">Satıcı Olun, Kazanmaya Başlayın</h1>
          <p className="bs-hero-sub">
            Milyonlarca müşteriye ulaşın. Kolay kurulum, güçlü araçlar, sıfır komisyon ilk 3 ay.
          </p>
        </div>

        <div className="bs-steps">
          {STEPS.map((step, idx) => {
            const done = step.id === 1 && !!user
            return (
              <div key={step.id} className={`bs-step ${done ? 'bs-step--done' : ''}`}>
                <div className="bs-step-left">
                  <div className="bs-step-bubble">
                    {done
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      : <span className="bs-step-num">{step.id}</span>
                    }
                  </div>
                  {idx < STEPS.length - 1 && <div className="bs-step-line" />}
                </div>
                <div className="bs-step-body">
                  <div className="bs-step-icon">{step.icon}</div>
                  <div className="bs-step-text">
                    <h3 className="bs-step-title">{step.title}</h3>
                    <p className="bs-step-desc">{step.desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bs-cta-wrap">
          <button className="bs-cta-btn" onClick={() => onNavigate('admin-auth')}>
            Şimdi Başvur
          </button>
          <p className="bs-cta-note">Başvuru ücretsizdir. Onay sonrası otomatik olarak tedarikçi panelinize yönlendirilirsiniz.</p>
        </div>

      </div>
    </main>
  )
}
