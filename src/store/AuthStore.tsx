import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Role = 'admin' | 'companion' | 'client'
type Auth = {
  session: Session | null
  role: Role | null
  fullName: string
  loading: boolean
  /** Resolves to an error message, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const Ctx = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<{ role: Role; fullName: string } | null>(null)
  const [ready, setReady] = useState(false) // initial getSession finished
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const uid = session?.user.id
  useEffect(() => {
    let cancelled = false
    if (!uid) {
      setProfile(null)
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    supabase.from('profiles').select('role, full_name').eq('id', uid).maybeSingle().then(({ data, error }) => {
      if (cancelled) return
      if (error) console.error('profile load failed', error)
      setProfile(data ? { role: data.role as Role, fullName: data.full_name } : null)
      setProfileLoading(false)
    })
    return () => { cancelled = true }
  }, [uid])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (!error) return null
    return error.status === 400 ? 'האימייל או הסיסמה שגויים' : 'לא הצלחנו להתחבר. נסי שוב בעוד רגע.'
  }, [])

  const signOut = useCallback(async () => { await supabase.auth.signOut() }, [])

  const value = useMemo<Auth>(() => ({
    session, role: profile?.role ?? null, fullName: profile?.fullName ?? '', loading: !ready || profileLoading, signIn, signOut,
  }), [session, profile, ready, profileLoading, signIn, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const a = useContext(Ctx)
  if (!a) throw new Error('useAuth must be used inside AuthProvider')
  return a
}
