import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const CartContext = createContext(null)
const FavContext = createContext(null)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [favItems, setFavItems] = useState([])
  const [savedAddresses, setSavedAddresses] = useState([])

  useEffect(() => {
    if (!user) {
      setFavItems([])
      return
    }
    supabase
      .from('favorites')
      .select('product_data')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setFavItems(data.map(r => r.product_data))
      })
  }, [user?.id])

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

  const clearCart = () => setCartItems([])

  const toggleFavorite = async (product) => {
    const isAlreadyFav = favItems.some(i => i.id === product.id)
    setFavItems(prev =>
      isAlreadyFav
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    )
    if (!user) return
    if (isAlreadyFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', String(product.id))
    } else {
      await supabase.from('favorites').upsert({ user_id: user.id, product_id: String(product.id), product_data: product })
    }
  }

  const addAddress = (addr) => setSavedAddresses(prev => [...prev, addr])
  const removeAddress = (idx) => setSavedAddresses(prev => prev.filter((_, i) => i !== idx))
  const editAddress = (idx, addr) => setSavedAddresses(prev => prev.map((a, i) => i === idx ? addr : a))

  const isFavorite = (id) => favItems.some(i => i.id === id)
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const favCount = favItems.length

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQty, clearCart, cartCount, savedAddresses, addAddress, removeAddress, editAddress }}>
      <FavContext.Provider value={{ favItems, toggleFavorite, isFavorite, favCount }}>
        {children}
      </FavContext.Provider>
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
export const useFav = () => useContext(FavContext)
export { useAuth } from '../contexts/AuthContext'
