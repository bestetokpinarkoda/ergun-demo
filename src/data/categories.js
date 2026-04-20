export const CATEGORIES = [
  { slug: 'beauty',              label: 'Güzellik',             icon: '💄' },
  { slug: 'fragrances',          label: 'Parfüm',               icon: '🌸' },
  { slug: 'furniture',           label: 'Mobilya',              icon: '🛋️' },
  { slug: 'groceries',           label: 'Market',               icon: '🛒' },
  { slug: 'home-decoration',     label: 'Ev & Dekor',           icon: '🏠' },
  { slug: 'kitchen-accessories', label: 'Mutfak',               icon: '🍳' },
  { slug: 'laptops',             label: 'Laptop',               icon: '💻' },
  { slug: 'mens-shirts',         label: 'Erkek Gömlek',         icon: '👔' },
  { slug: 'mens-shoes',          label: 'Erkek Ayakkabı',       icon: '👟' },
  { slug: 'mens-watches',        label: 'Erkek Saat',           icon: '⌚' },
  { slug: 'mobile-accessories',  label: 'Telefon Aksesuarları', icon: '🔌' },
  { slug: 'motorcycle',          label: 'Motosiklet',           icon: '🏍️' },
  { slug: 'skin-care',           label: 'Cilt Bakımı',          icon: '✨' },
  { slug: 'smartphones',         label: 'Akıllı Telefon',       icon: '📱' },
  { slug: 'sports-accessories',  label: 'Spor',                 icon: '⚽' },
  { slug: 'sunglasses',          label: 'Güneş Gözlüğü',       icon: '🕶️' },
  { slug: 'tablets',             label: 'Tablet',               icon: '📟' },
  { slug: 'tops',                label: 'Üst Giyim',            icon: '👕' },
  { slug: 'vehicle',             label: 'Araç',                 icon: '🚗' },
  { slug: 'womens-bags',         label: 'Kadın Çanta',          icon: '👜' },
  { slug: 'womens-dresses',      label: 'Elbise',               icon: '👗' },
  { slug: 'womens-jewellery',    label: 'Takı',                 icon: '💍' },
  { slug: 'womens-shoes',        label: 'Kadın Ayakkabı',       icon: '👠' },
  { slug: 'womens-watches',      label: 'Kadın Saat',           icon: '⌚' },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]))
export const CATEGORY_LABELS  = Object.fromEntries(CATEGORIES.map(c => [c.slug, c.label]))
export const CATEGORY_ICONS   = Object.fromEntries(CATEGORIES.map(c => [c.slug, c.icon]))
