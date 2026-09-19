import { useState } from 'react'
import { Badge, Button, Card, Icon, Ltr, money } from '../components/ui'

const TASKS = ['איסוף מרשמים בבית המרקחת', 'ליווי לתור אצל ד"ר אבידן ב-10:15', 'לבדוק שיש חלב וירקות במקרר']

export default function CompanionApp() {
  const [done, setDone] = useState([true, false, false])
  const [summary, setSummary] = useState('')
  const toggle = (i: number) => setDone((d) => d.map((v, j) => (j === i ? !v : v)))

  return (
    <div className="mobile companion">
      <div className="hero">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ font: '800 17px var(--font-ui)' }}>בוקר טוב, נועה</div>
            <div style={{ font: '500 13px var(--font-ui)', color: 'var(--on-brand-2)' }}>שלישי 15.9 · 3 ביקורים · <Ltr>7:15</Ltr> שעות</div>
          </div>
          <img src="/brand/logo-white.png" height={34} alt="Family Care — always with you" />
        </div>
        <div className="grid cols-2" style={{ marginTop: 13, gap: 10 }}>
          <div className="inset-dark"><div style={{ font: '500 12.5px var(--font-ui)', color: 'var(--on-brand-2)' }}>שעות החודש</div><Ltr style={{ font: '900 20px var(--font-num)' }}>62:40</Ltr></div>
          <div className="inset-dark"><div style={{ font: '500 12.5px var(--font-ui)', color: 'var(--on-brand-2)' }}>נסיעות להחזר</div><div style={{ font: '900 20px var(--font-num)' }}>{money(120)}</div></div>
        </div>
      </div>

      <Card style={{ borderColor: 'var(--brand-action)' }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Badge tone="green">הביקור הנוכחי</Badge>
          <span className="num" style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink-2)' }}>09:30–11:30</span>
        </div>
        <div style={{ font: '800 19px var(--font-ui)' }}>שרה לוי, 84</div>
        <div className="muted" style={{ fontWeight: 500, fontSize: 13, margin: '3px 0 12px' }}>ז'בוטינסקי 18, רמת השרון · קוד <Ltr style={{ fontWeight: 700 }}>2580#</Ltr></div>
        <div className="inset stack" style={{ gap: 10, marginBottom: 12 }}>
          <div className="card-label">תדריך הביקור</div>
          {TASKS.map((t, i) => (
            <label key={t} className="row" style={{ gap: 10, cursor: 'pointer', font: '600 15px var(--font-ui)' }}>
              <button type="button" className={`check ${done[i] ? 'on' : ''}`} role="checkbox" aria-checked={done[i]} aria-label={t} onClick={() => toggle(i)}>
                {done[i] && <Icon name="check" size={13} />}
              </button>
              {t}
            </label>
          ))}
        </div>
        <div className="alert-block" style={{ marginBottom: 12 }}>אלרגיה לפניצילין · הליכון · מדרגות בקושי. לא לתאם אחרי 19:00.</div>
        <div className="row" style={{ gap: 10 }}>
          <Button size="lg">Check-Out</Button>
          <Button size="lg" variant="secondary">ניווט</Button>
        </div>
      </Card>

      <div className="grid cols-2" style={{ gap: 10 }}>
        <Card interactive className="tile"><Icon name="image" size={22} /><div><div style={{ fontWeight: 800, fontSize: 14.5 }}>סריקת קבלה</div><div className="card-meta">צילום ושיוך ללקוח</div></div></Card>
        <Card interactive className="tile"><Icon name="warning" size={22} /><div><div style={{ fontWeight: 800, fontSize: 14.5 }}>דיווח חריגה</div><div className="card-meta">שינוי במצב או תקלה בבית</div></div></Card>
      </div>

      <Card>
        <div style={{ font: '800 15.5px var(--font-ui)', marginBottom: 10 }}>סיכום ביקור — נשלח למשפחה</div>
        <textarea
          className="inset" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
          placeholder="מה נעשה בביקור? כתבי בשתי שורות, או הקליטי ונמלא עבורך."
          style={{ width: '100%', border: 0, font: '500 15px/1.6 var(--font-ui)', color: 'var(--ink-1)', resize: 'vertical' }}
        />
        <div className="row" style={{ gap: 8, margin: '10px 0 12px' }}>
          <div className="dashed row" style={{ width: 74, height: 60, justifyContent: 'center', fontSize: 12.5 }}>+ תמונה</div>
          <div style={{ width: 74, height: 60, borderRadius: 10, background: 'var(--inert)' }} />
          <div style={{ width: 74, height: 60, borderRadius: 10, background: 'var(--inert)' }} />
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button disabled={!summary.trim()}>שליחת סיכום</Button>
          <Button variant="quiet">טיוטה</Button>
        </div>
      </Card>

      <Card>
        <div style={{ font: '800 15.5px var(--font-ui)', marginBottom: 8 }}>בהמשך היום</div>
        {[['13:00', 'חנה פלד — ליווי טכנאי מזגן', "סוקולוב 7, הרצליה · קור־טק"], ['17:30', 'שרה לוי — בית קפה', 'מונית VIP מתואמת ל-17:15']].map(([t, a, b]) => (
          <div key={t} className="row" style={{ gap: 10, alignItems: 'flex-start', padding: '8px 0' }}>
            <span className="num" style={{ width: 44, fontWeight: 500, fontSize: 14, color: 'var(--brand-link)' }}>{t}</span>
            <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{a}</div><div className="card-meta">{b}</div></div>
          </div>
        ))}
      </Card>
    </div>
  )
}
