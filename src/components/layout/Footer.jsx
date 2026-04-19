import './Footer.css'

export default function Footer({ onLoginClick, onRegisterClick, onOrdersClick, onContactClick }) {
  return (
    <>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">ErgunShop</span>
            <p>Kaliteli ürünler, uygun fiyatlar.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Kurumsal</h4>
              <ul>
                <li><a href="#">Hakkımızda</a></li>
                <li><button className="footer-link-btn" onClick={onContactClick}>İletişim</button></li>
                <li><a href="#">Kariyer</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Yardım</h4>
              <ul>
                <li><a href="#">SSS</a></li>
                <li><a href="#">Kargo Takibi</a></li>
                <li><a href="#">İade & Değişim</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Hesabım</h4>
              <ul>
                <li><button className="footer-link-btn" onClick={onLoginClick}>Giriş Yap</button></li>
                <li><button className="footer-link-btn" onClick={onRegisterClick}>Kayıt Ol</button></li>
                <li><button className="footer-link-btn" onClick={onOrdersClick}>Siparişlerim</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ErgunShop. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  )
}
