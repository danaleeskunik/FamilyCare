export type Tone = 'neutral' | 'green' | 'blue' | 'orange' | 'red'

export const boardTasks = [
  { time: '09:30', client: 'שרה לוי', task: 'ליווי לרופא + מרשמים', who: 'נועה ש.', status: ['green', 'בביצוע'] as [Tone, string], region: 'רמת השרון' },
  { time: '11:00', client: 'יעקב ברנע', task: 'קניות מזון וסידור מקרר', who: 'דניאל כ.', status: ['neutral', 'מתוכנן'] as [Tone, string], region: 'הרצליה' },
  { time: '13:00', client: 'חנה פלד', task: 'תיקון מזגן — ליווי טכנאי', who: 'קור־טק · עדי ר.', status: ['blue', 'אושר ללקוח'] as [Tone, string], region: 'הרצליה' },
  { time: '16:00', client: 'מרים אדלר', task: 'הדרכת WhatsApp', who: null, status: null, region: 'צפון ת"א' },
  { time: '17:30', client: 'שרה לוי', task: 'בית קפה + מונית VIP', who: 'נועה ש. · מוניות אלון', status: ['neutral', 'מתוכנן'] as [Tone, string], region: 'רמת השרון' },
]
export const regions = ['רמת השרון', 'הרצליה', 'צפון ת"א']

export const vendors = [
  { name: 'אבי מזרחי', field: 'אינסטלציה', area: 'רמת השרון · הרצליה', price: 'ביקור ‎350 ₪ · שעה ‎280 ₪', lic: 'בתוקף עד 04.27', licBad: false, rating: '4.9', status: ['green', 'פעיל'] as [Tone, string] },
  { name: 'קור־טק מיזוג', field: 'מיזוג אוויר', area: 'גוש דן', price: 'ביקור ‎300 ₪ · שעה ‎250 ₪', lic: 'בתוקף עד 11.26', licBad: false, rating: '4.5', status: ['green', 'פעיל'] as [Tone, string] },
  { name: 'יוסי בר־און', field: 'טכנאי גז', area: 'השרון', price: 'ביקור ‎390 ₪', lic: 'פג 31.8', licBad: true, rating: '4.2', status: ['red', 'מוקפא'] as [Tone, string] },
  { name: 'מוניות אלון · VIP', field: 'הסעות', area: 'ארצי', price: 'רמה"ש ‎40 ₪ · ת"א בעומס ‎120 ₪ · המתנה ‎111 ₪', lic: 'בתוקף עד 02.27', licBad: false, rating: '4.8', status: ['green', 'פעיל'] as [Tone, string] },
  { name: 'ד"ר נעם הרשקו', field: 'רופא עד הבית', area: 'הרצליה · רמת השרון', price: 'ביקור ‎700 ₪', lic: 'בתוקף עד 09.27', licBad: false, rating: '5.0', status: ['green', 'פעיל'] as [Tone, string] },
  { name: 'א. שחר מנעולנות', field: 'מנעולן · חירום', area: 'גוש דן', price: 'קריאת חירום ‎450 ₪', lic: 'ביטוח צד ג׳ פג', licBad: true, rating: '4.0', status: ['red', 'מוקפא'] as [Tone, string] },
]

export const clients = [
  { id: 'sara-levi', name: 'שרה לוי', age: 84, area: 'רמת השרון', plan: ['green', 'פלטינום'] as [Tone, string], used: '5 / 8', companion: 'נועה ש.', orderer: 'רונית לוי־שדה', next: 'היום 17:30' },
  { id: 'yaakov-baranes', name: 'יעקב ברנע', age: 79, area: 'הרצליה', plan: ['neutral', 'בסיסי'] as [Tone, string], used: '3 / 4', companion: 'דניאל כ.', orderer: 'אילנה ברנע', next: 'היום 11:00' },
  { id: 'hana-peled', name: 'חנה פלד', age: 88, area: 'הרצליה', plan: ['blue', 'טופ פלטינום'] as [Tone, string], used: '9 / 12', companion: 'עדי ר. · עו"ס', orderer: 'דורון פלד', next: 'היום 13:00' },
  { id: 'miriam-adler', name: 'מרים אדלר', age: 76, area: 'צפון תל אביב', plan: ['green', 'פלטינום'] as [Tone, string], used: '6 / 8', companion: null, orderer: 'גלית אדלר', next: 'היום 16:00' },
  { id: 'arie-golan', name: 'אריה גולן', age: 81, area: 'רמת השרון', plan: ['orange', 'תקופת היכרות'] as [Tone, string], used: '1 / 4', companion: 'נועה ש.', orderer: 'תמר גולן', next: 'חמישי 10:00' },
]

export const staff = [
  { name: 'נועה שרעבי', role: 'מלווה אישית', areas: 'רמת השרון · הרצליה', langs: 'עברית, רוסית', regulars: 'שרה לוי · אריה גולן', hours: '62:40', avail: ['green', 'בביקור'] as [Tone, string] },
  { name: 'עדי רוזן', role: 'עובדת סוציאלית', areas: 'הרצליה · רעננה', langs: 'עברית, אנגלית', regulars: 'חנה פלד', hours: '71:15', avail: ['neutral', 'פנויה מ-15:00'] as [Tone, string] },
  { name: 'דניאל כהן', role: 'סטודנט', areas: 'הרצליה · צפון ת"א', langs: 'עברית', regulars: 'יעקב ברנע', hours: '44:00', avail: ['green', 'זמין'] as [Tone, string] },
  { name: 'תמר בן־דוד', role: 'סטודנטית', areas: 'צפון ת"א', langs: 'עברית, ערבית', regulars: '—', hours: '28:30', avail: ['green', 'זמינה מ-16:00'] as [Tone, string] },
]

export const invoices = [
  { orderer: 'רונית לוי־שדה', fee: 3500, hours: 800, vendors: 1518, total: 5818, status: ['green', 'שולם'] as [Tone, string] },
  { orderer: 'דורון פלד', fee: 10000, hours: 550, vendors: 990, total: 11540, status: ['green', 'שולם'] as [Tone, string] },
  { orderer: 'אילנה ברנע', fee: 1600, hours: 1050, vendors: 264, total: 2914, status: ['orange', 'ממתין לסליקה'] as [Tone, string] },
  { orderer: 'גלית אדלר', fee: 3500, hours: 300, vendors: 0, total: 3800, status: ['red', 'כרטיס נדחה'] as [Tone, string] },
]

export const visitHistory = [
  { date: '15.9', who: 'נועה ש.', what: 'קניות במעדנייה, סידור מקרר, הליכה', dur: '2:05', cost: 550, link: 'סיכום ביקור' },
  { date: '12.9', who: 'אבי מ. · אינסטלטור', what: 'תיקון נזילה במטבח', dur: '1:20', cost: 1210, link: 'חשבונית' },
  { date: '11.9', who: 'דניאל כ.', what: 'ליווי לרופא + איסוף מרשמים', dur: '3:10', cost: 850, link: 'סיכום ביקור' },
  { date: '8.9', who: 'נועה ש.', what: 'בית קפה, סידור דואר וארנונה', dur: '2:00', cost: 550, link: 'סיכום ביקור' },
  { date: '4.9', who: 'מוניות אלון · VIP', what: 'הסעה לתיאטרון הבימה וחזרה', dur: '—', cost: 264, link: 'חשבונית' },
]
