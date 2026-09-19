import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '../layouts/AdminLayout'
import { Badge, Button, Callout, Card, Empty, Icon, Ltr, Progress, money } from '../components/ui'
import { visitHistory } from '../data/mock'
import { useStore } from '../store/AppStore'

const TABS = [
  ['med', 'רפואי ותפקודי'],
  ['pref', 'העדפות אישיות'],
  ['hist', 'היסטוריית שירות'],
  ['fin', 'כספים ומנוי'],
] as const
type TabKey = (typeof TABS)[number][0]

function Sidebar() {
  return (
    <aside className="sticky-side">
      <Card>
        <div className="row" style={{ gap: 12, marginBottom: 12 }}>
          <span className="avatar" style={{ width: 62, height: 62, background: '#E3EAF2', fontSize: 20 }}>ש"ל</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>שרה לוי</div>
            <div className="card-meta">84 · תלות קלה · הליכון</div>
          </div>
        </div>
        {[['טלפון', <Ltr key="p">052-441-8830</Ltr>], ['כתובת', "ז'בוטינסקי 18, רמת השרון"], ['קוד לבניין', <Ltr key="c" style={{ fontWeight: 900 }}>2580#</Ltr>]].map(([k, v]) => (
          <div key={k as string} className="kv" style={{ fontSize: 13.5 }}>
            <span className="muted">{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>
      <Card>
        <div className="card-title" style={{ marginBottom: 10 }}>אנשי קשר</div>
        <div className="stack" style={{ gap: 10 }}>
          {[['רונית לוי־שדה', 'בת · מזמינת השירות · הרשאה מלאה', '#E6F5F4'], ['מאיר לוי', 'בן · צפייה בלבד', '#EEF2F7'], ['ד"ר גיל אבידן', 'רופא מטפל · מכבי רמת השרון', '#FDEEE4']].map(([n, r, bg]) => (
            <div key={n} className="row" style={{ gap: 10 }}>
              <span className="avatar" style={{ width: 34, height: 34, background: bg, fontSize: 13 }}>{n.replace(/[^֐-׿]/g, '').slice(0, 1)}</span>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{n}</div><div className="card-meta">{r}</div></div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="card-title">מסמכים משפטיים</div><Badge>מורשים בלבד</Badge>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {['ייפוי כוח מתמשך', 'ייפוי כוח רפואי'].map((d) => (
            <div key={d} className="item-box row" style={{ gap: 8, padding: '9px 11px', fontSize: 13.5 }}><Icon name="document" size={17} />{d}</div>
          ))}
          <div className="dashed" style={{ padding: '9px 11px', fontSize: 13.5 }}>אין הנחיות מקדימות. אפשר להעלות מסמך.</div>
        </div>
      </Card>
    </aside>
  )
}

const InfoCard = ({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) => (
  <Card>
    <div className="card-title" style={{ marginBottom: 8 }}>{title}</div>
    <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6 }}>{children}</div>
    {note && <p className="card-meta" style={{ marginTop: 8, lineHeight: 1.5 }}>{note}</p>}
  </Card>
)

function Medical() {
  return (
    <>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>תרופות קבועות</div>
          {[['אליקוויס 5 מ"ג', 'בוקר וערב'], ['לוסארטן 50 מ"ג', 'בוקר'], ['ויטמין D', 'פעם בשבוע']].map(([a, b]) => (
            <div key={a} className="kv"><span style={{ fontWeight: 600 }}>{a}</span><span className="muted">/ {b}</span></div>
          ))}
          <p className="card-meta" style={{ marginTop: 8 }}>מרשמים מתחדשים ב-1 לחודש · איסוף על ידי המלווה</p>
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>רגישויות ואלרגיות</div>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}><Badge tone="red">פניצילין</Badge><Badge tone="orange">לקטוז</Badge></div>
          <p className="card-meta" style={{ lineHeight: 1.5 }}>מופיע אוטומטית בתדריך לכל מלווה ולכל ספק רפואי שמגיע לבית.</p>
        </Card>
        <InfoCard title="ניידות" note="מעקה בטיחות הותקן במקלחת 04.25. הסעות — מונית VIP בלבד.">הליכון · מדרגות בקושי · מעלית בבניין</InfoCard>
        <InfoCard title="מצב קוגניטיבי" note="מומלץ להזכיר תורים יום מראש בשיחה, לא בהודעה בלבד.">צלולה · שכחה קלה</InfoCard>
      </div>
      <Callout tone="warning" title="חריגה שדווחה 15.9">
        נועה דיווחה על כאב בברך ימין בעלייה במדרגות. ממתין לתיאום ביקור רופא/ה עד הבית.
      </Callout>
    </>
  )
}

function Preferences() {
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <InfoCard title="אוכל ומעדניות" note="אוהבת: מרק עוף, גבינה בולגרית, עוגת גבינה. לא אוכלת חריף.">רביבה וסיליה · דליקטסן בן יהודה</InfoCard>
      <InfoCard title="תרבות ופנאי" note={'עיתון "הארץ" בשישי. מעדיפה מופעי בוקר.'}>הבימה · הקאמרי · מוזיקה קלאסית</InfoCard>
      <InfoCard title="הרגלי יום־יום">קמה ב-7:00 · קפה הפוך ב-8:00 · מנוחה אחר הצהריים 14:00–16:00 · לא לתאם ביקורים אחרי 19:00.</InfoCard>
      <Card>
        <div className="card-title" style={{ marginBottom: 8 }}>העדפות למלווה</div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 8 }}><Badge>מלווה אישה</Badge><Badge>עברית ורוסית</Badge><Badge tone="green">נועה ש. — מלווה קבועה</Badge></div>
        <p className="card-meta" style={{ lineHeight: 1.5 }}>רצוי אותו פרצוף. החלפה — רק בתיאום מראש עם רונית.</p>
      </Card>
    </div>
  )
}

function History() {
  return (
    <>
      <Card flush>
        <div className="card-head">
          <h2>ביקורים ושירותים אחרונים</h2>
          <span className="card-meta">ספטמבר 2026 · 9 ביקורים · <Ltr>18:40</Ltr> שעות</span>
        </div>
        <div className="table-wrap">
          <table className="table-hist">
            <thead><tr><th>תאריך</th><th>מלווה / ספק</th><th>מה נעשה</th><th>משך</th><th>עלות</th><th /></tr></thead>
            <tbody>
              {visitHistory.map((v) => (
                <tr key={v.date + v.who}>
                  <td className="num">{v.date}</td>
                  <td style={{ fontWeight: 600 }}>{v.who}</td>
                  <td>{v.what}</td>
                  <td><Ltr>{v.dur}</Ltr></td>
                  <td className="num nowrap">{money(v.cost)}</td>
                  <td><a href="#" onClick={(e) => e.preventDefault()}>{v.link}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card size="sm">
        <div className="row" style={{ gap: 12, alignItems: 'baseline' }}>
          <span className="num" style={{ font: '900 26px var(--font-num)', color: 'var(--brand-link)' }}>4.8</span>
          <span className="card-meta">מתוך 9 משובים של המשפחה החודש</span>
        </div>
      </Card>
    </>
  )
}

function Finance() {
  const benefits = ['מפגשי בוקר — קפה ומאפה', 'ביקור שישי חודשי — חלה, עיתון, פרחים', 'רכב יוקרה או מונית VIP לבילויים', 'ליווי נציג בכל ביקור טכנאי', 'תיאום מראש — 3 ימים', 'אחזקת הבית — עד יום אחד']
  return (
    <>
      <div className="grid cols-3">
        <Card size="sm">
          <div className="card-label">דמי חברות חודשיים</div>
          <div className="stat-figure">{money(3500)}</div>
          <div className="card-meta">נגבה ב-1.9 · כרטיס מסתיים ב-<Ltr>4417</Ltr></div>
        </Card>
        <Card size="sm">
          <div className="card-label">מפגשים שנוצלו החודש</div>
          <div className="stat-figure"><Ltr>5 / 8</Ltr></div>
          <Progress pct={62} />
          <div className="card-meta" style={{ marginTop: 6 }}>פעמיים בשבוע · 3 שעות למפגש</div>
        </Card>
        <Card size="sm">
          <div className="card-label">חיובים נוספים החודש</div>
          <div className="stat-figure">{money(2318)}</div>
          <div className="card-meta">קבלנים, נסיעות וקבלות שנסרקו</div>
        </Card>
      </div>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="card-title">פירוט לחשבונית ספטמבר</div>
          <Button variant="secondary" size="sm" icon="export">הפקת דוח חודשי</Button>
        </div>
        <div className="kv"><span>אינסטלטור — עלות בעל מקצוע</span><span className="v">{money(1000)}</span></div>
        <div className="kv faint"><span>תוספת זמינות 10%</span><span className="v">{money(100)}</span></div>
        <div className="kv faint"><span>דמי ניהול 10%</span><span className="v">{money(110)}</span></div>
        <div className="kv"><span>שעות ליווי מעבר למכסה (1 + 2)</span><span className="v">{money(800)}</span></div>
        <div className="kv"><span>נסיעות ומוניות VIP</span><span className="v">{money(264)}</span></div>
        <div className="kv total"><span>סה"כ לחיוב</span><span className="v">{money(2318)}</span></div>
      </Card>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div className="card-title">הטבות המסלול · פלטינום</div><Badge tone="green">תגמול נקודות בקצב גבוה</Badge>
        </div>
        <div className="grid cols-2" style={{ gap: 8 }}>{benefits.map((b) => <div key={b} className="item-box">{b}</div>)}</div>
      </Card>
      <Callout title="תקרה תקציבית">
        רונית הגדירה תקרה של {money(3000)} לחודש מעבר לדמי החברות. נותרו {money(682)} — התראה תישלח בהתקרבות לרף.
      </Callout>
    </>
  )
}

export default function ClientFile() {
  const { id } = useParams()
  const { clients, openForm, loading } = useStore()
  const [tab, setTab] = useState<TabKey>('med')
  const client = clients.find((c) => c.id === id)

  if (loading) return <main className="container page-body"><p className="muted" role="status">טוענת נתונים…</p></main>

  if (!client) {
    return (
      <main className="container page-body">
        <Empty text="לא מצאנו את הלקוח/ה הזה/זו. אפשר לחזור לרשימה ולבחור מחדש." action={<Link to="/admin/clients">חזרה ללקוחות</Link>} />
      </main>
    )
  }

  const full = client.id === 'sara-levi'

  return (
    <>
      <Header
        lead={<span style={{ width: 1, height: 22, background: 'rgba(255,255,255,.22)' }} />}
        title={`תיק לקוח · ${client.name}, ${client.age}`}
        sub={full ? 'רמת השרון · לקוחה מאז 03.24 · מנהלת תיק: ליאת ב.' : `${client.area} · מזמין/ת השירות: ${client.orderer}`}
        actions={
          <>
            <span className="plan-pill">{client.plan[1] === 'תקופת היכרות' ? client.plan[1] : `מסלול ${client.plan[1]}`}</span>
            <Button variant="on-navy" size="sm" icon="message">הודעה למשפחה</Button>
            <Button size="sm" icon="plus" onClick={() => openForm('task', { client: client.name })}>הזמנת שירות</Button>
          </>
        }
        tabs={
          <div className="tabs" role="tablist">
            {TABS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{label}</button>
            ))}
          </div>
        }
      />
      <main className="container page-body">
        {full ? (
          <div className="file-grid">
            <Sidebar />
            <div className="stack">
              {tab === 'med' && <Medical />}
              {tab === 'pref' && <Preferences />}
              {tab === 'hist' && <History />}
              {tab === 'fin' && <Finance />}
            </div>
          </div>
        ) : (
          <div className="stack">
            <Card>
              <div className="row" style={{ gap: 12, marginBottom: 6 }}>
                <span className="avatar" style={{ width: 62, height: 62, background: '#E3EAF2', fontSize: 20 }}>{client.name.split(' ').map((w) => w[0]).join('"')}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{client.name}</div>
                  <div className="card-meta">{client.age} · {client.area} · <Badge tone={client.plan[0]}>{client.plan[1]}</Badge></div>
                </div>
              </div>
              <div className="kv"><span className="muted">מלווה קבוע/ה</span><span style={{ fontWeight: 700 }}>{client.companion ?? 'עדיין ללא'}</span></div>
              <div className="kv"><span className="muted">מפגשים החודש</span><Ltr style={{ fontWeight: 700 }}>{client.used}</Ltr></div>
            </Card>
            <Empty
              text="עוד לא הוזנו פרטים רפואיים, העדפות והיסטוריית שירות. אפשר להתחיל בהזמנת השירות הראשון."
              action={<Button size="sm" icon="plus" onClick={() => openForm('task', { client: client.name })}>הזמנת שירות</Button>}
            />
          </div>
        )}
      </main>
    </>
  )
}
