import { useState } from 'react'
import SplashScreen from './components/ui/SplashScreen'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/Home/HomePage'
import AuthPage from './pages/Auth/AuthPage'
import AdminAuthPage from './pages/AdminAuth/AdminAuthPage'
import './App.css'

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [view, setView] = useState('home')

  return (
    <>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      {splashDone && (
        <div className="app-layout">
          {view !== 'admin-auth' && <Header onLoginClick={() => setView('auth')} onAdminClick={() => setView('admin-auth')} />}
          {view === 'auth'
            ? <AuthPage onBack={() => setView('home')} />
            : view === 'admin-auth'
            ? <AdminAuthPage onBack={() => setView('home')} />
            : <HomePage />}
          {view !== 'admin-auth' && <Footer />}
        </div>
      )}
    </>
  )
}

export default App
