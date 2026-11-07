/** Google Analytics 4 for the public site only. Loads after the visitor accepts; never on /admin, /client, /login. */
const GA_ID = 'G-T83P9PH6F3'
const KEY = 'fc-analytics'
const PUBLIC_PATHS = ['/', '/policy', '/accessibility']

type Choice = 'yes' | 'no' | null
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; [k: string]: unknown } }

export const isPublicPath = (p: string) => PUBLIC_PATHS.includes(p.replace(/\/+$/, '') || '/')

export function getChoice(): Choice {
  try { const v = localStorage.getItem(KEY); return v === 'yes' || v === 'no' ? v : null } catch { return null }
}

let loaded = false
function load() {
  if (loaded) return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer!.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
}

export function setChoice(v: 'yes' | 'no') {
  try { localStorage.setItem(KEY, v) } catch { /* private mode: choice lasts for this visit only */ }
  if (v === 'yes') { window[`ga-disable-${GA_ID}`] = false; load(); return }
  window[`ga-disable-${GA_ID}`] = true
  document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => n === '_ga' || n.startsWith('_ga_'))
    .forEach((n) => { document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${location.hostname}`; document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` })
}

export function trackPage(path: string) {
  if (getChoice() !== 'yes' || !isPublicPath(path)) return
  load()
  window.gtag!('event', 'page_view', { page_path: path, page_location: location.origin + path, page_title: document.title })
}

/** Contact-button clicks are the leads we measure. */
export function trackContactClick(e: MouseEvent) {
  if (getChoice() !== 'yes' || !isPublicPath(location.pathname)) return
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  const h = a?.getAttribute('href') ?? ''
  const name = /^https:\/\/wa\.me\//.test(h) ? 'whatsapp_click' : h.startsWith('tel:') ? 'phone_click' : h.startsWith('mailto:') ? 'email_click' : null
  if (!name) return
  load()
  window.gtag!('event', name, { page_path: location.pathname })
}

/** A submitted contact form is the lead we care most about. */
export function trackLead() {
  if (getChoice() !== 'yes' || !isPublicPath(location.pathname)) return
  load()
  window.gtag!('event', 'generate_lead', { page_path: location.pathname })
}

export const reopenConsent = () => window.dispatchEvent(new Event('fc-consent-open'))
