import { supabase } from './supabase'
import { INTAKE, fieldIsPrivate } from '../data/intake'

export type Answers = Record<string, string>

/** Postgres / PostgREST "table is missing" errors: the 0016 migration has not been run yet. */
export const missingTable = (e: { code?: string; message?: string } | null) => !!e && (['42P01', 'PGRST205'].includes(e.code ?? '') || /schema cache|does not exist/i.test(e.message ?? ''))

/** Keeps only non-empty string answers. */
export const cleanAnswers = (a: unknown): Answers =>
  Object.fromEntries(Object.entries((a ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, (v as string).trim()]))

/** Saves the questionnaire: sensitive answers go to the admin-only table. */
export async function saveIntake(clientId: string, values: Answers): Promise<{ ok: boolean; setup: boolean; pub: Answers; priv: Answers }> {
  const pub: Answers = {}
  const priv: Answers = {}
  for (const s of INTAKE) for (const f of s.fields) {
    const val = (values[f.key] ?? '').trim()
    if (val) (fieldIsPrivate(s, f) ? priv : pub)[f.key] = val
  }
  const [a, b] = await Promise.all([
    supabase.from('client_intake').upsert({ client_id: clientId, answers: pub }, { onConflict: 'client_id' }),
    supabase.from('client_intake_private').upsert({ client_id: clientId, answers: priv }, { onConflict: 'client_id' }),
  ])
  const err = a.error ?? b.error
  if (err) console.error('intake save failed', err)
  return { ok: !err, setup: missingTable(a.error) || missingTable(b.error), pub, priv }
}
