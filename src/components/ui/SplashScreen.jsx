import { useEffect, useState } from 'react'
import './SplashScreen.css'

export default function SplashScreen({ onFinish }) {
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHiding(true), 2000)
    const done = setTimeout(() => onFinish(), 2600)
    return () => {
      clearTimeout(timer)
      clearTimeout(done)
    }
  }, [onFinish])

  return (
    <div className={`splash ${hiding ? 'splash--hide' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">ErgunShop</div>
        <div className="splash-tagline">Alışverişin en kolay hali</div>
        <div className="splash-loader">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
