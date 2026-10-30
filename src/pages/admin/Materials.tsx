import { Link } from 'react-router-dom'
import { Card } from '../../components/ui'
import { MATERIALS } from '../../data/materials'
import { useStore } from '../../store/AppStore'

const url = (path: string) => `${import.meta.env.BASE_URL}materials/${path}`

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
          קבצים מוכנים לשליחה ולפרסום. "העתקת קישור" מעתיקה כתובת שאפשר להדביק בוואטסאפ או במייל, והקובץ נפתח ממנה גם למי שאין לו חשבון. בברושורים, "שליחה בוואטסאפ" שולחת גלויה יפה עם תמונה וכותרת, ולחיצה עליה פותחת את הברושור.
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
                      {m.share ? (
                        <>
                          <a className="btn sm" href={`https://wa.me/?text=${encodeURIComponent(`${m.title}\n${shareHref(m.share)}`)}`} target="_blank" rel="noreferrer">שליחה בוואטסאפ</a>
                          <button type="button" className="btn secondary sm" onClick={() => void copyHref(shareHref(m.share!))}>העתקת קישור לוואטסאפ</button>
                          <a className="btn secondary sm" href={`${import.meta.env.BASE_URL}s/${m.share}/card.jpg`} download={`family-care-${m.share}.jpg`}>הורדת הגלויה</a>
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
    </>
  )
}
