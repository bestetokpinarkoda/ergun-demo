# E-Ticaret Demo Projesi

Bu proje, basit bir e‑ticaret demo uygulaması için modern bir klasör yapısı ve Supabase entegrasyonu sunar.

## Nasıl Çalıştırılır

```bash
npm install
npm run dev
```

## Proje Klasör Yapısı

- `src/` – Uygulama kaynak kodları.
  - `components/` – Yeniden kullanılabilir UI bileşenleri (ui, layout, product, cart, checkout, auth).
  - `pages/` – Sayfa bileşenleri (Home, Product, Cart, Checkout, Account, Admin).
  - `hooks/` – Özel React hookları.
  - `store/` – Durum yönetimi (Context API).
  - `utils/` – Yardımcı fonksiyonlar.
  - `config/` – Konfigürasyon dosyaları (rotalar, ortam ayarları).
  - `styles/` – Global ve bileşen stilleri.
  - `lib/` – Supabase client (`supabase.js`).
- `public/` – Statik dosyalar (favicon, logo vb.).
- `assets/` – Tasarım varlıkları (fontlar, görseller, mockup’lar).
- `README.md` – Proje dokümantasyonu.

## Supabase Entegrasyonu

Supabase, veri depolama ve kimlik doğrulama için kullanılır. `src/lib/supabase.js` dosyasında client oluşturulmuş olup, uygulamanın her yerinden `import { supabase } from "./lib/supabase"` ile erişilebilir. `.env` dosyasına `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` eklemeyi unutmayın.

## İleriki Adımlar

- Ürün, sepet ve ödeme akışlarını Supabase tabloları ve RPC’leri ile geliştirmek.
- Gelişmiş UI bileşenleri ve animasyonlar eklemek.
- Gerektiğinde admin paneli ve ek sayfalar eklemek.


Bu proje, basit bir e‑ticaret demo uygulaması için temel klasör yapısını içerir.


