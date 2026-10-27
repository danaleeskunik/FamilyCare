import { Fragment, useId } from 'react'
import { SelectField, TextAreaField, TextField } from './Fields'
import { Badge } from './ui'
import { INTAKE, INTAKE_GUIDE, INTAKE_OPENING, PAYMENT_METHODS, fieldIsPrivate, type IntakeField } from '../data/intake'
import type { Answers } from '../lib/intake'

const list = (v: string) => (v ? v.split('\n') : [])

function Checks({ f, label, value, onChange }: { f: IntakeField; label: string; value: string; onChange: (v: string) => void }) {
  const id = useId()
  const on = list(value)
  const toggle = (o: string) => onChange((on.includes(o) ? on.filter((x) => x !== o) : [...on, o]).join('\n'))
  return (
    <fieldset className="intake-checks" aria-labelledby={id}>
      <legend id={id}>{label}</legend>
      {f.options?.map((o) => (
        <label key={o} className="intake-check">
          <input type="checkbox" checked={on.includes(o)} onChange={() => toggle(o)} />
          <span>{o}</span>
        </label>
      ))}
    </fieldset>
  )
}

/** The whole questionnaire as an editable form: one collapsible block per section. Controlled by the parent. */
export default function IntakeFields({ values, onChange }: { values: Answers; onChange: (key: string, value: string) => void }) {
  return (
    <div className="intake-form">
      <details className="intake-guide">
        <summary>הנחיות לנציג</summary>
        <ul>{INTAKE_GUIDE.map((g) => <li key={g}>{g}</li>)}</ul>
        <p><strong>פתיחה לשיחה עם ההורה:</strong> {INTAKE_OPENING}</p>
      </details>
      {INTAKE.map((s, i) => {
        const filled = s.fields.filter((f) => values[f.key]).length
        return (
          <Fragment key={s.id}>
            {s.part && <h3 className="intake-part">{s.part}</h3>}
            <details className="intake-sec" open={i === 0}>
              <summary>
                <span>{s.title}</span>
                <span className="intake-count">{s.private && <Badge tone="orange">מנהלים בלבד</Badge>} {filled}/{s.fields.length}</span>
              </summary>
              <div className="intake-sec-body">
                {s.fields.map((f) => {
                  const label = f.private && !s.private ? `${f.label} (מנהלים בלבד)` : f.label
                  const v = values[f.key] ?? ''
                  const set = (val: string) => onChange(f.key, val)
                  if (f.kind === 'checks') return <Checks key={f.key} f={f} label={label} value={v} onChange={set} />
                  if (f.kind === 'long') return <TextAreaField key={f.key} label={label} value={v} onChange={set} rows={2} />
                  if (f.kind === 'payment') return <SelectField key={f.key} label={label} value={v} onChange={set} options={PAYMENT_METHODS} placeholder="לא נבחר" />
                  return <TextField key={f.key} label={label} dir={f.ltr ? 'ltr' : undefined} value={v} onChange={(e) => set(e.target.value)} />
                })}
              </div>
            </details>
          </Fragment>
        )
      })}
    </div>
  )
}

export { fieldIsPrivate }
