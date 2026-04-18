import { useState, useEffect } from 'react'
import SplashScreen from './components/ui/SplashScreen'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/Home/HomePage'
import AuthPage from './pages/Auth/AuthPage'
import AdminAuthPage from './pages/AdminAuth/AdminAuthPage'
import ProfilePage from './pages/CustomerProfile/ProfilePage'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import { useAuth } from './contexts/AuthContext'
import './App.css'

const CHROMELESS_VIEWS = new Set(['auth', 'admin-auth', 'admin-dashboard'])

function App() {
  const { user, role } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [view, setView] = useState('home')

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
    <>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && (
        <div className="app-layout">
          {showChrome && (
            <Header
              onLoginClick={() => setView('auth')}
              onAdminClick={() => setView('admin-auth')}
              onProfileClick={() => setView('profile')}
            />
          )}
          {view === 'auth'
            ? <AuthPage onBack={() => setView('home')} />
            : view === 'admin-auth'
            ? <AdminAuthPage onBack={() => setView('home')} />
            : view === 'admin-dashboard'
            ? <AdminDashboard onExit={() => setView('home')} />
            : view === 'profile'
            ? <ProfilePage onLogout={() => setView('home')} />
            : <HomePage />}
          {showChrome && <Footer />}
        </div>
      )}
    </>
  )
}

export default App
