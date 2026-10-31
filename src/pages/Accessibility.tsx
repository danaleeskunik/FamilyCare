import { Link } from 'react-router-dom'
import { ACCESS, CONTACT } from '../lib/contact'
import { FloatingContact, LpFooter, LpNav, useReveal } from '../components/LandingChrome'

const UPDATED = 'אוקטובר 2026'

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: 'המחויבות שלנו',
    items: [
      'Family Care רואה חשיבות רבה במתן שירות שוויוני ונגיש לכלל הלקוחות והגולשים, ובכלל זה אנשים עם מוגבלות ובני הגיל השלישי.',
      'אנחנו משקיעים מאמצים להתאים את האתר לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג–2013, ולתקן הישראלי ת"י 5568 לנגישות תכנים באינטרנט, ברמה AA.',
    ],
  },
  {
    title: 'התאמות הנגישות באתר',
    items: [
      'האתר כתוב בעברית מימין לשמאל, עם הגדרת שפה וכותרת לכל עמוד.',
      'מבנה העמודים כולל אזורים מוגדרים (ניווט, תוכן ראשי, תחתית) וכותרות בסדר היררכי, לשימוש נוח בקורא מסך.',
      'בראש כל עמוד יש קישור "דלגו לתוכן הראשי", שמופיע בלחיצה על מקש Tab.',
      'אפשר לנווט בכל האתר באמצעות מקלדת בלבד. אלמנט שנמצא בפוקוס מסומן במסגרת בולטת, וחלונות המידע ננעלים על המקלדת ונסגרים במקש Esc.',
      'הצבעים נבדקו ליחס ניגודיות של 4.5:1 לפחות בטקסט רגיל.',
      'לתמונות משמעותיות יש תיאור חלופי, ותמונות קישוט מוסתרות מטכנולוגיות מסייעות.',
      'אזורי הלחיצה גדולים ונוחים, והטקסט מתגדל יחד עם הגדלת הדף בדפדפן (עד 200%) בלי לאבד תוכן.',
      'האתר מותאם לטלפון, ללוח ולמחשב, ומכבד את הגדרת "הפחתת תנועה" של מערכת ההפעלה.',
    ],
  },
  {
    title: 'מגבלות ידועות',
    items: [
      'קובצי PDF שאנחנו מפיצים (ברושורים ושאלונים) עשויים שלא להיות נגישים במלואם לקורא מסך. אפשר לבקש את התוכן בפורמט נגיש.',
      'האזור האישי ללקוחות ואפליקציית הצוות דורשים התחברות, ועדיין לא עברו בדיקת נגישות מלאה.',
      'האתר נבדק בבדיקה אוטומטית ובבדיקה ידנית פנימית, ולא נבדק על ידי יועץ נגישות חיצוני. ייתכן שיש תכנים שעדיין אינם נגישים במלואם.',
    ],
  },
  {
    title: 'נתקלתם בבעיה? נשמח לשמוע',
    items: [
      'אם לא הצלחתם לגשת לתוכן או לשירות באתר, או שיש לכם הצעה לשיפור, אפשר לפנות אלינו ונטפל בהקדם. נשמח לספק את המידע או השירות בדרך חלופית נגישה.',
    ],
  },
]

export default function Accessibility() {
  useReveal()
  return (
    <div className="lp">
      <LpNav onPolicy />
      <main id="main" tabIndex={-1} className="lp-doc">
        <div className="lp-wrap">
          <header className="lp-doc-head reveal">
            <h1>הצהרת נגישות</h1>
            <p>עודכנה לאחרונה: {UPDATED}.</p>
          </header>
          {SECTIONS.map((s) => (
            <section key={s.title} className="lp-doc-sec reveal">
              <h2>{s.title}</h2>
              <ul>{s.items.map((i) => (<li key={i}>{i}</li>))}</ul>
            </section>
          ))}
          <section className="lp-doc-sec reveal">
            <h2>רכז נגישות</h2>
            <ul>
              <li>שם: {ACCESS.name}, {ACCESS.role}</li>
              <li>טלפון: <a href={ACCESS.tel} dir="ltr">{ACCESS.phone}</a></li>
              <li>מייל: <a href={`mailto:${ACCESS.email || CONTACT.email}`} dir="ltr">{ACCESS.email || CONTACT.email}</a></li>
            </ul>
          </section>
          <p className="lp-doc-back"><Link to="/">חזרה לדף הבית</Link></p>
        </div>
        <FloatingContact />
      </main>
      <LpFooter onPolicy />
    </div>
  )
}
