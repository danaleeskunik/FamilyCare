export type Tone = 'neutral' | 'green' | 'blue' | 'orange' | 'red'

export type Task = {
  id: string
  date: string // ISO yyyy-mm-dd
  time: string
  client: string
  task: string
  who: string | null
  status: [Tone, string] | null
  region: string
}

/** The design is set on Tuesday 15.9.2026; the prototype treats that as "today". */
export const TODAY = '2026-09-15'

export const seedTasks: Task[] = [
  { id: 't1', date: TODAY, time: '09:30', client: 'שרה לוי', task: 'ליווי לרופא + מרשמים', who: 'נועה ש.', status: ['green', 'בביצוע'], region: 'רמת השרון' },
  { id: 't2', date: TODAY, time: '11:00', client: 'יעקב ברנע', task: 'קניות מזון וסידור מקרר', who: 'דניאל כ.', status: ['neutral', 'מתוכנן'], region: 'הרצליה' },
  { id: 't3', date: TODAY, time: '13:00', client: 'חנה פלד', task: 'תיקון מזגן — ליווי טכנאי', who: 'קור־טק · עדי ר.', status: ['blue', 'אושר ללקוח'], region: 'הרצליה' },
  { id: 't4', date: TODAY, time: '16:00', client: 'מרים אדלר', task: 'הדרכת WhatsApp', who: null, status: null, region: 'צפון ת"א' },
  { id: 't5', date: TODAY, time: '17:30', client: 'שרה לוי', task: 'בית קפה + מונית VIP', who: 'נועה ש. · מוניות אלון', status: ['neutral', 'מתוכנן'], region: 'רמת השרון' },
  { id: 't6', date: '2026-09-17', time: '10:00', client: 'אריה גולן', task: 'ביקור היכרות', who: 'נועה ש.', status: ['neutral', 'מתוכנן'], region: 'רמת השרון' },
  { id: 't7', date: '2026-09-17', time: '11:00', client: 'שרה לוי', task: 'קניות במעדנייה וסידור הבית', who: 'נועה ש.', status: ['neutral', 'מתוכנן'], region: 'רמת השרון' },
  { id: 't8', date: '2026-09-18', time: '10:00', client: 'שרה לוי', task: 'חלה, עיתון ופרחים — הטבת המסלול', who: 'נועה ש.', status: ['neutral', 'מתוכנן'], region: 'רמת השרון' },
  { id: 't9', date: '2026-09-22', time: '19:30', client: 'חנה פלד', task: 'קונצרט בהיכל התרבות', who: 'עדי ר.', status: ['neutral', 'מתוכנן'], region: 'הרצליה' },
]
export const regions = ['רמת השרון', 'הרצליה', 'צפון ת"א']

export type Vendor = { id: string; name: string; field: string; area: string; price: string; lic: string; licBad: boolean; rating: string; status: [Tone, string] }
export const seedVendors: Vendor[] = [
  { id: 'v1', name: 'אבי מזרחי', field: 'אינסטלציה', area: 'רמת השרון · הרצליה', price: 'ביקור ‎350 ₪ · שעה ‎280 ₪', lic: 'בתוקף עד 04.27', licBad: false, rating: '4.9', status: ['green', 'פעיל'] },
  { id: 'v2', name: 'קור־טק מיזוג', field: 'מיזוג אוויר', area: 'גוש דן', price: 'ביקור ‎300 ₪ · שעה ‎250 ₪', lic: 'בתוקף עד 11.26', licBad: false, rating: '4.5', status: ['green', 'פעיל'] },
  { id: 'v3', name: 'יוסי בר־און', field: 'טכנאי גז', area: 'השרון', price: 'ביקור ‎390 ₪', lic: 'פג 31.8', licBad: true, rating: '4.2', status: ['red', 'מוקפא'] },
  { id: 'v4', name: 'מוניות אלון · VIP', field: 'הסעות', area: 'ארצי', price: 'רמה"ש ‎40 ₪ · ת"א בעומס ‎120 ₪ · המתנה ‎111 ₪', lic: 'בתוקף עד 02.27', licBad: false, rating: '4.8', status: ['green', 'פעיל'] },
  { id: 'v5', name: 'ד"ר נעם הרשקו', field: 'רופא עד הבית', area: 'הרצליה · רמת השרון', price: 'ביקור ‎700 ₪', lic: 'בתוקף עד 09.27', licBad: false, rating: '5.0', status: ['green', 'פעיל'] },
  { id: 'v6', name: 'א. שחר מנעולנות', field: 'מנעולן · חירום', area: 'גוש דן', price: 'קריאת חירום ‎450 ₪', lic: 'ביטוח צד ג׳ פג', licBad: true, rating: '4.0', status: ['red', 'מוקפא'] },
]

export type Client = { id: string; name: string; age: number; area: string; plan: [Tone, string]; used: string; companion: string | null; orderer: string; next: string }
export const seedClients: Client[] = [
  { id: 'sara-levi', name: 'שרה לוי', age: 84, area: 'רמת השרון', plan: ['green', 'פלטינום'], used: '5 / 8', companion: 'נועה ש.', orderer: 'רונית לוי־שדה', next: 'היום 17:30' },
  { id: 'yaakov-baranes', name: 'יעקב ברנע', age: 79, area: 'הרצליה', plan: ['neutral', 'בסיסי'], used: '3 / 4', companion: 'דניאל כ.', orderer: 'אילנה ברנע', next: 'היום 11:00' },
  { id: 'hana-peled', name: 'חנה פלד', age: 88, area: 'הרצליה', plan: ['blue', 'טופ פלטינום'], used: '9 / 12', companion: 'עדי ר. · עו"ס', orderer: 'דורון פלד', next: 'היום 13:00' },
  { id: 'miriam-adler', name: 'מרים אדלר', age: 76, area: 'צפון תל אביב', plan: ['green', 'פלטינום'], used: '6 / 8', companion: null, orderer: 'גלית אדלר', next: 'היום 16:00' },
  { id: 'arie-golan', name: 'אריה גולן', age: 81, area: 'רמת השרון', plan: ['orange', 'תקופת היכרות'], used: '1 / 4', companion: 'נועה ש.', orderer: 'תמר גולן', next: 'חמישי 10:00' },
]

export type Staff = { id: string; name: string; role: string; areas: string; langs: string; regulars: string; hours: string; avail: [Tone, string] }
export const seedStaff: Staff[] = [
  { id: 's1', name: 'נועה שרעבי', role: 'מלווה אישית', areas: 'רמת השרון · הרצליה', langs: 'עברית, רוסית', regulars: 'שרה לוי · אריה גולן', hours: '62:40', avail: ['green', 'בביקור'] },
  { id: 's2', name: 'עדי רוזן', role: 'עובדת סוציאלית', areas: 'הרצליה · רעננה', langs: 'עברית, אנגלית', regulars: 'חנה פלד', hours: '71:15', avail: ['neutral', 'פנויה מ-15:00'] },
  { id: 's3', name: 'דניאל כהן', role: 'סטודנט', areas: 'הרצליה · צפון ת"א', langs: 'עברית', regulars: 'יעקב ברנע', hours: '44:00', avail: ['green', 'זמין'] },
  { id: 's4', name: 'תמר בן־דוד', role: 'סטודנטית', areas: 'צפון ת"א', langs: 'עברית, ערבית', regulars: '—', hours: '28:30', avail: ['green', 'זמינה מ-16:00'] },
]

export const invoices: { orderer: string; fee: number; hours: number; vendors: number; total: number; status: [Tone, string] }[] = [
  { orderer: 'רונית לוי־שדה', fee: 3500, hours: 800, vendors: 1518, total: 5818, status: ['green', 'שולם'] },
  { orderer: 'דורון פלד', fee: 10000, hours: 550, vendors: 990, total: 11540, status: ['green', 'שולם'] },
  { orderer: 'אילנה ברנע', fee: 1600, hours: 1050, vendors: 264, total: 2914, status: ['orange', 'ממתין לסליקה'] },
  { orderer: 'גלית אדלר', fee: 3500, hours: 300, vendors: 0, total: 3800, status: ['red', 'כרטיס נדחה'] },
]

export const visitHistory = [
  { date: '15.9', who: 'נועה ש.', what: 'קניות במעדנייה, סידור מקרר, הליכה', dur: '2:05', cost: 550, link: 'סיכום ביקור' },
  { date: '12.9', who: 'אבי מ. · אינסטלטור', what: 'תיקון נזילה במטבח', dur: '1:20', cost: 1210, link: 'חשבונית' },
  { date: '11.9', who: 'דניאל כ.', what: 'ליווי לרופא + איסוף מרשמים', dur: '3:10', cost: 850, link: 'סיכום ביקור' },
  { date: '8.9', who: 'נועה ש.', what: 'בית קפה, סידור דואר וארנונה', dur: '2:00', cost: 550, link: 'סיכום ביקור' },
  { date: '4.9', who: 'מוניות אלון · VIP', what: 'הסעה לתיאטרון הבימה וחזרה', dur: '—', cost: 264, link: 'חשבונית' },
]

export const PLANS: { name: string; tone: Tone; sessions: number; price: number }[] = [
  { name: 'בסיסי', tone: 'neutral', sessions: 4, price: 1600 },
  { name: 'פלטינום', tone: 'green', sessions: 8, price: 3500 },
  { name: 'טופ פלטינום', tone: 'blue', sessions: 12, price: 10000 },
  { name: 'תקופת היכרות', tone: 'orange', sessions: 4, price: 0 },
]
export const STAFF_ROLES = ['מלווה אישית', 'עובדת סוציאלית', 'סטודנט', 'סטודנטית']
