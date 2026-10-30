import { Link } from 'react-router-dom'
import { POLICY, POLICY_UPDATED, type PolicyItem } from '../data/policy'
import { CONTACT, mailHref, waHref } from '../lib/contact'
import { ContactBtn, FloatingContact, LpFooter, LpNav, useReveal } from '../components/LandingChrome'

/** "Lead: text" items show the lead in bold. */
function Item({ n, t, sub }: PolicyItem) {
  const m0 = t.match(/^([^:]{2,60}):\s+(.+)$/)
  const m = m0 && !m0[1].includes('"') && (m0[1].match(/\(/g)?.length ?? 0) === (m0[1].match(/\)/g)?.length ?? 0) ? m0 : null
  const lead = m ? m[1] : null
  const body = m ? m[2] : t
  const colonOnly = !m && t.endsWith(':')
  return (
    <li>
      <span className="lp-doc-n" dir="ltr">{n}</span>
      <div>
        {lead ? <p><strong>{lead}:</strong> {body}</p> : <p>{colonOnly ? <strong>{t}</strong> : body}</p>}
        {sub && <ul className="lp-doc-sub">{sub.map((x) => <li key={x}>{x}</li>)}</ul>}
      </div>
    </li>
  )
}

export default function Policy() {
  useReveal()
  return (
    <div className="lp">
      <LpNav onPolicy />
      <main className="lp-doc">
        <div className="lp-wrap">
          <header className="lp-doc-head reveal">
            <h1>תקנון ומדיניות החברה</h1>
            <p>עקרונות העבודה, תנאי ההתקשרות והתחייבויות החברה כלפי הלקוחות ומשפחותיהם. עודכן {POLICY_UPDATED}.</p>
          </header>
          <nav className="lp-doc-toc reveal" aria-label="תוכן העניינים">
            {POLICY.map((sec, i) => <a key={sec.title} href={`#sec-${i + 1}`}><span dir="ltr">{i + 1}</span>{sec.title}</a>)}
          </nav>
          {POLICY.map((sec, i) => (
            <section key={sec.title} id={`sec-${i + 1}`} className="lp-doc-sec reveal">
              <h2><span dir="ltr">{i + 1}.</span> {sec.title}</h2>
              {sec.intro?.map((t) => <p key={t} className="lp-doc-intro">{t}</p>)}
              {sec.items.length > 0 && <ol className="lp-doc-items">{sec.items.map((it) => <Item key={it.n} {...it} />)}</ol>}
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
