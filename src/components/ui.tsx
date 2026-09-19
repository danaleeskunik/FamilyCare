import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

const ICONS: Record<string, string> = {
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20l.8-3.6L15.6 5.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L7.6 19.2 4 20z',
  trash: 'M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M6 7l1 13h10l1-13',
  export: 'M12 3v12M7.5 10.5L12 15l4.5-4.5M4 19h16',
  message: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  check: 'M4 12.5l5 5L20 6.5',
  document: 'M6 3h7l5 5v13H6zM13 3v5h5',
  bell: 'M12 3a5 5 0 0 0-5 5v3c0 1.2-.5 2.3-1.4 3.1L4 16h16l-1.6-1.9C17.5 13.3 17 12.2 17 11V8a5 5 0 0 0-5-5zM9.5 19a2.5 2.5 0 0 0 5 0',
  warning: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  calendar: 'M4 5h16v15H4zM4 10h16M8 3v4M16 3v4',
  'chevron-left': 'M14 6l-6 6 6 6',
  'chevron-right': 'M10 6l6 6-6 6',
  image: 'M3 5h18v14H3zM7 13l3-3 4 4 3-2M8.5 7.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z',
}

export function Icon({ name, size = 18 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'on-navy' | 'quiet' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: keyof typeof ICONS
}

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, ...rest }: BtnProps) {
  const cls = ['btn', size === 'md' ? '' : size, variant === 'primary' ? '' : variant, className].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'green' | 'blue' | 'orange' | 'red'; children: ReactNode }) {
  return <span className={`badge ${tone === 'neutral' ? '' : tone}`}>{children}</span>
}

export function Card({ size, flush, interactive, className = '', style, children }: {
  size?: 'sm' | 'lg'; flush?: boolean; interactive?: boolean; className?: string; style?: CSSProperties; children: ReactNode
}) {
  const cls = ['card', size, flush && 'flush', interactive && 'interactive', className].filter(Boolean).join(' ')
  return <div className={cls} style={style}>{children}</div>
}

export function CardHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card-head">
      <h2>{title}</h2>
      {children && <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>{children}</div>}
    </div>
  )
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warning' | 'tip'; title: string; children: ReactNode }) {
  return (
    <div className={`callout ${tone === 'info' ? '' : tone}`} role="note">
      <div className="t">{title}</div>
      <div className="b">{children}</div>
    </div>
  )
}

export function StatCard({ label, figure, note, color, onClick }: { label: string; figure: ReactNode; note: string; color?: string; onClick?: () => void }) {
  const inner = (
    <>
      <div className="card-label">{label}</div>
      <div className="stat-figure" style={color ? { color } : undefined}>{figure}</div>
      <div className="card-meta">{note}</div>
      {onClick && <div className="more">לפירוט ←</div>}
    </>
  )
  if (onClick) {
    return <button type="button" className="card sm interactive stat" onClick={onClick}>{inner}</button>
  }
  return <Card size="sm">{inner}</Card>
}

/** Numeric run that must read LTR inside RTL text (ratios, durations, phones, codes). */
export function Ltr({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <span className={`num ltr ${className}`} style={style}>{children}</span>
}

const LRM = '‎'
/** Currency: leading LRM, shekel sign after the figure. */
export function money(n: number) {
  return `${LRM}${n.toLocaleString('en-US')} ₪`
}

export function Progress({ pct, color = 'var(--brand-action)', thick }: { pct: number; color?: string; thick?: boolean }) {
  return (
    <div className={`progress ${thick ? 'thick' : ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function Empty({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="dashed" style={{ padding: 18, textAlign: 'center' }}>
      <p style={{ marginBottom: action ? 10 : 0 }}>{text}</p>
      {action}
    </div>
  )
}

/** Edit + delete icon buttons for a table row. `what` names the record for screen readers. */
export function RowActions({ what, onEdit, onDelete }: { what: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="row" style={{ gap: 2, justifyContent: 'flex-end' }}>
      <button type="button" className="icon-btn" aria-label={`עריכת ${what}`} title="עריכה" onClick={onEdit}><Icon name="edit" size={17} /></button>
      <button type="button" className="icon-btn danger" aria-label={`מחיקת ${what}`} title="מחיקה" onClick={onDelete}><Icon name="trash" size={17} /></button>
    </div>
  )
}
