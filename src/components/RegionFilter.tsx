import { useEffect, useRef, useState } from 'react'
import { Icon } from './ui'

/** Multi-select city filter: dropdown with search + counts; picked cities show as removable chips. Empty = all. */
export default function RegionFilter({ regions, counts, selected, onChange }: {
  regions: string[]; counts: Record<string, number>; selected: string[]; onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [open])

  const toggle = (r: string) => onChange(selected.includes(r) ? selected.filter((x) => x !== r) : [...selected, r])
  const shown = regions.filter((r) => r.includes(q.trim()))

  return (
    <div className="region-filter" ref={box}>
      <button type="button" className={`chip ${selected.length ? 'active' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        עיר: {selected.length ? `${selected.length} נבחרו` : 'הכול'} ▾
      </button>
      {selected.map((r) => (
        <button key={r} type="button" className="chip active" onClick={() => toggle(r)} aria-label={`הסר את ${r}`}>{r} ✕</button>
      ))}
      {open && (
        <div className="region-pop" role="listbox" aria-multiselectable="true">
          <input className="input" type="search" placeholder="חיפוש עיר" value={q} onChange={(e) => setQ(e.target.value)} autoFocus aria-label="חיפוש עיר" />
          <div className="region-list">
            {shown.map((r) => (
              <label key={r} className="region-opt">
                <input type="checkbox" checked={selected.includes(r)} onChange={() => toggle(r)} />
                <span>{r}</span>
                <span className="region-count">{counts[r] ?? 0}</span>
              </label>
            ))}
            {!shown.length && <div className="region-empty">אין עיר כזאת</div>}
          </div>
          {selected.length > 0 && <button type="button" className="btn quiet sm" onClick={() => onChange([])}><Icon name="x" size={14} /> נקה בחירה</button>}
        </div>
      )}
    </div>
  )
}
