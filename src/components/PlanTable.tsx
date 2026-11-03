import { Badge, RowActions } from './ui'
import { useStore } from '../store/AppStore'
import { DAY_NAMES, formatDM, parseISO } from '../lib/dates'
import { ITEM_KINDS, ITEM_STATUSES, TODAY, type PlanItem } from '../data/model'

export const OPEN_STATUSES = ['new', 'in_progress']
export const isOverdue = (i: PlanItem) => !!i.dueDate && i.dueDate < TODAY && OPEN_STATUSES.includes(i.status)
const kindLabel = (k: string) => ITEM_KINDS.find((x) => x.value === k)?.label ?? k

/** The planning-board table (what the office has to arrange ahead of a visit). Used by the planning page and by today's board. */
export default function PlanTable({ list }: { list: PlanItem[] }) {
  const { admins, openForm, askDelete, setItemStatus, setItemAssignee } = useStore()
  const overdue = isOverdue
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


  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>אירוע</th><th>סוג</th><th>לקוח/ה</th><th>מה לתאם</th><th>ספק</th><th>בטיפול של</th><th>סטטוס</th><th>לסיים עד</th><th><span className="sr-only">פעולות</span></th></tr></thead>
        <tbody>{list.map((i) => <Row key={i.id} i={i} />)}</tbody>
      </table>
    </div>
  )
}
