import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (user) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url, phone')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('profile fetch error', error)
      return null
    }

    if (data) return data

    const meta = user.user_metadata || {}
    const fallback = {
      id: user.id,
      full_name: meta.full_name || meta.name || null,
      role: meta.role || 'customer',
      avatar_url: meta.avatar_url || null,
    }
    const { data: inserted, error: upsertError } = await supabase
      .from('profiles')
      .upsert(fallback, { onConflict: 'id' })
      .select('id, full_name, role, avatar_url, phone')
      .maybeSingle()

    if (upsertError) {
      console.error('profile upsert error', upsertError)
      return fallback
    }
    return inserted || fallback
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        const p = await fetchProfile(data.session.user)
        if (active) setProfile(p)
      }
      if (active) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      if (event === 'SIGNED_OUT' || !newSession?.user) {
        setProfile(null)
        return
      }
      // Deadlock'u önlemek için supabase çağrılarını callback dışına al
      setTimeout(async () => {
        if (!active) return
        const p = await fetchProfile(newSession.user)
        if (active) setProfile(p)
      }, 0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signUp = useCallback(async ({ email, password, fullName, role }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signInWithOAuth = useCallback(async (provider) => {
    const options = {
      redirectTo: `${window.location.origin}/`,
    }
    if (provider === 'google') {
      options.queryParams = { prompt: 'select_account' }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({ provider, options })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    setSession(null)
    setProfile(null)
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) console.error('signOut error', error)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!session?.user) throw new Error('Oturum bulunamadı')
    const payload = { ...updates, updated_at: new Date().toISOString() }
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', session.user.id)
      .select('id, full_name, role, avatar_url, phone')
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }, [session])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
