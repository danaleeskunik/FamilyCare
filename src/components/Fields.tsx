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
