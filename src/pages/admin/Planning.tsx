import { useMemo, useState } from 'react'
import { Button, Card, Icon, StatCard } from '../../components/ui'
import PlanTable, { OPEN_STATUSES, isOverdue } from '../../components/PlanTable'
import { useStore } from '../../store/AppStore'
import { monthLabel, parseISO } from '../../lib/dates'
import { ITEM_KINDS, TODAY, type PlanItem } from '../../data/model'

const OPEN = OPEN_STATUSES
type Filter = 'all' | 'open' | 'ordered' | 'done'
const FILTERS: [Filter, string][] = [['all', 'הכול'], ['open', 'דורש טיפול'], ['ordered', 'בוצע (הוזמן)'], ['done', 'הסתיים']]

export default function Planning() {
  const { items, admins, openForm } = useStore()
  const [month, setMonth] = useState(() => new Date(parseISO(TODAY).getFullYear(), parseISO(TODAY).getMonth(), 1))
  const [filter, setFilter] = useState<Filter>('all')
  const [kind, setKind] = useState('')
  const [assignee, setAssignee] = useState('')

  const ym = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  const overdue = isOverdue
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
            <PlanTable list={carried} />
          </div>
        )}
        {grouped.length === 0 && carried.length === 0 && (
          <p className="muted" style={{ padding: 18 }}>אין פריטי תיאום בחודש הזה{filter !== 'all' || kind || assignee ? ' לפי הסינון' : ''}. אפשר להוסיף פריט חדש, למשל הסעה או כרטיסים לאירוע.</p>
        )}
        {grouped.length > 0 && <PlanTable list={grouped.flatMap(([, l]) => l)} />}
      </Card>
    </>
  )
}
