import { useState } from 'react'
import SplashScreen from './components/ui/SplashScreen'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/Home/HomePage'
import AuthPage from './pages/Auth/AuthPage'
import AdminAuthPage from './pages/AdminAuth/AdminAuthPage'
import ProductPage from './pages/Product/ProductPage'
import CartPage from './pages/Cart/CartPage'
import FavoritesPage from './pages/Favorites/FavoritesPage'
import ProfilePage from './pages/Profile/ProfilePage'
import LoginModal from './components/ui/LoginModal'
import { AppProvider } from './store/AppContext'
import './App.css'

function App() {
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
      case 'auth':       return <AuthPage onBack={() => navigateTo('home')} />
      case 'admin-auth': return <AdminAuthPage onBack={() => navigateTo('home')} />
      case 'product':    return <ProductPage productId={selectedProductId} onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'cart':       return <CartPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'favorites':  return <FavoritesPage onBack={() => navigateTo('home')} onNavigate={navigateTo} />
      case 'profile':    return <ProfilePage onBack={() => navigateTo('home')} />
      default:           return <HomePage onProductClick={(id) => navigateTo('product', { productId: id })} />
    }
  }

  return (
    <AppProvider>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && (
        <div className="app-layout">
          {view !== 'admin-auth' && (
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
          {view !== 'admin-auth' && <Footer />}
        </div>
      )}
      <LoginModal />
    </AppProvider>
  )
}

export default App
