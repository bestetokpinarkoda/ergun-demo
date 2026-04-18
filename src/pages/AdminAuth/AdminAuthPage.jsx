import AdminRegisterForm from './AdminRegisterForm'
import './AdminAuthPage.css'

export default function AdminAuthPage({ onBack }) {
  return (
    <main className="admin-auth-page">
      <div className="admin-auth-container">
        <button
          type="button"
          className="admin-auth-back"
          onClick={onBack}
          aria-label="Geri dön"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="admin-auth-header">
          <h1 className="admin-auth-title">Satıcı Paneli</h1>
          <p className="admin-auth-desc">
            Ürün ekle, satışları yönet ve işletmeni büyüt.
          </p>
        </div>

        <div className="admin-auth-form-wrap">
          <AdminRegisterForm />
        </div>
      </div>
    </main>
  )
}
