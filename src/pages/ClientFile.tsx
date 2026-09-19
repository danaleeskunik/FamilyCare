/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '../layouts/AdminLayout'
import { Badge, Button, Callout, Card, Empty, Icon, Ltr, Progress, money } from '../components/ui'
import { useStore } from '../store/AppStore'
import { loadClientDetail, shortName, type ClientDetail } from '../lib/queries'
import { formatDM, parseISO } from '../lib/dates'
import { TODAY } from '../data/model'

const TABS = [
  ['med', 'רפואי ותפקודי'],
  ['pref', 'העדפות אישיות'],
  ['hist', 'היסטוריית שירות'],
  ['fin', 'כספים ומנוי'],
] as const
type TabKey = (typeof TABS)[number][0]

const DEPENDENCY: Record<string, string> = { independent: 'עצמאי/ת', light: 'תלות קלה', moderate: 'תלות בינונית', high: 'תלות גבוהה' }
const AVATAR_BG = ['#E6F5F4', '#EEF2F7', '#FDEEE4']
const one = (v: any) => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))
const age = (birth: string | null) => (birth ? Math.floor((parseISO(TODAY).getTime() - parseISO(birth).getTime()) / (365.25 * 86400000)) : null)
const initials = (name: string) => name.split(' ').map((w) => w[0]).join('"')
const ymShort = (iso: string) => `${iso.slice(5, 7)}.${iso.slice(2, 4)}`
const hm = (mins: number) => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`

function Sidebar({ d }: { d: ClientDetail }) {
  const c = d.client
  const a = age(c.birth_date)
  return (
    <aside className="sticky-side">
      <Card>
        <div className="row" style={{ gap: 12, marginBottom: 12 }}>
          <span className="avatar" style={{ width: 62, height: 62, background: '#E3EAF2', fontSize: 20 }}>{initials(c.full_name)}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{c.full_name}</div>
            <div className="card-meta">{[a, DEPENDENCY[c.dependency_level]].filter(Boolean).join(' · ')}</div>
          </div>
        </div>
        {[
          ['טלפון', c.phone ? <Ltr key="p">{c.phone}</Ltr> : '—'],
          ['כתובת', c.address ?? '—'],
          ['קוד לבניין', c.building_code ? <Ltr key="c" style={{ fontWeight: 900 }}>{c.building_code}</Ltr> : '—'],
        ].map(([k, v]) => (
          <div key={k as string} className="kv" style={{ fontSize: 13.5 }}>
            <span className="muted">{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </Card>
      <Card>
        <div className="card-title" style={{ marginBottom: 10 }}>אנשי קשר</div>
        {d.contacts.length === 0 ? <Empty text="עוד לא הוזנו אנשי קשר." /> : (
          <div className="stack" style={{ gap: 10 }}>
            {d.contacts.map((p: any, i: number) => (
              <div key={p.id} className="row" style={{ gap: 10 }}>
                <span className="avatar" style={{ width: 34, height: 34, background: AVATAR_BG[i % 3], fontSize: 13 }}>{p.full_name[0]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.full_name}</div>
                  <div className="card-meta">
                    {p.contact_type === 'physician'
                      ? [p.relation, p.note].filter(Boolean).join(' · ')
                      : [p.relation, p.is_orderer ? 'מזמין/ת השירות' : null, p.permission === 'full' ? 'הרשאה מלאה' : 'צפייה בלבד'].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="card-title">מסמכים משפטיים</div><Badge>מורשים בלבד</Badge>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          {d.documents.map((doc: any) => (
            <div key={doc.id} className="item-box row" style={{ gap: 8, padding: '9px 11px', fontSize: 13.5 }}><Icon name="document" size={17} />{doc.title}</div>
          ))}
          {d.documents.length === 0 && <div className="dashed" style={{ padding: '9px 11px', fontSize: 13.5 }}>עוד לא הועלו מסמכים משפטיים.</div>}
        </div>
      </Card>
    </aside>
  )
}

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <div className="card-title" style={{ marginBottom: 8 }}>{title}</div>
    <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6 }}>{children}</div>
  </Card>
)
const None = ({ text }: { text: string }) => <span className="muted" style={{ fontWeight: 500 }}>{text}</span>

function Medical({ d }: { d: ClientDetail }) {
  const c = d.client
  const medNote: string | undefined = d.medications.find((m: any) => m.notes)?.notes
  return (
    <>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>תרופות קבועות</div>
          {d.medications.length === 0 && <None text="עוד לא הוזנו תרופות." />}
          {d.medications.map((m: any) => (
            <div key={m.id} className="kv"><span style={{ fontWeight: 600 }}>{[m.name, m.dose].filter(Boolean).join(' ')}</span><span className="muted">{m.schedule ? `/ ${m.schedule}` : ''}</span></div>
          ))}
          {medNote && <p className="card-meta" style={{ marginTop: 8 }}>{medNote}</p>}
        </Card>
        <Card>
          <div className="card-title" style={{ marginBottom: 8 }}>רגישויות ואלרגיות</div>
          {d.allergies.length === 0 ? <None text="לא דווחו רגישויות." /> : (
            <div className="row" style={{ gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {d.allergies.map((x: any) => <Badge key={x.id} tone={x.severity === 'high' ? 'red' : 'orange'}>{x.allergen}</Badge>)}
            </div>
          )}
          <p className="card-meta" style={{ lineHeight: 1.5 }}>מופיע אוטומטית בתדריך לכל מלווה ולכל ספק רפואי שמגיע לבית.</p>
        </Card>
        <InfoCard title="ניידות">{c.mobility_notes ?? <None text="עוד לא הוזן מידע על ניידות." />}</InfoCard>
        <InfoCard title="מצב קוגניטיבי">{c.cognitive_notes ?? <None text="עוד לא הוזן מידע על המצב הקוגניטיבי." />}</InfoCard>
      </div>
      {d.incidents.map((i: any) => (
        <Callout key={i.id} tone="warning" title={`חריגה שדווחה ${formatDM(new Date(i.reported_at))}`}>{i.description}</Callout>
      ))}
    </>
  )
}

const PREF_GROUPS = [['food', 'אוכל ומעדניות'], ['culture', 'תרבות ופנאי'], ['routine', 'הרגלי יום־יום'], ['companion', 'העדפות למלווה']] as const

function Preferences({ d }: { d: ClientDetail }) {
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      {PREF_GROUPS.map(([cat, title]) => {
        const items = d.preferences.filter((p: any) => p.category === cat)
        return (
          <InfoCard key={cat} title={title}>
            {items.length === 0 ? <None text="עוד לא הוזנו העדפות." /> : items.map((p: any) => (
              <div key={p.id}>{p.title}{p.details && <p className="card-meta" style={{ marginTop: 6, lineHeight: 1.5, fontWeight: 500 }}>{p.details}</p>}</div>
            ))}
          </InfoCard>
        )
      })}
    </div>
  )
}

function History({ d }: { d: ClientDetail }) {
  const rows = d.history as any[]
  const ratings = rows.flatMap((t) => (t.task_feedback ?? []).map((f: any) => Number(f.rating)))
  const totalMins = rows.reduce((a, t) => a + (t.checked_in_at && t.checked_out_at ? Math.round((+new Date(t.checked_out_at) - +new Date(t.checked_in_at)) / 60000) : 0), 0)
  if (rows.length === 0) return <Empty text="עוד אין ביקורים שהושלמו. אחרי הביקור הראשון הוא יופיע כאן." />
  return (
    <>
      <Card flush>
        <div className="card-head">
          <h2>ביקורים ושירותים אחרונים</h2>
          <span className="card-meta">{rows.length} ביקורים · <Ltr>{hm(totalMins)}</Ltr> שעות</span>
        </div>
        <div className="table-wrap">
          <table className="table-hist">
            <thead><tr><th>תאריך</th><th>מלווה / ספק</th><th>מה נעשה</th><th>משך</th><th>עלות</th><th /></tr></thead>
            <tbody>
              {rows.map((t) => {
                const staff = one(t.staff_members)?.full_name, vendor = one(t.vendors)?.name
                const mins = t.checked_in_at && t.checked_out_at ? Math.round((+new Date(t.checked_out_at) - +new Date(t.checked_in_at)) / 60000) : null
                const cost = (t.invoice_lines ?? []).reduce((a: number, l: any) => a + Number(l.amount), 0)
                const summary = one(t.visit_summaries)
                return (
                  <tr key={t.id}>
                    <td className="num">{formatDM(parseISO(t.scheduled_date))}</td>
                    <td style={{ fontWeight: 600 }}>{[staff && shortName(staff), vendor].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{t.title}</td>
                    <td>{mins === null ? '—' : <Ltr>{hm(mins)}</Ltr>}</td>
                    <td className="num nowrap">{cost ? money(cost) : '—'}</td>
                    <td>{summary ? <a href="#" onClick={(e) => e.preventDefault()}>סיכום ביקור</a> : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {ratings.length > 0 && (
        <Card size="sm">
          <div className="row" style={{ gap: 12, alignItems: 'baseline' }}>
            <span className="num" style={{ font: '900 26px var(--font-num)', color: 'var(--brand-link)' }}>{(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)}</span>
            <span className="card-meta">מתוך {ratings.length} משובים של המשפחה</span>
          </div>
        </Card>
      )}
    </>
  )
}

const PLATINUM_BENEFITS = ['מפגשי בוקר — קפה ומאפה', 'ביקור שישי חודשי — חלה, עיתון, פרחים', 'רכב יוקרה או מונית VIP לבילויים', 'ליווי נציג בכל ביקור טכנאי', 'תיאום מראש — 3 ימים', 'אחזקת הבית — עד יום אחד']

function Finance({ d }: { d: ClientDetail }) {
  const c = d.client
  const plan = one(c.membership_plans)
  const lines = (d.invoice?.invoice_lines ?? []) as any[]
  const extras = lines.filter((l) => l.kind !== 'membership').reduce((a, l) => a + Number(l.amount), 0)
  const quota = plan?.monthly_sessions ?? 0
  const pct = quota ? Math.min(100, Math.round((d.sessionsUsed / quota) * 100)) : 0
  const cap = c.monthly_budget_cap ? Number(c.monthly_budget_cap) : null
  return (
    <>
      <div className="grid cols-3">
        <Card size="sm">
          <div className="card-label">דמי חברות חודשיים</div>
          <div className="stat-figure">{plan ? money(Number(plan.monthly_price)) : '—'}</div>
          <div className="card-meta">{c.card_last4 ? <>נגבה ב-1 לחודש · כרטיס מסתיים ב-<Ltr>{c.card_last4}</Ltr></> : 'עוד לא הוגדר אמצעי תשלום'}</div>
        </Card>
        <Card size="sm">
          <div className="card-label">מפגשים שנוצלו החודש</div>
          <div className="stat-figure"><Ltr>{d.sessionsUsed} / {quota}</Ltr></div>
          <Progress pct={pct} />
          <div className="card-meta" style={{ marginTop: 6 }}>{plan?.hours_per_session ? `${plan.hours_per_session} שעות למפגש` : 'לפי מסלול'}</div>
        </Card>
        <Card size="sm">
          <div className="card-label">חיובים נוספים החודש</div>
          <div className="stat-figure">{money(extras)}</div>
          <div className="card-meta">קבלנים, נסיעות וקבלות שנסרקו</div>
        </Card>
      </div>
      <Card>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <div className="card-title">פירוט לחשבונית{d.invoice ? ` ${formatDM(parseISO(d.invoice.period_month))}`.replace(/^ 1\./, ' ') : ''}</div>
          <Button variant="secondary" size="sm" icon="export">הפקת דוח חודשי</Button>
        </div>
        {lines.length === 0 && <p className="muted" style={{ padding: '8px 0' }}>עוד אין חשבונית לחודש הזה. היא תיווצר בסגירת החודש.</p>}
        {lines.map((l) => <div key={l.id} className="kv"><span>{l.description}</span><span className="v">{money(Number(l.amount))}</span></div>)}
        {lines.length > 0 && <div className="kv total"><span>סה"כ לחיוב</span><span className="v">{money(lines.reduce((a, l) => a + Number(l.amount), 0))}</span></div>}
      </Card>
      {plan?.id === 'platinum' && (
        <Card>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div className="card-title">הטבות המסלול · פלטינום</div><Badge tone="green">תגמול נקודות בקצב גבוה</Badge>
          </div>
          <div className="grid cols-2" style={{ gap: 8 }}>{PLATINUM_BENEFITS.map((b) => <div key={b} className="item-box">{b}</div>)}</div>
        </Card>
      )}
      {cap !== null && (
        <Callout title="תקרה תקציבית">
          הוגדרה תקרה של {money(cap)} לחודש מעבר לדמי החברות. נותרו {money(Math.max(0, cap - extras))} — התראה תישלח בהתקרבות לרף.
        </Callout>
      )}
    </>
  )
}

export default function ClientFile() {
  const { id } = useParams()
  const { openForm } = useStore()
  const [tab, setTab] = useState<TabKey>('med')
  const [d, setD] = useState<ClientDetail | null | undefined>(undefined)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setD(undefined); setFailed(false)
    loadClientDetail(id ?? '')
      .then((r) => { if (!cancelled) setD(r) })
      .catch((e) => { console.error('client file load failed', e); if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [id])

  if (failed) {
    return <main className="container page-body stack">
        <Callout tone="warning" title="לא הצלחנו לטעון את התיק">בדקי את החיבור ונסי לרענן את הדף.</Callout>
        <div><Link to="/admin/clients">חזרה ללקוחות</Link></div>
      </main>
  }
  if (d === undefined) return <main className="container page-body"><p className="muted" role="status">טוענת נתונים…</p></main>
  if (d === null) {
    return (
      <main className="container page-body">
        <Empty text="לא מצאנו את הלקוח/ה הזה/זו. אפשר לחזור לרשימה ולבחור מחדש." action={<Link to="/admin/clients">חזרה ללקוחות</Link>} />
      </main>
    )
  }

  const c = d.client
  const plan = one(c.membership_plans)
  const trial = c.trial_ends_on && c.trial_ends_on >= TODAY
  return (
    <>
      <Header
        lead={
          <>
            <span style={{ width: 1, height: 22, background: 'rgba(255,255,255,.22)' }} />
            <Link to="/admin/clients" className="btn on-navy sm"><Icon name="chevron-right" size={16} />ללקוחות</Link>
          </>
        }
        title={`תיק לקוח · ${c.full_name}${age(c.birth_date) ? `, ${age(c.birth_date)}` : ''}`}
        sub={[one(c.regions)?.name, c.member_since ? `לקוח/ה מאז ${ymShort(c.member_since)}` : null].filter(Boolean).join(' · ')}
        actions={
          <>
            <span className="plan-pill">{trial ? 'תקופת היכרות' : `מסלול ${plan?.name ?? '—'}`}</span>
            <Button variant="on-navy" size="sm" icon="message">הודעה למשפחה</Button>
            <Button size="sm" icon="plus" onClick={() => openForm('task', { clientId: c.id })}>הזמנת שירות</Button>
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
        <div className="file-grid">
          <Sidebar d={d} />
          <div className="stack">
            {tab === 'med' && <Medical d={d} />}
            {tab === 'pref' && <Preferences d={d} />}
            {tab === 'hist' && <History d={d} />}
            {tab === 'fin' && <Finance d={d} />}
          </div>
        </div>
      </main>
    </>
  )
}
