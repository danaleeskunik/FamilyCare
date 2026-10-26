import { Link } from 'react-router-dom'
import { CONTACT, mailHref, waHref } from '../lib/contact'
import { ContactBtn, FloatingContact, LpFooter, LpNav, useReveal } from '../components/LandingChrome'

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: 'מי אנחנו',
    items: [
      'Family Care Services הוא מועדון לקוחות פרטי המעניק שירותי קונסיירז\' אישיים למשפחות ולבני הגיל השלישי.',
      'אנחנו אחראים על השירות מרגע ההזמנה ועד לסיומו, ומורידים מהמשפחה את העומס התפעולי.',
    ],
  },
  {
    title: 'אופן מתן השירות',
    items: [
      'השירות ניתן תמיד באישור הלקוח או מזמין/ת השירות, ובעיתוי שנקבע מראש.',
      'ההיכרות מתחילה בפגישה עם נציג החברה, ובה נפתח תיק אישי עם הדגשים, ההעדפות והצרכים.',
      'נציג מטעם החברה מתאם את השירות, מלווה אותו ובודק את התוצאה.',
      'בסיום כל שירות מתקבל סיכום כתוב, ומתבקש משוב לצורך שיפור ודיוק השירות.',
    ],
  },
  {
    title: 'מסלולי חברות ותשלום',
    items: [
      'החברות במועדון היא במנוי חודשי, לפי המסלול שנבחר: ביזנס, פלטינום או טופ פלטינום.',
      'עלות בעלי מקצוע, רכישות, כרטיסים והסעות מתווספת בהתאם להזמנה.',
      'פגישה או שעה נוספת מעבר למסלול ניתנות בתיאום מראש.',
      'החיוב מתבצע בחשבונית חודשית אחת למזמין/ת השירות. התשלום לבעלי המקצוע מתבצע דרך החברה.',
    ],
  },
  {
    title: 'בעלי מקצוע וספקים',
    items: [
      'אנחנו עובדים עם רשת בעלי מקצוע מאושרים, ללא ממשק ישיר בינם לבין הלקוח.',
      'רישיון וביטוח של בעלי המקצוע נבדקים. בעל מקצוע שהרישיון או הביטוח שלו פגו מוקפא ואינו משובץ לעבודה.',
    ],
  },
  {
    title: 'פרטיות וסודיות',
    items: [
      'התיק האישי כולל דגשים, צרכים ופרטי התקשרות, והמידע בו נשמר בסודיות.',
      'המידע נגיש רק לצוות המורשה, לפי תפקיד, ובמערכת שדורשת התחברות אישית.',
      'במהלך השירות אנחנו שומרים על פרטיות הלקוח ועל ביתו.',
    ],
  },
]

export default function Policy() {
  useReveal()
  return (
    <div className="lp">
      <LpNav onPolicy />
      <main className="lp-doc">
        <div className="lp-wrap">
          <header className="lp-doc-head reveal">
            <h1>מדיניות החברה</h1>
            <p>עקרונות העבודה וההגדרות שמנחים את השירות שלנו.</p>
          </header>
          {SECTIONS.map((s) => (
            <section key={s.title} className="lp-doc-sec reveal">
              <h2>{s.title}</h2>
              <ul>{s.items.map((i) => (<li key={i}>{i}</li>))}</ul>
            </section>
          ))}
          <section className="lp-doc-sec reveal">
            <h2>שאלות ופניות</h2>
            <p>לפרטים נוספים, או לקבלת נוסח מלא של תנאי ההתקשרות, אפשר לפנות אלינו.</p>
            <div className="lp-cta">
              <ContactBtn href={waHref} icon="chat">WhatsApp</ContactBtn>
              <ContactBtn href={mailHref} icon="mail" variant="ghost">{CONTACT.email || 'שלחו לנו מייל'}</ContactBtn>
            </div>
          </section>
          <p className="lp-doc-back"><Link to="/">חזרה לדף הבית</Link></p>
        </div>
      </main>
      <LpFooter onPolicy />
      <FloatingContact />
    </div>
  )
}
