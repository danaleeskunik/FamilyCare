/** Categories for invoices collected for tax refunds. The first one is where a freshly scanned invoice lands until it is sorted. */
export const RECEIPT_UNSORTED = 'לא מסווג'
export const RECEIPT_CATEGORIES = [
  RECEIPT_UNSORTED, 'מזון', 'דלק ונסיעות', 'משרד וציוד', 'תקשורת ואינטרנט', 'תוכנה ומנויים',
  'שיווק ופרסום', 'כיבוד ואירוח', 'שירותים מקצועיים', 'תיקונים ותחזוקה', 'אחר',
]
/** Israeli VAT rate, used by the "calculate VAT" helper (the field stays editable). */
export const VAT_RATE = 0.18
