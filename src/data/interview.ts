/** Interview form for companion candidates. Answers live in staff_interviews.answers (JSON, string values). */
export type IvKind = 'text' | 'long' | 'checks' | 'choice' | 'rate' | 'date'
export type IvField = { key: string; label: string; kind: IvKind; options?: string[]; ltr?: boolean }
export type IvSection = { id: string; title: string; fields: IvField[] }

export const INTERVIEW_GUIDE = [
  'לשאול את אותן שאלות את כל המועמדים/ות, כדי שאפשר יהיה להשוות ביניהם.',
  'לא שואלים על גיל, מצב משפחתי, הריון, בריאות או דת. שואלים על ניסיון, זמינות והתאמה לתפקיד.',
  'בשאלות המצבים מבקשים דוגמה אמיתית מהעבר, ולא "מה היית עושה" באופן כללי.',
  'רושמים בקצרה את מה שנאמר, ומעריכים בסוף מיד אחרי הראיון.',
]

const t = (key: string, label: string, extra: Partial<IvField> = {}): IvField => ({ key, label, kind: 'text', ...extra })
const l = (key: string, label: string): IvField => ({ key, label, kind: 'long' })
const c = (key: string, label: string, options: string[]): IvField => ({ key, label, kind: 'checks', options })
const r = (key: string, label: string): IvField => ({ key, label, kind: 'rate' })

export const DECISIONS = ['מתאים/ה — להמשיך', 'מתאים/ה בהסתייגות', 'ראיון נוסף / שיחה עם ממליצים', 'לא מתאים/ה']

export const INTERVIEW: IvSection[] = [
  { id: 'general', title: 'פרטים כלליים', fields: [
    t('name', 'שם מלא'), { key: 'date', label: 'תאריך הראיון', kind: 'date' },
    t('phone', 'טלפון', { ltr: true }), t('email', 'דוא"ל', { ltr: true }),
    { key: 'gender', label: 'מגדר', kind: 'choice', options: ['אישה', 'גבר'] },
    t('city', 'עיר מגורים'), t('interviewer', 'שם המראיין/ת'),
    t('source', 'איך הגיע/ה אלינו (המלצה, מודעה, רשתות...)'),
    l('hobbies', 'תחביבים'),
    l('service', 'האם את/ה אדם שירותי?'),
    l('general_notes', 'הערות כלליות (מלל חופשי)'),
  ] },
  { id: 'background', title: 'רקע מקצועי', fields: [
    c('profession', 'הכשרה / מקצוע / לימודים', ['עובד/ת סוציאלי/ת', 'פסיכולוגיה', 'ריפוי בעיסוק', 'סיעוד / אחות', 'פיזיותרפיה', 'סיוע סיעודי / מטפל/ת', 'סטודנט/ית', 'אחר']),
    t('training', 'פרטי ההכשרה (מוסד, שנת סיום)'),
    l('experience', 'ניסיון בעבודה עם בני 65+: איפה, כמה זמן, באיזה תפקיד?'),
    l('last_job', 'עבודה אחרונה, ומה הסיבה לעזיבה או לחיפוש תפקיד חדש?'),
    t('military', 'שירות צבאי'),
    l('military_notes', 'פירוט שירות צבאי (תפקיד, יחידה, משך, ומה לקחת ממנו)'),
    l('skill_talk', 'האם את/ה יכול/ה לנהל שיחה על חדשות / פוליטיקה / תרבות?'),
    l('skill_drive', 'האם את/ה יכול/ה להסיע ברכב לקוח לבית קפה / הצגה / קניות?'),
    l('skill_fridge', 'האם את/ה יודע/ת לסדר מקרר?'),
    l('skill_booking', 'האם את/ה יודע/ת להזמין תור בקופת חולים? בעירייה?'),
    c('special', 'ניסיון ספציפי', ['דמנציה / אלצהיימר', 'ליווי לבדיקות ולרופאים', 'אחרי ניתוח / שיקום', 'עבודה מול משפחות', 'עבודה עצמאית (חשבונית)']),
  ] },
  { id: 'terms', title: 'זמינות ותנאים', fields: [
    l('hours', 'ימים ושעות שבהם זמין/ה (קבוע או גמיש)'),
    t('areas', 'אזורים נוחים (רמת השרון, הרצליה, תל אביב, רעננה...)'),
    t('start', 'תאריך התחלה אפשרי'),
    c('car', 'רכב ורישיון נהיגה', ['יש רכב', 'יש רישיון, בלי רכב', 'אין']),
    c('employment', 'מעמד העסקה מועדף', ['עצמאי/ת (חשבונית)', 'שכיר/ה', 'פתוח/ה לשניהם']),
    t('scope', 'היקף משוער (שעות בשבוע) וציפיות שכר'),
    l('constraints', 'אילוצים או התחייבויות שחשוב שנדע עליהם'),
  ] },
  { id: 'situations', title: 'שאלות מצבים (לבקש דוגמה מהעבר)', fields: [
    l('q_why', 'למה ליווי של קשישים? מה מושך אותך בתפקיד, ומה קשה לך בו?'),
    l('q_resist', 'מתי טיפלת במישהו שהתנגד, כעס או סירב לשתף פעולה? מה עשית?'),
    l('q_fall', 'הלקוח/ה נופל/ת או מרגיש/ה רע באמצע הפגישה. מה עושים, ובאיזה סדר?'),
    l('q_boundary', 'לקוח/ה מבקש/ת שתיקח כסף או תשלם במקומו, תתן תרופה או תעשה משהו מחוץ לתפקיד. איך מגיבים?'),
    l('q_family', 'בן/בת משפחה מתערב/ת, מבקר/ת או לא מרוצה מהליווי. איך מתמודדים?'),
    l('q_lonely', 'לקוח/ה מתבודד/ת, לא רוצה לצאת מהבית ולא רוצה פעילות. איך יוצרים קשר?'),
    l('q_privacy', 'מה המשמעות של דיסקרטיות בתפקיד הזה? תנו דוגמה.'),
    l('q_app', 'אחרי כל פגישה צריך לתעד אותה באפליקציה (הערות, שעות, הוצאות). עד כמה נוח לך עם זה? באיזה מכשיר?'),
  ] },
  { id: 'comm', title: 'שפות ותקשורת', fields: [
    c('langs', 'שפות', ['עברית', 'אנגלית', 'רוסית', 'ספרדית', 'צרפתית', 'אחר']),
    t('langs_other', 'שפה אחרת (לפרט)'),
    c('tech', 'סמארטפון ואפליקציות', ['נוח/ה עם סמארטפון', 'WhatsApp', 'ניווט (Waze / מפות)', 'זקוק/ה להדרכה']),
  ] },
  { id: 'refs', title: 'ממליצים ומסמכים', fields: [
    t('ref1', 'ממליץ/ה 1 (שם, תפקיד, טלפון)'), t('ref2', 'ממליץ/ה 2 (שם, תפקיד, טלפון)'),
    c('docs', 'מסמכים שנדרשים להמשך', ['קורות חיים', 'תעודות והכשרות', 'אישור יושר / תעודת יושר', 'תעודת זהות ורישיון נהיגה', 'טופס 101 (שכיר/ה)', 'אישורי עצמאי/ת (עוסק)']),
  ] },
  { id: 'eval', title: 'הערכת המראיין/ת (למלא אחרי הראיון)', fields: [
    r('r_warmth', 'חום ואמפתיה'), r('r_pro', 'ניסיון ומקצועיות'), r('r_trust', 'אמינות ואחריות'),
    r('r_comm', 'תקשורת ויכולת הקשבה'), r('r_flex', 'גמישות וזמינות'), r('r_fit', 'התאמה לערכי Family Care'),
    l('strengths', 'נקודות חוזק'), l('concerns', 'חששות / נקודות לבירור'),
    { key: 'decision', label: 'המלצה', kind: 'choice', options: DECISIONS },
    l('next', 'הצעד הבא ומי אחראי עליו'),
  ] },
]

export const IV_TOTAL = INTERVIEW.reduce((n, s) => n + s.fields.length, 0)
export type IvAnswers = Record<string, string>
