import { useEffect, useRef, type ReactNode } from 'react'

export default function Modal({ title, onClose, wide, children, footer }: {
  title: string; onClose: () => void; wide?: boolean; children: ReactNode; footer?: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    // No close() in cleanup: it would fire a 'close' event (StrictMode remount) and dismiss the form immediately.
    if (d && !d.open) d.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'wide' : ''}`}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button type="button" className="icon-btn" aria-label="סגירה" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </dialog>
  )
}
