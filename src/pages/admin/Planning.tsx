import { useMemo, useState } from 'react'
import { Badge, Button, Card, Icon, RowActions, StatCard } from '../../components/ui'
import { useStore } from '../../store/AppStore'
import { DAY_NAMES, formatDM, monthLabel, parseISO } from '../../lib/dates'
import { ITEM_KINDS, ITEM_STATUSES, TODAY, type PlanItem } from '../../data/model'

const OPEN = ['new', 'in_progress']
const kindLabel = (k: string) => ITEM_KINDS.find((x) => x.value === k)?.label ?? k
type Filter = 'all' | 'open' | 'ordered' | 'done'
const FILTERS: [Filter, string][] = [['all', 'הכול'], ['open', 'דורש טיפול'], ['ordered', 'בוצע (הוזמן)'], ['done', 'הסתיים']]

export default function Planning() {
  const { items, admins, openForm, askDelete, setItemStatus, setItemAssignee } = useStore()
  const [month, setMonth] = useState(() => new Date(parseISO(TODAY).getFullYear(), parseISO(TODAY).getMonth(), 1))
  const [filter, setFilter] = useState<Filter>('all')
  const [kind, setKind] = useState('')
  const [assignee, setAssignee] = useState('')

  const ym = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  const overdue = (i: PlanItem) => !!i.dueDate && i.dueDate < TODAY && OPEN.includes(i.status)
  const match = (i: PlanItem) =>
    (filter === 'all' || (filter === 'open' ? OPEN.includes(i.status) : i.status === filter)) &&
    (!kind || i.kind === kind) && (!assignee || (assignee === 'none' ? !i.assigneeId : i.assigneeId === assignee))

  const inMonth = items.filter((i) => i.eventDate.startsWith(ym))
  const carried = items.filter((i) => !i.eventDate.startsWith(ym) && overdue(i) && match(i)) // overdue from other months
  const rows = inMonth.filter(match)

  const grouped = useMemo(() => {
    const m = new Map<string, PlanItem[]>()
    for (const i of rows) m.set(i.eventDate, [...(m.get(i.eventDate) ?? []), i])
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ym, filter, kind, assignee])

  const step = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1))

  const Row = ({ i }: { i: PlanItem }) => {
    const st = ITEM_STATUSES.find((s) => s.value === i.status)
    return (
      <tr>
        <td className="num nowrap">{DAY_NAMES[parseISO(i.eventDate).getDay()]} {formatDM(parseISO(i.eventDate))}</td>
        <td><Badge>{kindLabel(i.kind)}</Badge></td>
        <td className="name">{i.client}</td>
        <td>{i.title}{i.notes && <div className="card-meta">{i.notes}</div>}</td>
        <td>{i.vendor ?? '—'}</td>
        <td>
          <select className="input" style={{ minWidth: 130 }} aria-label={`בטיפול של, ${i.title}`} value={i.assigneeId ?? ''} onChange={(e) => setItemAssignee(i.id, e.target.value || null)}>
            <option value="">עוד לא הוקצה</option>
            {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </td>
        <td>
          <select className={`input status-select ${st?.tone ?? 'neutral'}`} aria-label={`סטטוס, ${i.title}`} value={i.status} onChange={(e) => setItemStatus(i.id, e.target.value)}>
            {ITEM_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </td>
        <td className="nowrap" style={overdue(i) ? { color: 'var(--danger)', fontWeight: 500 } : undefined}>
          {i.dueDate ? formatDM(parseISO(i.dueDate)) : '—'}{overdue(i) && <div style={{ fontSize: 12 }}>באיחור</div>}
        </td>
        <td><RowActions what={`הפריט ${i.title}`} onEdit={() => openForm('item', { id: i.id })} onDelete={() => askDelete('item', i.id)} /></td>
      </tr>
    )
  }

  const Table = ({ list }: { list: PlanItem[] }) => (
    <div className="table-wrap">
      <table>
        <thead><tr><th>אירוע</th><th>סוג</th><th>לקוח/ה</th><th>מה לתאם</th><th>ספק</th><th>בטיפול של</th><th>סטטוס</th><th>לסיים עד</th><th><span className="sr-only">פעולות</span></th></tr></thead>
        <tbody>{list.map((i) => <Row key={i.id} i={i} />)}</tbody>
      </table>
    </div>
  )

  const allOverdue = items.filter(overdue).length
  return (
    <>
      <div className="grid cols-4">
        <StatCard label="דורשים טיפול החודש" figure={inMonth.filter((i) => OPEN.includes(i.status)).length} note="חדשים ובטיפול" />
        <StatCard label="באיחור" figure={allOverdue} note="עברו את מועד סיום התיאום" color={allOverdue ? 'var(--danger)' : undefined} />
        <StatCard label="ללא אחראי/ת" figure={inMonth.filter((i) => !i.assigneeId && OPEN.includes(i.status)).length} note="עוד לא הוקצו לאיש משרד" color="var(--warning)" />
        <StatCard label="הסתיימו החודש" figure={inMonth.filter((i) => i.status === 'done').length} note={`מתוך ${inMonth.length} פריטים`} />
      </div>

      <Card flush>
        <div className="card-head">
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" aria-label="חודש קודם" onClick={() => step(-1)}><Icon name="chevron-right" /></button>
            <h2 style={{ minWidth: 130, textAlign: 'center' }} aria-live="polite">{monthLabel(month)}</h2>
            <button className="icon-btn" aria-label="חודש הבא" onClick={() => step(1)}><Icon name="chevron-left" /></button>
            <Button variant="secondary" size="sm" onClick={() => setMonth(new Date(parseISO(TODAY).getFullYear(), parseISO(TODAY).getMonth(), 1))}>החודש</Button>
          </div>
          <Button size="sm" icon="plus" onClick={() => openForm('item')}>פריט חדש</Button>
        </div>
        <div className="row" style={{ gap: 8, padding: '12px 18px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-card)' }}>
          {FILTERS.map(([k, label]) => <button key={k} className={`chip ${filter === k ? 'active' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}</button>)}
          <select className="input" style={{ width: 'auto', minWidth: 120 }} aria-label="סינון לפי סוג" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">כל הסוגים</option>{ITEM_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 140 }} aria-label="סינון לפי אחראי" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">כל האחראים</option><option value="none">ללא אחראי</option>{admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {carried.length > 0 && (
          <div>
            <div className="card-label" style={{ padding: '12px 18px 0', color: 'var(--danger)' }}>באיחור מחודשים אחרים</div>
            <Table list={carried} />
          </div>
        )}
        {grouped.length === 0 && carried.length === 0 && (
          <p className="muted" style={{ padding: 18 }}>אין פריטי תיאום בחודש הזה{filter !== 'all' || kind || assignee ? ' לפי הסינון' : ''}. אפשר להוסיף פריט חדש, למשל הסעה או כרטיסים לאירוע.</p>
        )}
        {grouped.length > 0 && <Table list={grouped.flatMap(([, l]) => l)} />}
      </Card>
    </>
  )
}
