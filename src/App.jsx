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
import LoginModal from './components/ui/LoginModal'
import { AppProvider } from './store/AppContext'
import { useAuth } from './contexts/AuthContext'
import './App.css'

const CHROMELESS_VIEWS = new Set(['auth', 'admin-auth', 'admin-dashboard'])

function App() {
  const { user, role } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [view, setView] = useState('home')
  const [selectedProductId, setSelectedProductId] = useState(null)

  const navigateTo = (v, params = {}) => {
    setView(v)
    if (params.productId !== undefined) setSelectedProductId(params.productId)
    window.scrollTo(0, 0)
  }

  const renderView = () => {
    switch (view) {
      case 'auth':            return <AuthPage onBack={() => navigateTo('home')} />
      case 'admin-auth':      return <AdminAuthPage onBack={() => navigateTo('home')} />
      case 'admin-dashboard': return <AdminDashboard onExit={() => navigateTo('home')} />
      case 'product':         return <ProductPage productId={selectedProductId} onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'cart':       return <CartPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'favorites':  return <FavoritesPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'profile':    return <ProfilePage onBack={() => navigateTo('home')} />
      default:           return <HomePage onProductClick={(id) => navigateTo('product', { productId: id })} />
    }
  }

  useEffect(() => {
    if (!user && (view === 'profile' || view === 'admin-dashboard')) {
      setView('home')
      return
    }
    if (user && (view === 'auth' || view === 'admin-auth')) {
      setView(role === 'admin' ? 'admin-dashboard' : 'home')
      return
    }
    if (role === 'admin' && view === 'home') {
      setView('admin-dashboard')
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
            />
          )}
          {renderView()}
          {showChrome && <Footer />}
        </div>
      )}
      <LoginModal />
    </AppProvider>
  )
}

export default App
