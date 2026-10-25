import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/AuthStore'
import { homeFor } from '../components/RequireRole'
import '../styles/landing.css'

/** Contact channels shown on the page. Leave a value empty to hide that channel. whatsapp = digits only, with country code (e.g. 972501234567). */
const CONTACT = { phone: '', whatsapp: '', email: '' }

const PATHS = {
  home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  tools: 'M14.5 6.5a4 4 0 0 0-5 5L3.5 17.5a1.8 1.8 0 0 0 2.6 2.6l6-6a4 4 0 0 0 5-5l-2.6 2.6-2.4-.6-.6-2.4z',
  phone: 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  medical: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 8v8M8 12h8',
  plane: 'M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5',
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  doc: 'M6 3h7l5 5v13H6zM13 3v5h5M9 13h6M9 17h6',
  chat: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  check: 'M4 12.5l5 5L20 6.5',
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  down: 'M6 9l6 6 6-6',
  arrow: 'M19 12H5M11 6l-6 6 6 6',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
} as const
type IconName = keyof typeof PATHS

function Ico({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

const SERVICES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'home', title: 'ניהול משק הבית', text: 'תשלומי חשבונות, קביעת תורים, תרופות ומרשמים, קניות וסידורים. כל מה שמבלבל מטופל בשבילכם.' },
  { icon: 'tools', title: 'תחזוקת הבית', text: 'אינסטלטור, חשמלאי, טכנאי מיזוג, מנעולן ועוד. נציג מטעמנו מתאם, מלווה את העבודה ובודק את התוצאה.' },
  { icon: 'medical', title: 'ליווי רפואי', text: 'ליווי לרופאים, לבדיקות ולבית המרקחת, והמתנה לצידם. מלווה קבועה שמכירה אותם ואת הצרכים שלהם.' },
  { icon: 'phone', title: 'טכנולוגיה ודיגיטל', text: 'טלפון, טלוויזיה, אינטרנט ו-WhatsApp. מגיעים הביתה, מסדרים ומסבירים בסבלנות.' },
  { icon: 'music', title: 'תרבות ופנאי', text: 'בית קפה, קונצרט, הצגה, מוזיאון, טיול או אירוע משפחתי. מלווים, מסיעים ומחזירים הביתה.' },
  { icon: 'plane', title: 'חופשות ונסיעות', text: 'תיאום מקצה לקצה: כרטיסים, הסעות, מלונות וליווי צמוד לנסיעה.' },
]

const STEPS = [
  { n: '1', title: 'פגישת היכרות', text: 'נציג מטעמנו מגיע, מקשיב, ופותח תיק אישי עם כל הדגשים, ההעדפות והצרכים.' },
  { n: '2', title: 'מלווה קבועה', text: 'מתאימים מלווה אישית שהופכת לפנים מוכרות ואמינות, כבר מתקופת ההיכרות.' },
  { n: '3', title: 'אתם מבקשים, אנחנו מתאמים', text: 'מזמינים, מתאמים ומלווים עד גמר השירות. תמיד באישור הלקוח.' },
  { n: '4', title: 'סיכום ומשוב', text: 'אחרי כל שירות מתקבל סיכום כתוב, ומתבקש משוב כדי לדייק את השירות בפעם הבאה.' },
]

const VALUES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'shield', title: 'אחריות מההזמנה ועד הסיום', text: 'ממשק אחד מולכם. אנחנו מול בעלי המקצוע, עד שהעבודה מסתיימת כמו שצריך.' },
  { icon: 'user', title: 'ביטחון אישי', text: 'אנשים מוכרים בבית, לא זרים. מלווה קבועה ובעלי מקצוע נבחרים בקפידה.' },
  { icon: 'heart', title: 'אהבה וכבוד', text: 'מדברים בגובה העיניים, בסבלנות ובדרך ארץ. הלקוחות שלנו הם כמו בני משפחה.' },
  { icon: 'doc', title: 'שקיפות', text: 'סיכום כתוב אחרי כל שירות וחשבונית חודשית אחת, כך שתמיד ברור מה נעשה.' },
]

const FAMILY = [
  'סיכום כתוב אחרי כל ביקור, בלי לרדוף אחרי עדכונים',
  'תיק אישי שמרכז דגשים, העדפות, תרופות ואנשי קשר',
  'בעלי מקצוע עם רישיון וביטוח בתוקף, ללא ממשק ישיר מול קבלנים',
  'חשבונית חודשית אחת, במקום תשלום לכל ספק בנפרד',
]

const PLANS = [
  { name: 'בסיסי', price: '1,600', note: '4 פגישות בחודש', extra: [] as string[] },
  { name: 'פלטינום', price: '3,500', note: '8 פגישות בחודש', extra: ['עד 3 שעות בכל פגישה'], featured: true },
  { name: 'טופ פלטינום', price: '10,000', note: '12 פגישות בחודש', extra: [] as string[] },
]
const PLAN_SHARED = ['מלווה אישית קבועה', 'תיק אישי עם כל הדגשים והצרכים', 'סיכום כתוב אחרי כל שירות', 'מוקד שירות אחד לכל בקשה']

const REGIONS = ['רמת השרון', 'הרצליה', 'צפון תל אביב', 'רעננה']

const FAQ = [
  { q: 'איך מתחילים?', a: 'קובעים פגישת היכרות קצרה. נציג מטעמנו מגיע, פותח תיק אישי ומתאים מלווה. מתחילים בתקופת היכרות, ומשם ממשיכים בקצב שנוח לכם.' },
  { q: 'מי עובד מול בעלי המקצוע?', a: 'נציג מטעמנו. אנחנו מזמינים, מתאמים, מלווים את העבודה, בודקים את התוצאה ומשלמים לבעל המקצוע. אתם לא צריכים להתמודד מול קבלנים.' },
  { q: 'איך אפשר לסמוך על בעלי המקצוע?', a: 'אנחנו עובדים עם רשת בעלי מקצוע מאושרים. רישיון וביטוח נבדקים, ובעל מקצוע שהרישיון או הביטוח שלו פגו מוקפא אוטומטית ולא משובץ לעבודה.' },
  { q: 'איך המשפחה מתעדכנת?', a: 'אחרי כל שירות מתקבל סיכום כתוב, ובסופו אנחנו מבקשים משוב. כך אפשר לדעת מה נעשה גם כשלא נמצאים בבית.' },
  { q: 'באילו אזורים אתם פועלים?', a: `כרגע ב${REGIONS.slice(0, -1).join(', ')} ו${REGIONS[REGIONS.length - 1]}.` },
  { q: 'איך משלמים?', a: 'מנוי חודשי לפי המסלול, וחשבונית חודשית אחת למזמין/ת השירות. עלות בעלי מקצוע ורכישות נוספת בהתאם להזמנה.' },
]

const logo = (file: string) => `${import.meta.env.BASE_URL}brand/${file}`
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

function useReveal() {
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

function Section({ id, tone, title, lead, children }: { id: string; tone?: 'white' | 'dark'; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className={`lp-section ${tone ?? ''}`}>
      <div className="lp-wrap">
        <header className="lp-head reveal">
          <h2>{title}</h2>
          {lead && <p>{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}

export default function Landing() {
  const { session, role } = useAuth()
  useReveal()
  const enter = session && (role === 'admin' || role === 'companion') ? { to: homeFor(role), label: 'לאזור האישי' } : { to: '/login', label: 'כניסה' }
  const hasContact = Boolean(CONTACT.phone || CONTACT.whatsapp || CONTACT.email)

  return (
    <div className="lp">
      <nav className="lp-nav" aria-label="ניווט ראשי">
        <div className="lp-wrap lp-nav-in">
          <a className="lp-logo" href="#top" aria-label="Family Care — לראש העמוד"><img src={logo('logo-white.png')} alt="Family Care — always with you" /></a>
          <div className="lp-links">
            <a href="#services">שירותים</a>
            <a href="#how">איך זה עובד</a>
            <a href="#plans">מסלולים</a>
            <a href="#faq">שאלות נפוצות</a>
          </div>
          <Link className="lp-btn ghost sm" to={enter.to}>{enter.label}</Link>
        </div>
      </nav>

      <header id="top" className="lp-hero">
        <div className="lp-wrap lp-hero-in">
          <div className="lp-hero-text">
            <span className="lp-eyebrow reveal">מועדון קונסיירז' לגיל השלישי ולמשפחות</span>
            <h1 className="reveal" style={delay(80)}>הורים בטוחים יותר,<br />משפחה רגועה יותר</h1>
            <p className="lp-sub reveal" style={delay(160)}>
              Family Care מלווה את ההורים שלכם בכל מה שצריך: מלווה אישית קבועה, בעלי מקצוע נבחרים וטיפול מלא מההזמנה ועד הסיום. אתם נשארים רגועים.
            </p>
            <div className="lp-cta reveal" style={delay(240)}>
              {hasContact
                ? <a className="lp-btn primary" href="#contact">קבעו שיחת היכרות <Ico name="arrow" size={20} /></a>
                : <Link className="lp-btn primary" to={enter.to}>{enter.label} <Ico name="arrow" size={20} /></Link>}
              <a className="lp-btn ghost" href="#services">מה כלול במועדון</a>
            </div>
            <ul className="lp-trust reveal" style={delay(320)}>
              <li><Ico name="check" size={18} /> מלווה אישית קבועה</li>
              <li><Ico name="check" size={18} /> סיכום כתוב אחרי כל שירות</li>
              <li><Ico name="check" size={18} /> הכול באישור הלקוח</li>
            </ul>
          </div>

          <div className="lp-hero-art reveal" style={delay(200)} aria-hidden="true">
            <div className="lp-orb a" /><div className="lp-orb b" />
            <article className="lp-note">
              <div className="lp-note-top">
                <span className="lp-note-title"><Ico name="doc" size={18} /> סיכום ביקור</span>
                <span className="lp-tag">דוגמה</span>
              </div>
              <div className="lp-note-row"><span className="lp-dot"><Ico name="medical" size={18} /></span><div><strong>ליווי לבדיקת עיניים</strong><small><span className="ltr">09:30–12:00</span> · המלווה הקבועה</small></div></div>
              <p>הכול עבר בשלום. התור הבא נקבע לעוד שלושה חודשים, והתרופות נמסרו הביתה.</p>
              <div className="lp-note-foot"><span className="lp-ok"><Ico name="check" size={16} /> הושלם</span><span>נשלח למשפחה</span></div>
            </article>
            <div className="lp-float"><Ico name="shield" size={18} /> בעלי מקצוע מאושרים</div>
          </div>
        </div>
      </header>

      <Section id="services" title="הכול תחת קורת גג אחת" lead="שירות קונסיירז' אישי שמוריד מכם את העומס היומיומי ומחזיר לכם זמן, רוגע ואיכות חיים.">
        <div className="lp-grid three">
          {SERVICES.map((s, i) => (
            <article key={s.title} className="lp-card reveal" style={delay(i * 60)}>
              <span className="lp-ico"><Ico name={s.icon} /></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="how" tone="white" title="איך זה עובד" lead="פשוט, אישי, ובקצב שלכם.">
        <ol className="lp-steps">
          {STEPS.map((s, i) => (
            <li key={s.n} className="reveal" style={delay(i * 80)}>
              <span className="lp-step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="values" tone="dark" title="למה Family Care" lead="כי ההורים שלכם הם לא מספר בתור. הם משפחה.">
        <div className="lp-grid four">
          {VALUES.map((v, i) => (
            <article key={v.title} className="lp-value reveal" style={delay(i * 70)}>
              <span className="lp-ico on-dark"><Ico name={v.icon} /></span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="family" title="ולכם, הילדים הבוגרים" lead="פחות טלפונים, פחות דאגות, ויותר זמן איכות עם ההורים.">
        <ul className="lp-family reveal">
          {FAMILY.map((f) => (<li key={f}><span className="lp-tick"><Ico name="check" size={18} /></span>{f}</li>))}
        </ul>
      </Section>

      <Section id="plans" tone="white" title="מסלולי חברות" lead="מנוי חודשי לפי רמת השירות. מתאימים את המסלול לצרכים, ואפשר להתקדם בין מסלולים.">
        <div className="lp-grid three plans">
          {PLANS.map((p, i) => (
            <article key={p.name} className={`lp-plan reveal ${p.featured ? 'featured' : ''}`} style={delay(i * 80)}>
              <h3>{p.name}</h3>
              <div className="lp-price"><span className="amt">{p.price}</span><span className="cur">₪</span><span className="per">לחודש</span></div>
              <ul>
                <li><Ico name="check" size={18} /> <strong>{p.note}</strong></li>
                {p.extra.map((e) => (<li key={e}><Ico name="check" size={18} /> <strong>{e}</strong></li>))}
                {PLAN_SHARED.map((f) => (<li key={f}><Ico name="check" size={18} /> {f}</li>))}
              </ul>
            </article>
          ))}
        </div>
        <p className="lp-fine reveal">עלות בעלי מקצוע, רכישות, כרטיסים והסעות נוספת בהתאם להזמנה. פגישה או שעה נוספת — בתיאום.</p>
        <p className="lp-regions reveal"><Ico name="pin" size={18} /> פעילים ב{REGIONS.join(' · ')}</p>
      </Section>

      <Section id="faq" title="שאלות נפוצות">
        <div className="lp-faq reveal">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}<Ico name="down" size={20} /></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section id="contact" className="lp-contact">
        <div className="lp-wrap lp-contact-in reveal">
          <h2>בואו נכיר</h2>
          <p>שיחה קצרה להיכרות, ונתאים את המלווה והמסלול להורים שלכם.</p>
          <div className="lp-cta center">
            {CONTACT.whatsapp && <a className="lp-btn primary" href={`https://wa.me/${CONTACT.whatsapp}`}><Ico name="chat" size={20} /> WhatsApp</a>}
            {CONTACT.phone && <a className="lp-btn primary" href={`tel:${CONTACT.phone}`}><Ico name="call" size={20} /> <span dir="ltr">{CONTACT.phone}</span></a>}
            {CONTACT.email && <a className="lp-btn ghost" href={`mailto:${CONTACT.email}`}><Ico name="mail" size={20} /> {CONTACT.email}</a>}
            {!hasContact && <Link className="lp-btn primary" to={enter.to}>{enter.label} <Ico name="arrow" size={20} /></Link>}
          </div>
          {hasContact && <p className="lp-member">כבר חברים במועדון? <Link to={enter.to}>{enter.label}</Link></p>}
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-in">
          <img src={logo('logo-white.png')} alt="Family Care" height={40} />
          <nav aria-label="קישורים בתחתית העמוד">
            <a href="#services">שירותים</a>
            <a href="#plans">מסלולים</a>
            <a href="#faq">שאלות נפוצות</a>
            <Link to="/login">כניסה</Link>
          </nav>
          <small>© {new Date().getFullYear()} Family Care Services</small>
        </div>
      </footer>
    </div>
  )
}
