import { useState, useEffect } from 'react'
import SplashScreen from './components/ui/SplashScreen'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/Home/HomePage'
import AuthPage from './pages/Auth/AuthPage'
import AdminAuthPage from './pages/AdminAuth/AdminAuthPage'
import ProductPage from './pages/Product/ProductPage'
import CartPage from './pages/Cart/CartPage'
import FavoritesPage from './pages/Favorites/FavoritesPage'
import ProfilePage from './pages/CustomerProfile/ProfilePage'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import SupplierDashboard from './pages/SupplierDashboard/SupplierDashboard'
import CategoryPage from './pages/Category/CategoryPage'
import ContactPage from './pages/Contact/ContactPage'
import BecomeSupplierPage from './pages/BecomeSupplier/BecomeSupplierPage'
import LoginModal from './components/ui/LoginModal'
import ChatWidget from './components/ui/ChatWidget'
import { AppProvider } from './store/AppContext'
import { useAuth } from './contexts/AuthContext'
import './App.css'

const CHROMELESS_VIEWS = new Set(['auth', 'admin-auth', 'admin-dashboard', 'supplier-dashboard'])

function App() {
  const { user, role } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [view, setView] = useState('home')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [authTab, setAuthTab] = useState('login')
  const [profileTab, setProfileTab] = useState('info')

  const navigateTo = (v, params = {}) => {
    setView(v)
    if (params.productId !== undefined) setSelectedProductId(params.productId)
    if (params.category !== undefined) setSelectedCategory(params.category)
    if (params.tab !== undefined) {
      if (v === 'profile') setProfileTab(params.tab)
      else setAuthTab(params.tab)
    }
    window.scrollTo(0, 0)
  }

  const renderView = () => {
    switch (view) {
      case 'auth':            return <AuthPage onBack={() => navigateTo('home')} initialTab={authTab} />
      case 'admin-auth':      return <AdminAuthPage onBack={() => navigateTo('home')} />
      case 'admin-dashboard': return <AdminDashboard onExit={() => navigateTo('home')} />
      case 'supplier-dashboard': return <SupplierDashboard onExit={() => navigateTo('home')} />
      case 'product':         return <ProductPage productId={selectedProductId} onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'cart':       return <CartPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'favorites':  return <FavoritesPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'profile':    return <ProfilePage onBack={() => navigateTo('home')} initialTab={profileTab} />
      case 'category':   return <CategoryPage category={selectedCategory} onBack={() => navigateTo('home')} onProductClick={(id) => navigateTo('product', { productId: id })} />
      case 'contact':         return <ContactPage onBack={() => navigateTo('home')} />
      case 'become-supplier': return <BecomeSupplierPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      default:           return <HomePage onProductClick={(id) => navigateTo('product', { productId: id })} />
    }
  }

  useEffect(() => {
    if (!user && (view === 'profile' || view === 'admin-dashboard' || view === 'supplier-dashboard')) {
      setView('home')
      return
    }
    if (user && (view === 'auth' || view === 'admin-auth')) {
      if (role === 'admin') setView('admin-dashboard')
      else if (role === 'supplier') setView('supplier-dashboard')
      else setView('home')
      return
    }
    if (role === 'admin' && view === 'home') {
      setView('admin-dashboard')
    }
    if (role === 'supplier' && view === 'home') {
      setView('supplier-dashboard')
    }
  }, [user, role, view])

  const showChrome = !CHROMELESS_VIEWS.has(view)

  return (
    <AppProvider>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && (
        <div className="app-layout">
          {showChrome && (
            <Header
              onLoginClick={() => navigateTo('auth')}
              onAdminClick={() => navigateTo('admin-auth')}
              onHomeClick={() => navigateTo('home')}
              onCartClick={() => navigateTo('cart')}
              onFavClick={() => navigateTo('favorites')}
              onProfileClick={() => navigateTo('profile')}
              onCategoryClick={(cat) => navigateTo('category', { category: cat })}
              onProductClick={(id) => navigateTo('product', { productId: id })}
              onBecomeSupplierClick={() => navigateTo('become-supplier')}
            />
          )}
          {renderView()}
          {showChrome && (
            <Footer
              onLoginClick={() => navigateTo('auth', { tab: 'login' })}
              onRegisterClick={() => navigateTo('auth', { tab: 'register' })}
              onOrdersClick={() => user ? navigateTo('profile') : navigateTo('auth', { tab: 'login' })}
              onContactClick={() => navigateTo('contact')}
            />
          )}
          {showChrome && <ChatWidget onProductClick={(id) => navigateTo('product', { productId: id })} />}
        </div>
      )}
      <LoginModal />
    </AppProvider>
  )
}

export default App
