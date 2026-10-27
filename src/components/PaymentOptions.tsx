import { useState } from 'react'
import { BANK, WALLET } from '../data/payment'
import { Button, Ltr, money } from './ui'

/** Plain-text transfer details, for copying or sending over WhatsApp. */
export function paymentText(amount: number | null, reason: string) {
  return [
    `פרטי תשלום: ${reason}`,
    amount ? `סכום: ${amount.toLocaleString('en-US')} ₪` : '',
    '',
    'העברה בנקאית:',
    `${BANK.bank}, סניף ${BANK.branch}, חשבון ${BANK.account}`,
    `על שם ${BANK.holder} (ח.פ ${BANK.companyId})`,
    '',
    `Bit / PayBox: ${WALLET.name} ${WALLET.display}`,
  ].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i !== 0)).join('\n')
}

function Copy({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* clipboard blocked: the value is visible and can be selected */ }
  }
  return <button type="button" className="pay-copy" onClick={() => void copy()} aria-label={`העתקת ${label}`}>{done ? 'הועתק' : 'העתקה'}</button>
}

const Row = ({ label, value, copy }: { label: string; value: string; copy?: boolean }) => (
  <div className="pay-row"><span>{label}</span><Ltr>{value}</Ltr>{copy && <Copy value={value} label={label} />}</div>
)

/** Bank transfer and Bit / PayBox details, with copy buttons. `amount` is optional. */
export default function PaymentOptions({ amount, reason }: { amount?: number | null; reason: string }) {
  return (
    <div className="pay">
      {!!amount && <div className="pay-amount"><span>לתשלום</span><strong>{money(amount)}</strong></div>}
      <section className="pay-card">
        <h4>העברה בנקאית</h4>
        <div className="pay-row"><span>שם הבנק</span><span>{BANK.bank}</span></div>
        <Row label="סניף" value={BANK.branch} copy />
        <Row label="מספר חשבון" value={BANK.account} copy />
        <div className="pay-row"><span>על שם</span><span>{BANK.holder}</span></div>
        <Row label="ח.פ" value={BANK.companyId} copy />
      </section>
      <section className="pay-card">
        <h4>Bit או PayBox</h4>
        <div className="pay-row"><span>שולחים ל{WALLET.name}</span><a href={`tel:${WALLET.phone}`} className="num ltr">{WALLET.display}</a><Copy value={WALLET.phone} label="מספר הטלפון" /></div>
        <p className="pay-note">באפליקציית Bit או PayBox בוחרים "העברה לאיש קשר" ומזינים את המספר.</p>
      </section>
      <div className="pay-actions">
        <Button variant="secondary" size="sm" onClick={() => { void navigator.clipboard?.writeText(paymentText(amount ?? null, reason)) }}>העתקת כל הפרטים</Button>
        <a className="btn secondary sm" href={`https://wa.me/?text=${encodeURIComponent(paymentText(amount ?? null, reason))}`} target="_blank" rel="noreferrer">שליחה בוואטסאפ</a>
      </div>
    </div>
  )
}
