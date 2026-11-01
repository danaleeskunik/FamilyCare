import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getChoice, isPublicPath, setChoice, trackContactClick, trackPage } from '../lib/analytics'

/** Cookie notice + page-view tracking for the public pages. Accept and decline carry equal weight. */
export default function AnalyticsConsent() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => getChoice() === null)
  const pub = isPublicPath(pathname)

  useEffect(() => { trackPage(pathname) }, [pathname])
  useEffect(() => {
    document.addEventListener('click', trackContactClick)
    const reopen = () => setOpen(true)
    window.addEventListener('fc-consent-open', reopen)
    return () => { document.removeEventListener('click', trackContactClick); window.removeEventListener('fc-consent-open', reopen) }
  }, [])

  if (!open || !pub) return null
  const choose = (v: 'yes' | 'no') => { setChoice(v); setOpen(false); if (v === 'yes') trackPage(pathname) }
  return (
    <section className="fc-consent" role="region" aria-label="הודעה על עוגיות">
      <p>האתר משתמש בעוגיות של Google Analytics כדי להבין איך משתמשים בו ולשפר אותו, ללא פרטים מזהים. אפשר לסרב והאתר ימשיך לעבוד כרגיל. <Link to="/policy#sec-7">פרטים נוספים</Link></p>
      <div>
        <button type="button" onClick={() => choose('yes')}>מאשרים</button>
        <button type="button" onClick={() => choose('no')}>לא, תודה</button>
      </div>
    </section>
  )
}
