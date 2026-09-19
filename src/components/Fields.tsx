import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

function Wrap({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <div className="hint" id={`${id}-d`}>{hint}</div>}
      {error && <div className="err" id={`${id}-d`} role="alert">{error}</div>}
    </div>
  )
}

export function TextField({ label, error, hint, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint}>
      <input id={id} className="input" aria-invalid={!!error} aria-describedby={error || hint ? `${id}-d` : undefined} {...rest} />
    </Wrap>
  )
}

export function SelectField({ label, error, value, onChange, options, placeholder }: {
  label: string; error?: string; value: string; onChange: (v: string) => void
  options: (string | { value: string; label: string })[]; placeholder?: string
}) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error}>
      <select id={id} className="input" value={value} aria-invalid={!!error} aria-describedby={error ? `${id}-d` : undefined} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value
          const l = typeof o === 'string' ? o : o.label
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </Wrap>
  )
}

export function CheckGroup({ label, error, options, value, onChange }: {
  label: string; error?: string; options: { value: number; label: string }[]; value: number[]; onChange: (v: number[]) => void
}) {
  const id = useId()
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={error ? `${id}-d` : undefined}>
      <legend style={{ font: '700 13px var(--font-ui)', marginBottom: 5, padding: 0 }}>{label}</legend>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {options.map((o) => {
          const on = value.includes(o.value)
          return (
            <label key={o.value} className={`chip ${on ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 14px' }}>
              <input type="checkbox" checked={on} onChange={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])} style={{ position: 'absolute', opacity: 0 }} />
              {o.label}
            </label>
          )
        })}
      </div>
      {error && <div className="err" id={`${id}-d`} role="alert">{error}</div>}
    </fieldset>
  )
}

export function TextAreaField({ label, error, hint, value, onChange, rows = 3, placeholder }: {
  label: string; error?: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string
}) {
  const id = useId()
  return (
    <Wrap id={id} label={label} error={error} hint={hint}>
      <textarea id={id} className="input" rows={rows} value={value} placeholder={placeholder} aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-d` : undefined} onChange={(e) => onChange(e.target.value)} style={{ resize: 'vertical', lineHeight: 1.5 }} />
    </Wrap>
  )
}
