import { createContext, useContext, useRef, useState } from 'react'

const CartContext = createContext(null)
const FavContext = createContext(null)
const AuthContext = createContext(null)

export function AppProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [favItems, setFavItems] = useState([])
  const [user, setUser] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const pendingActionRef = useRef(null)

  const requireAuth = (callback) => {
    if (user) { callback() }
    else { pendingActionRef.current = callback; setLoginModalOpen(true) }
  }

  const login = (userData) => {
    setUser(userData)
    setLoginModalOpen(false)
    if (pendingActionRef.current) { pendingActionRef.current(); pendingActionRef.current = null }
  }

  const logout = () => {
    setUser(null)
    setCartItems([])
    setFavItems([])
    setSavedAddresses([])
  }

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }))

  const openLoginModal = () => setLoginModalOpen(true)
  const closeLoginModal = () => { setLoginModalOpen(false); pendingActionRef.current = null }

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
  }

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id))

  const updateCartQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const toggleFavorite = (product) => {
    setFavItems(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    )
  }

  const addAddress = (addr) => setSavedAddresses(prev => [...prev, addr])
  const removeAddress = (idx) => setSavedAddresses(prev => prev.filter((_, i) => i !== idx))
  const editAddress = (idx, addr) => setSavedAddresses(prev => prev.map((a, i) => i === idx ? addr : a))

  const isFavorite = (id) => favItems.some(i => i.id === id)
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const favCount = favItems.length

  return (
    <AuthContext.Provider value={{
      user, login, logout, updateUser, requireAuth,
      openLoginModal, closeLoginModal, loginModalOpen,
      savedAddresses, addAddress, removeAddress, editAddress,
    }}>
      <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQty, cartCount }}>
        <FavContext.Provider value={{ favItems, toggleFavorite, isFavorite, favCount }}>
          {children}
        </FavContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
export const useFav = () => useContext(FavContext)
export const useAuth = () => useContext(AuthContext)
