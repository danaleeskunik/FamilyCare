import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { CONTACT, mailHref, telHref, waHref } from '../lib/contact'
import { ContactBtn, FloatingContact, Ico, LpFooter, LpNav, delay, type IconName, useReveal } from '../components/LandingChrome'

const SERVICES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'home', title: 'ניהול משק הבית', text: 'תשלומי חשבונות, קביעת תורים, תרופות ומרשמים, קניות וסידורים. כל מה שמבלבל מטופל בשבילכם.' },
  { icon: 'tools', title: 'תחזוקת הבית', text: 'אינסטלטור, חשמלאי, טכנאי מיזוג, מנעולן ועוד. נציג מטעמנו מתאם, מלווה את העבודה ובודק את התוצאה.' },
  { icon: 'medical', title: 'ליווי רפואי', text: 'ליווי לרופאים, לבדיקות ולבית המרקחת, והמתנה לצידם. מלווה קבועה שמכירה אותם ואת הצרכים שלהם.' },
  { icon: 'phone', title: 'טכנולוגיה ודיגיטל', text: 'טלפון, טלוויזיה, אינטרנט ו-WhatsApp. מגיעים הביתה, מסדרים ומסבירים בסבלנות.' },
  { icon: 'music', title: 'תרבות ופנאי', text: 'בית קפה, קונצרט, הצגה, מוזיאון, טיול או אירוע משפחתי. וגם חופשות: תיאום מקצה לקצה של כרטיסים, הסעות, מלונות וליווי צמוד לנסיעה.' },
  { icon: 'legal', title: 'ליווי משפטי וביורוקרטי', text: 'הכנת מסמכים, חיבור לעורכי דין ולאנשי מקצוע מתאימים, וליווי לפגישות והליכים.' },
]

const STEPS = [
  { n: '1', title: 'פגישת היכרות', text: 'נציג מטעמנו מגיע, מקשיב, ופותח תיק אישי עם כל הדגשים, ההעדפות והצרכים.' },
  { n: '2', title: 'מלווה קבועה', text: 'מתאימים מלווה אישית שהופכת לפנים מוכרות ואמינות, כבר מתקופת ההיכרות.' },
  { n: '3', title: 'פגישות קבועות לפי תכנית, ובנוסף לפי הצורך', text: 'מפגשים קבועים בקצב שבחרתם, ובנוסף שירותים לפי הצורך. אנחנו מזמינים, מתאמים ומלווים עד גמר השירות, תמיד באישור הלקוח.' },
  { n: '4', title: 'סיכום ומשוב', text: 'אחרי כל שירות מתקבל סיכום כתוב, ומתבקש משוב כדי לדייק את השירות בפעם הבאה.' },
]

const VALUES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'heart', title: 'איכות חיים להורים', text: 'ליווי חם ואישי שמחזיר להורים שמחת חיים, עצמאות ותחושת ביטחון, בבית ומחוצה לו.' },
  { icon: 'user', title: 'ביטחון אישי', text: 'אנשים מוכרים בבית, לא זרים. מלווה קבועה ובעלי מקצוע נבחרים בקפידה.' },
  { icon: 'users', title: 'אהבה וכבוד', text: 'מדברים בגובה העיניים, בסבלנות ובדרך ארץ. הלקוחות שלנו הם כמו בני משפחה.' },
  { icon: 'doc', title: 'שקיפות', text: 'סיכום כתוב אחרי כל שירות וחשבונית חודשית אחת, כך שתמיד ברור מה נעשה.' },
  { icon: 'shield', title: 'אחריות מההזמנה ועד הסיום', text: 'ממשק אחד מולכם. אנחנו מול בעלי המקצוע, עד שהעבודה מסתיימת כמו שצריך.' },
]

const FAMILY: { icon: IconName; text: string }[] = [
  { icon: 'heart', text: 'תחושת ביטחון שההורים שלכם בידיים טובות, בליווי אנשי צוות אחראים' },
  { icon: 'clock', text: 'זמן פנוי יותר לקריירה ולילדים, בלי להתפשר על הדאגה להורים' },
  { icon: 'doc', text: 'סיכום כתוב אחרי כל ביקור, בלי לרדוף אחרי עדכונים' },
  { icon: 'user', text: 'תיק אישי שמרכז דגשים, העדפות, תרופות ואנשי קשר' },
  { icon: 'shield', text: 'בעלי מקצוע עם רישיון וביטוח בתוקף, ללא ממשק ישיר מול קבלנים' },
  { icon: 'chat', text: 'חשבונית חודשית אחת, במקום תשלום לכל ספק בנפרד' },
]

const PLANS = [
  { name: 'ביזנס', price: '2,950', meetings: 4, hours: 2, premium: false, featured: false },
  { name: 'פלטינום', price: '8,350', meetings: 8, hours: 3, premium: true, featured: true },
  { name: 'טופ פלטינום', price: '15,950', meetings: 12, hours: 4, premium: true, featured: false },
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
  useReveal()

  return (
    <div className="lp">
      <LpNav />

      <header id="top" className="lp-hero">
        <div className="lp-wrap lp-hero-in">
          <div className="lp-hero-text">
            <span className="lp-eyebrow reveal">מועדון קונסיירז' לגיל השלישי ולמשפחות</span>
            <h1 className="reveal" style={delay(80)}>הורים בטוחים יותר,<br />משפחה רגועה יותר</h1>
            <p className="lp-sub reveal" style={delay(160)}>
              Family Care מלווה את ההורים שלכם בכל מה שצריך: מלווה אישית קבועה, בעלי מקצוע נבחרים וטיפול מלא מההזמנה ועד הסיום. אתם נשארים רגועים.
            </p>
            <div className="lp-cta reveal" style={delay(240)}>
              <a className="lp-btn primary" href="#contact">צרו קשר <Ico name="arrow" size={20} /></a>
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

      <Section id="values" tone="dark" title="למה Family Care" lead="הם דאגו לכם כל החיים. עכשיו אנחנו כאן כדי לדאוג להם, באהבה ובכבוד.">
        <div className="lp-grid five">
          {VALUES.map((v, i) => (
            <article key={v.title} className="lp-value reveal" style={delay(i * 70)}>
              <span className="lp-ico on-dark"><Ico name={v.icon} /></span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="family" title="ולכם, הילדים הבוגרים" lead="פחות דאגות להורים, ויותר זמן איכות לכל המשפחה.">
        <ul className="lp-family">
          {FAMILY.map((f, i) => (
            <li key={f.text} className="reveal" style={delay((i % 2) * 70)}><span className="lp-tick"><Ico name={f.icon} size={18} /></span>{f.text}</li>
          ))}
        </ul>
      </Section>

      <Section id="plans" tone="white" title="מסלולי מועדון לקוחות יוקרה" lead="בוחרים את המסלול שמתאים לצרכים של ההורים ולקצב של המשפחה.">
        <div className="lp-grid three plans">
          {PLANS.map((p, i) => (
            <article key={p.name} className={`lp-plan reveal ${p.featured ? 'featured' : ''}`} style={delay(i * 80)}>
              <h3>{p.name}</h3>
              <div className="lp-price"><span className="amt">{p.price}</span><span className="cur">₪</span><span className="per">לחודש</span></div>
              <ul>
                <li><Ico name="check" size={18} /> <strong>{p.meetings} פגישות בחודש</strong></li>
                <li><Ico name="check" size={18} /> <strong>משך פגישה: {p.hours} שעות</strong></li>
                {p.premium && <li><Ico name="check" size={18} /> זמינות בחירום</li>}
                {p.premium && <li><Ico name="check" size={18} /> ניהול יומן משפחה</li>}
                {p.premium && <li><Ico name="check" size={18} /> צ'ופרים לסופ"ש: זר פרחים, עיתון או חלה</li>}
                {PLAN_SHARED.map((f) => (<li key={f}><Ico name="check" size={18} /> {f}</li>))}
              </ul>
              <a className={`lp-btn sm lp-plan-cta ${p.featured ? 'primary' : 'solid'}`} href="#contact">להצטרפות ופרטים</a>
            </article>
          ))}
        </div>
        <p className="lp-fine reveal">עלות בעלי מקצוע, רכישות, כרטיסים והסעות נוספת בהתאם להזמנה. פגישה או שעה נוספת בתיאום. <Link to="/policy">למדיניות החברה ולתנאי השירות</Link></p>
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
            <ContactBtn href={waHref} icon="chat">WhatsApp</ContactBtn>
            <ContactBtn href={mailHref} icon="mail" variant="ghost">{CONTACT.email || 'שלחו לנו מייל'}</ContactBtn>
            {telHref && <ContactBtn href={telHref} icon="call" variant="ghost"><span dir="ltr">{CONTACT.phone}</span></ContactBtn>}
          </div>
          <p className="lp-member">כבר חברים במועדון? <Link to="/login">כניסה לאזור האישי</Link></p>
        </div>
      </section>

      <LpFooter />
      <FloatingContact toSection />
    </div>
  )
}
