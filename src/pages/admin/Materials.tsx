import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Icon, RowActions } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { MATERIALS } from '../../data/materials'
import { useStore } from '../../store/AppStore'

const url = (path: string) => `${import.meta.env.BASE_URL}materials/${path}`

type CompanyDoc = { id: string; title: string; storage_path: string }

/** Contracts and forms for internal use. They sit in a private bucket and open through a two-minute link: never a public address. */
function ContractsLibrary() {
  const { notify } = useStore()
  const [docs, setDocs] = useState<CompanyDoc[] | null>(null)
  const [setup, setSetup] = useState(false)
  const [busy, setBusy] = useState(false)
  const load = async () => {
    const { data, error } = await supabase.from('company_documents').select('id, title, storage_path').order('title')
    if (error) { setSetup(true); return }
    setSetup(false); setDocs((data ?? []) as CompanyDoc[])
  }
  useEffect(() => { void load() }, [])

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    let ok = 0
    for (const file of Array.from(files)) {
      if (file.size > 15_000_000) { notify(`${file.name}: הקובץ גדול מ-15MB`); continue }
      const ext = (file.name.match(/\.(\w{2,5})$/)?.[1] ?? 'bin').toLowerCase()
      const key = `${crypto.randomUUID()}.${ext}` // storage keys must be plain ASCII; the Hebrew title lives in the table
      const up = await supabase.storage.from('company-documents').upload(key, file, { contentType: file.type || undefined })
      if (up.error) { console.error('contract upload failed', up.error); notify(`לא הצלחנו להעלות: ${file.name}`); continue }
      const { error } = await supabase.from('company_documents').insert({ title: file.name.replace(/\.\w{2,5}$/, ''), storage_path: key })
      if (error) { console.error('contract save failed', error); notify(`הקובץ הועלה אבל לא נשמר: ${file.name}`); continue }
      ok++
    }
    setBusy(false)
    if (ok) { notify(ok === 1 ? 'הקובץ הועלה' : `${ok} קבצים הועלו`); void load() }
  }
  const open = async (d: CompanyDoc) => {
    const { data, error } = await supabase.storage.from('company-documents').createSignedUrl(d.storage_path, 120)
    if (error || !data) { notify('לא הצלחנו לפתוח את הקובץ'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }
  const remove = async (d: CompanyDoc) => {
    await supabase.storage.from('company-documents').remove([d.storage_path])
    const { error } = await supabase.from('company_documents').delete().eq('id', d.id)
    if (error) { notify('לא הצלחנו למחוק'); return }
    void load()
  }

  return (
    <section className="stack">
      <h2 className="mat-group">הסכמים וחוזים</h2>
      {setup && <Card><p className="muted">כדי להפעיל את הספרייה צריך להריץ פעם אחת את upgrade_0028_company_documents.sql ב-Supabase.</p></Card>}
      {!setup && (
        <Card>
          <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <p className="muted" style={{ lineHeight: 1.6, maxWidth: 560 }}>לשימוש פנימי בלבד. הקבצים שמורים באחסון פרטי, נפתחים בקישור זמני ואינם נגישים לאף אחד מחוץ למנהלים.</p>
            <label className="btn secondary sm" style={{ cursor: 'pointer' }}><Icon name="plus" size={16} />{busy ? 'מעלה…' : 'העלאת קבצים'}
              <input type="file" multiple accept="application/pdf,.doc,.docx,image/*" hidden disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = '' }} />
            </label>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {(docs ?? []).map((d) => (
              <div key={d.id} className="item-box row" style={{ gap: 8, padding: '9px 11px', fontSize: 14, justifyContent: 'space-between' }}>
                <button type="button" className="row" style={{ gap: 8, background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'start' }} onClick={() => void open(d)}>
                  <Icon name="document" size={17} />{d.title}
                </button>
                <RowActions what={d.title} onEdit={() => void open(d)} onDelete={() => void remove(d)} />
              </div>
            ))}
            {docs && docs.length === 0 && <div className="dashed" style={{ padding: '9px 11px', fontSize: 14 }}>עוד לא הועלו קבצים.</div>}
          </div>
        </Card>
      )}
    </section>
  )
}

export default function Materials() {
  const { notify } = useStore()
  const areas = [
    { id: 'docs', title: null, items: MATERIALS.filter((m) => m.area !== 'social') },
    { id: 'social', title: 'רשתות חברתיות', items: MATERIALS.filter((m) => m.area === 'social') },
  ]

  const copyHref = async (full: string) => {
    try { await navigator.clipboard.writeText(full); notify('הקישור הועתק') } catch { notify(full) }
  }
  const copy = (file: string) => copyHref(new URL(url(file), window.location.origin).href)
  // Postcard link: pasted in WhatsApp it shows a card (image, title, short text); opening it goes straight to the PDF.
  const shareHref = (slug: string) => new URL(`${import.meta.env.BASE_URL}s/${slug}/`, window.location.origin).href

  return (
    <>
      <Card>
        <div className="card-title">חומרים</div>
        <p className="muted" style={{ marginTop: 4, lineHeight: 1.6 }}>
          קבצים מוכנים לשליחה ולפרסום. "העתקת קישור" מעתיקה כתובת שאפשר להדביק בוואטסאפ או במייל, והקובץ נפתח ממנה גם למי שאין לו חשבון. "שליחה בוואטסאפ" שולחת גלויה יפה עם תמונה וכותרת, ולחיצה עליה פותחת את הקובץ.
        </p>
      </Card>
      {areas.map((area) => (
        <div key={area.id} className="stack">
          {area.title && (
            <Card>
              <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div className="card-title">{area.title}</div>
                  <p className="muted" style={{ marginTop: 4, lineHeight: 1.6 }}>
                    תמונות מוכנות לפרסום בלינקדאין, פייסבוק, אינסטגרם ובוואטסאפ: סטוריז, פוסטים, טיפים שבועיים וכל תחומי השירות. בכל תמונה הטלפון של רועי וכתובת האתר.
                  </p>
                </div>
                <a className="btn sm" href={url('social-images.zip')} download>הורדת כל התמונות (ZIP)</a>
              </div>
            </Card>
          )}
          {[...new Set(area.items.map((m) => m.group))].map((g) => (
            <section key={g} className="stack">
              <h2 className="mat-group">{g}</h2>
              <div className="mat-grid">
                {area.items.filter((m) => m.group === g).map((m) => (
                  <article key={m.id} className="mat-card">
                    <a className="mat-thumb" href={url(m.file)} target="_blank" rel="noreferrer" aria-label={`פתיחת ${m.title}`}>
                      <img src={url(`thumbs/${m.thumb}`)} alt="" loading="lazy" />
                      <span className="mat-kind">{m.kind}</span>
                    </a>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <div className="mat-actions">
                      {m.web && <Link className="btn sm" to={m.web}>מילוי ברשת</Link>}
                      <a className={`btn sm ${m.web ? 'secondary' : ''}`} href={url(m.file)} target="_blank" rel="noreferrer">{m.web ? 'להדפסה' : 'פתיחה'}</a>
                      <a className="btn secondary sm" href={url(m.file)} download>הורדה</a>
                      {!m.noShare ? (
                        <>
                          <a className="btn sm" href={`https://wa.me/?text=${encodeURIComponent(shareHref(m.share ?? m.id))}`} target="_blank" rel="noreferrer">שליחה בוואטסאפ</a>
                          <button type="button" className="btn secondary sm" onClick={() => void copyHref(shareHref(m.share ?? m.id))}>העתקת קישור לוואטסאפ</button>
                          <a className="btn secondary sm" href={`${import.meta.env.BASE_URL}s/${m.share ?? m.id}/card.jpg`} download={`family-care-${m.share ?? m.id}.jpg`}>הורדת הגלויה</a>
                        </>
                      ) : (
                        <button type="button" className="btn secondary sm" onClick={() => void copy(m.file)}>העתקת קישור</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ))}
      <ContractsLibrary />
    </>
  )
}
