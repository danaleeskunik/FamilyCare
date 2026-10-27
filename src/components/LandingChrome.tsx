import { useEffect, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthStore'
import { homeFor, hasHome } from '../lib/sections'
import { CONTACT, mailHref, telHref, waHref } from '../lib/contact'
import '../styles/landing.css'

const PATHS = {
  home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  tools: 'M14.5 6.5a4 4 0 0 0-5 5L3.5 17.5a1.8 1.8 0 0 0 2.6 2.6l6-6a4 4 0 0 0 5-5l-2.6 2.6-2.4-.6-.6-2.4z',
  phone: 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  medical: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 8v8M8 12h8',
  legal: 'M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zM19 7l-2.5 6a3 3 0 0 0 5 0L19 7z',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6.5 6.5 0 0 1 3.5 6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  doc: 'M6 3h7l5 5v13H6zM13 3v5h5M9 13h6M9 17h6',
  chat: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  check: 'M4 12.5l5 5L20 6.5',
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  down: 'M6 9l6 6 6-6',
  arrow: 'M19 12H5M11 6l-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
} as const
export type IconName = keyof typeof PATHS

export function Ico({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export const logo = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`
export const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function useReveal() {
  useEffect(() => {
    const root = document.querySelector('.lp')
    if (!root) return
    root.classList.add('js')
    const els = root.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

/** Web links (WhatsApp) open in a new tab so the visitor keeps the site open. */
const extLink = (href: string) => (/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})

/** One contact button. Without a configured value it renders as a visible-but-inactive "coming soon" button. */
export function ContactBtn({ href, icon, variant = 'primary', children }: { href: string | null; icon: IconName; variant?: 'primary' | 'ghost'; children: ReactNode }) {
  if (href) return <a className={`lp-btn ${variant}`} href={href} {...extLink(href)}><Ico name={icon} size={20} /> {children}</a>
  return <span className={`lp-btn ${variant} pending`} role="link" aria-disabled="true" title="פרטי הקשר יתווספו בקרוב"><Ico name={icon} size={20} /> {children}</span>
}

/** Logo click: on the home page scroll back to the top (a Link to the current route does nothing); elsewhere navigate home. */
function useLogoTop() {
  const { pathname } = useLocation()
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return
    e.preventDefault()
    history.replaceState(null, '', '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function LpNav({ onPolicy }: { onPolicy?: boolean }) {
  const { session, role, sections } = useAuth()
  const toTop = useLogoTop()
  const enter = session && hasHome(role) ? { to: homeFor(role, sections), label: 'לאזור האישי' } : { to: '/login', label: 'כניסה' }
  return (
    <nav className="lp-nav" aria-label="ניווט ראשי">
      <div className="lp-wrap lp-nav-in">
        <Link className="lp-logo" to="/" onClick={toTop} aria-label="Family Care — לדף הבית"><img src={logo('logo-white.png')} alt="Family Care — always with you" /></Link>
        {!onPolicy && (
          <div className="lp-links">
            <a href="#about">אודות</a>
            <a href="#services">שירותים</a>
            <a href="#how">איך זה עובד</a>
            <a href="#plans">מסלולים</a>
            <a href="#faq">שאלות נפוצות</a>
          </div>
        )}
        <div className="lp-nav-end">
          {onPolicy ? <Link className="lp-btn ghost sm" to="/">לדף הבית</Link> : <a className="lp-btn primary sm lp-nav-contact" href="#contact">צרו קשר</a>}
          <Link className="lp-btn ghost sm" to={enter.to}>{enter.label}</Link>
        </div>
      </div>
    </nav>
  )
}

export function LpFooter({ onPolicy }: { onPolicy?: boolean }) {
  const toTop = useLogoTop()
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-in">
          <Link to="/" onClick={toTop} aria-label="Family Care — לתחילת הדף"><img src={logo('logo-white.png')} alt="Family Care" height={40} /></Link>
          <nav aria-label="קישורים בתחתית העמוד">
            {onPolicy ? <Link to="/">דף הבית</Link> : (<><a href="#about">אודות</a><a href="#services">שירותים</a><a href="#plans">מסלולים</a><a href="#faq">שאלות נפוצות</a></>)}
            <Link to="/policy">מדיניות החברה</Link>
            <Link to="/login">כניסה</Link>
          </nav>
        </div>
        <div className="lp-foot-contact">
          <ContactBtn href={waHref} icon="chat" variant="ghost">WhatsApp</ContactBtn>
          <ContactBtn href={mailHref} icon="mail" variant="ghost">{CONTACT.email || 'מייל'}</ContactBtn>
          {telHref && <ContactBtn href={telHref} icon="call" variant="ghost"><span dir="ltr">{CONTACT.phone}</span></ContactBtn>}
        </div>
        <small>© {new Date().getFullYear()} Family Care Services. כל הזכויות שמורות.</small>
      </div>
    </footer>
  )
}

/** Floating shortcut to contact: opens WhatsApp when configured, otherwise scrolls to the contact section. */
export function FloatingContact({ toSection }: { toSection?: boolean }) {
  const href = waHref ?? (toSection ? '#contact' : mailHref)
  if (!href) return null
  return <a className="lp-fab" href={href} {...extLink(href)} aria-label="יצירת קשר"><Ico name="chat" size={22} /> <span>צרו קשר</span></a>
}
