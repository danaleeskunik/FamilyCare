import { useId } from 'react'
import { SelectField, TextAreaField, TextField } from './Fields'
import { INTERVIEW, INTERVIEW_GUIDE, type IvAnswers, type IvField } from '../data/interview'

const list = (v: string) => (v ? v.split('\n') : [])

function Checks({ f, value, onChange }: { f: IvField; value: string; onChange: (v: string) => void }) {
  const id = useId()
  const on = list(value)
  const toggle = (o: string) => onChange((on.includes(o) ? on.filter((x) => x !== o) : [...on, o]).join('\n'))
  return (
    <fieldset className="intake-checks" aria-labelledby={id}>
      <legend id={id}>{f.label}</legend>
      {f.options?.map((o) => (
        <label key={o} className="intake-check"><input type="checkbox" checked={on.includes(o)} onChange={() => toggle(o)} /><span>{o}</span></label>
      ))}
    </fieldset>
  )
}

function Rate({ f, value, onChange }: { f: IvField; value: string; onChange: (v: string) => void }) {
  const id = useId()
  return (
    <fieldset className="iv-rate" aria-labelledby={id}>
      <legend id={id}>{f.label}</legend>
      <div className="iv-rate-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`iv-dot${value === String(n) ? ' on' : ''}`}>
            <input type="radio" name={id} checked={value === String(n)} onChange={() => onChange(String(n))} />
            <span>{n}</span>
          </label>
        ))}
        {value && <button type="button" className="iv-clear" onClick={() => onChange('')}>ניקוי</button>}
      </div>
    </fieldset>
  )
}

/** The interview as an editable form: one collapsible block per section. Controlled by the parent. */
export default function InterviewFields({ values, onChange }: { values: IvAnswers; onChange: (key: string, value: string) => void }) {
  return (
    <div className="intake-form">
      <details className="intake-guide">
        <summary>הנחיות למראיין/ת</summary>
        <ul>{INTERVIEW_GUIDE.map((g) => <li key={g}>{g}</li>)}</ul>
      </details>
      {INTERVIEW.map((s, i) => {
        const filled = s.fields.filter((f) => values[f.key]).length
        return (
          <details key={s.id} className="intake-sec" open={i === 0 || s.id === 'situations'}>
            <summary><span>{s.title}</span><span className="intake-count">{filled}/{s.fields.length}</span></summary>
            <div className="intake-sec-body">
              {s.fields.map((f) => {
                const v = values[f.key] ?? ''
                const set = (val: string) => onChange(f.key, val)
                if (f.kind === 'checks') return <Checks key={f.key} f={f} value={v} onChange={set} />
                if (f.kind === 'rate') return <Rate key={f.key} f={f} value={v} onChange={set} />
                if (f.kind === 'long') return <TextAreaField key={f.key} label={f.label} value={v} onChange={set} rows={3} />
                if (f.kind === 'choice') return <SelectField key={f.key} label={f.label} value={v} onChange={set} options={f.options ?? []} placeholder="לא נבחר" />
                return <TextField key={f.key} label={f.label} type={f.kind === 'date' ? 'date' : undefined} dir={f.ltr ? 'ltr' : undefined} value={v} onChange={(e) => set(e.target.value)} />
              })}
            </div>
          </details>
        )
      })}
    </div>
  )
}
