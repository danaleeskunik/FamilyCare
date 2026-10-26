import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type Role = 'admin' | 'companion' | 'family' | 'office'
type Auth = {
  session: Session | null
  role: Role | null
  /** Sections an office user may open (admins can open everything). */
  sections: string[]
  can: (section: string) => boolean
  fullName: string
  loading: boolean
  /** Resolves to an error message, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const Ctx = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<{ role: Role; fullName: string; sections: string[] } | null>(null)
  const [ready, setReady] = useState(false) // initial getSession finished
  const [profileLoading, setProfileLoading] = useState(false)
  const [loadedUid, setLoadedUid] = useState<string | null>(null) // user whose profile has finished loading

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
    // "sections" arrives with migration 0014: fall back to the old shape so nobody is locked out before it runs.
    void (async () => {
      let res = await supabase.from('profiles').select('role, full_name, sections').eq('id', uid).maybeSingle()
      if (res.error) res = (await supabase.from('profiles').select('role, full_name').eq('id', uid).maybeSingle()) as typeof res
      if (cancelled) return
      if (res.error) console.error('profile load failed', res.error)
      const d = res.data as { role: string; full_name: string; sections?: string[] | null } | null
      setProfile(d ? { role: d.role as Role, fullName: d.full_name, sections: d.sections ?? [] } : null)
      setLoadedUid(uid)
      setProfileLoading(false)
    })()
    return () => { cancelled = true }
  }, [uid])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (!error) return null
    return error.status === 400 ? 'האימייל או הסיסמה שגויים' : 'לא הצלחנו להתחבר. נסי שוב בעוד רגע.'
  }, [])

  const signOut = useCallback(async () => { await supabase.auth.signOut() }, [])

  const value = useMemo<Auth>(() => ({
    session, role: profile?.role ?? null, sections: profile?.sections ?? [],
    can: (section: string) => profile?.role === 'admin' || (profile?.role === 'office' && profile.sections.includes(section)),
    fullName: profile?.fullName ?? '', loading: !ready || profileLoading || (!!session && loadedUid !== session.user.id), signIn, signOut,
  }), [session, profile, ready, profileLoading, loadedUid, signIn, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const a = useContext(Ctx)
  if (!a) throw new Error('useAuth must be used inside AuthProvider')
  return a
}
