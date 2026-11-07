import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { trackLead } from '../lib/analytics'

type Status = 'idle' | 'sending' | 'done' | 'error'

/** Landing-page contact form. Saves through the submit_lead RPC (a new lead + an email to the office). */
export default function LeadForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [msg, setMsg] = useState('')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('website')) { setStatus('done'); return } // honeypot: bots fill the hidden field
    const digits = String(f.get('phone') ?? '').replace(/\D/g, '')
    if (digits.length < 7) { setStatus('error'); setMsg('נא להזין מספר טלפון תקין.'); return }
    setStatus('sending'); setMsg('')
    const { error } = await supabase.rpc('submit_lead', {
      p_first: String(f.get('first') ?? ''), p_last: String(f.get('last') ?? ''), p_phone: String(f.get('phone') ?? ''),
      p_email: String(f.get('email') ?? ''), p_country: String(f.get('country') ?? ''),
    })
    if (error) {
      setStatus('error')
      setMsg(/invalid_email/.test(error.message) ? 'כתובת המייל לא נראית תקינה.' : /rate_limited/.test(error.message) ? 'יש עומס רגעי. אפשר לנסות שוב בעוד כמה דקות, או לפנות אלינו בוואטסאפ.' : 'לא הצלחנו לשלוח. אפשר לנסות שוב, או לפנות אלינו בוואטסאפ.')
      return
    }
    trackLead()
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="lp-form done" role="status">
        <h3>תודה, קיבלנו.</h3>
        <p>נחזור אליכם בהקדם.</p>
      </div>
    )
  }

  return (
    <form className="lp-form" onSubmit={(e) => void submit(e)} aria-label="השארת פרטים">
      <div className="lp-form-grid">
        <label><span>שם פרטי</span><input name="first" required maxLength={60} autoComplete="given-name" /></label>
        <label><span>שם משפחה</span><input name="last" required maxLength={60} autoComplete="family-name" /></label>
        <label><span>טלפון</span><input name="phone" type="tel" inputMode="tel" dir="ltr" required maxLength={30} autoComplete="tel" /></label>
        <label><span>מייל <small>(לא חובה)</small></span><input name="email" type="email" dir="ltr" maxLength={120} autoComplete="email" /></label>
        <label className="wide"><span>מדינה <small>(אם הילדים גרים בחו"ל)</small></span><input name="country" maxLength={60} autoComplete="country-name" /></label>
      </div>
      <input className="lp-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="lp-btn primary" disabled={status === 'sending'}>{status === 'sending' ? 'שולחים…' : 'השאירו פרטים ונחזור אליכם'}</button>
      {status === 'error' && <p className="lp-form-err" role="alert">{msg}</p>}
      <p className="lp-form-note">הפרטים ישמשו אותנו רק כדי לחזור אליכם. פרטים נוספים ב<Link to="/policy#sec-7">מדיניות הפרטיות</Link>.</p>
    </form>
  )
}
