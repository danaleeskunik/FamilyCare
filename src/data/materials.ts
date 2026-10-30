/** Ready-made files available from the personal area. Files live in public/materials; add a row here to publish another one. */
export type Material = {
  web?: string // in-app page where the same document can be filled in online
  share?: string // slug of the WhatsApp postcard page under /s/ (defaults to the id; link preview + opens the file)
  noShare?: boolean // internal documents have no postcard
  area?: 'social' // omitted = brochures and documents
  id: string
  group: string
  title: string
  text: string
  kind: 'PDF' | 'PNG' | 'JPG'
  file: string // path under /materials
  thumb: string // path under /materials/thumbs
}

export const MATERIALS: Material[] = [
  {
    id: 'companions-brochure', group: 'גיוס מלווים', kind: 'PDF', file: 'companions-brochure.pdf', share: 'companions', thumb: 'companions-brochure.jpg',
    title: 'ברושור גיוס מלווים (A4)',
    text: 'עמוד אחד להדפסה או לשליחה. הלוגו, הטלפון, המייל ולוגו הוואטסאפ לחיצים.',
  },
  {
    id: 'companions-social-pdf', group: 'גיוס מלווים', kind: 'PDF', file: 'companions-social.pdf', thumb: 'companions-social-pdf.jpg',
    title: 'מודעת גיוס לשליחה בוואטסאפ ובמייל',
    text: 'מודעה בגודל תמונת רשתות, כקובץ PDF שבו הלוגו והוואטסאפ לחיצים.',
  },
  {
    id: 'companions-social-png', group: 'גיוס מלווים', kind: 'PNG', file: 'companions-social.png', thumb: 'companions-social-png.jpg',
    title: 'מודעת גיוס לפרסום ברשתות (תמונה)',
    text: 'אותה מודעה כתמונה 1080×1350, לאינסטגרם, פייסבוק וקבוצות. קישורים מוסיפים בכיתוב.',
  },
  {
    id: 'families-brochure', group: 'למשפחות הלקוחות', kind: 'PDF', file: 'families-brochure.pdf', share: 'families', thumb: 'families-brochure.jpg',
    title: 'ברושור לילדי הלקוחות (2 עמודים)',
    text: 'מי אנחנו, מה אנחנו עושים בשביל ההורים, איך מתחילים, המסלולים ויצירת קשר. הלוגו, הטלפון והוואטסאפ לחיצים.',
  },
  {
    id: 'abroad-brochure', group: 'למשפחות הלקוחות', kind: 'PDF', file: 'abroad-brochure.pdf', share: 'abroad', thumb: 'abroad-brochure.jpg',
    title: 'ברושור לילדים שגרים בחו"ל (2 עמודים)',
    text: 'למי שההורים בארץ והם מחוץ לה: מענה בכל שעה, עדכון שקוף, טיפול מקצה לקצה והמסלולים. הלוגו, הטלפון והוואטסאפ לחיצים.',
  },
  {
    id: 'seniors-brochure', group: 'ללקוחות עצמם', kind: 'PDF', file: 'seniors-brochure.pdf', share: 'seniors', thumb: 'seniors-brochure.jpg',
    title: 'ברושור לבני הגיל השלישי (2 עמודים)',
    text: 'פונה ישירות אל ההורים: אתם מחליטים, מלווה קבועה, טלפון אחד לכל דבר, השירותים והמסלולים. הלוגו, הטלפונים והוואטסאפ לחיצים.',
  },
  {
    id: 'new-client-questionnaire', group: 'שאלונים', kind: 'PDF', file: 'new-client-questionnaire.pdf', web: '/admin/questionnaire?new=1', noShare: true, thumb: 'new-client-questionnaire.jpg',
    title: 'שאלון היכרות עם לקוח חדש',
    text: 'אפשר למלא ברשת, או להדפיס. שאלון אחד, 9 עמודים: הנחיות לנציג, שיחה עם הבן או הבת, שיחה עם ההורה בבית, מיפוי מפורט וסיכום. אותם שדות שנפתחים ב"לקוח/ה חדש/ה" ובלשונית "שאלון היכרות".',
  },
  { id: 'social-story-teaser-1', area: 'social', group: 'סטוריז', kind: 'JPG', file: 'social/story-teaser-1.jpg', thumb: 'social/story-teaser-1.jpg', title: 'סטורי: "טלפון אחד, והכול מסודר"', text: 'פתיחת קמפיין, 1080×1920 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-story-teaser-2', area: 'social', group: 'סטוריז', kind: 'JPG', file: 'social/story-teaser-2.jpg', thumb: 'social/story-teaser-2.jpg', title: 'סטורי: "הילד הנוסף שאין לך זמן להיות"', text: 'פתיחת קמפיין, רקע ירוק · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-story-teaser-3', area: 'social', group: 'סטוריז', kind: 'JPG', file: 'social/story-teaser-3.jpg', thumb: 'social/story-teaser-3.jpg', title: 'סטורי: "מי מנהל את הבית של ההורים שלך?"', text: 'פתיחת קמפיין, רקע כהה · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-story-mom-called', area: 'social', group: 'סטוריז', kind: 'JPG', file: 'social/story-mom-called.jpg', thumb: 'social/story-mom-called.jpg', title: 'סטורי: "אמא התקשרה שוב. המזגן לא עובד."', text: 'סיפור קצר על תקלה בבית · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-story-who-manages', area: 'social', group: 'סטוריז', kind: 'JPG', file: 'social/story-who-manages.jpg', thumb: 'social/story-who-manages.jpg', title: 'סטורי: "מי דואג להורים כשאת בפגישה?"', text: 'עם תמונה · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-story-official', area: 'social', group: 'סטוריז', kind: 'JPG', file: 'social/story-official.jpg', thumb: 'social/story-official.jpg', title: 'סטורי: "היום זה רשמי. נעים להכיר"', text: 'השקה, עם תמונה · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-extra-child', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-extra-child.jpg', thumb: 'social/post-extra-child.jpg', title: 'פוסט: "הילד הנוסף שאין לך זמן להיות"', text: 'פוסט פתיחה, 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-second-job', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-second-job.jpg', thumb: 'social/post-second-job.jpg', title: 'פוסט: "הבית של ההורים הפך לעבודה השנייה שלך?"', text: 'קרוסלה: שקופית פתיחה · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-all-this', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-all-this.jpg', thumb: 'social/post-all-this.jpg', title: 'פוסט: "את כל זה אנחנו לוקחים על עצמנו"', text: 'קרוסלה: ששת התחומים · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-how-start', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-how-start.jpg', thumb: 'social/post-how-start.jpg', title: 'פוסט: "איך מתחילים?"', text: 'קרוסלה: שלושה צעדים · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-daughter', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-daughter.jpg', thumb: 'social/post-daughter.jpg', title: 'פוסט: "חזרי להיות הבת, לא מנהלת הפרויקט"', text: 'עם תמונה · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-far-close', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-far-close.jpg', thumb: 'social/post-far-close.jpg', title: 'פוסט: "את רחוקה. אנחנו קרובים אליהם"', text: 'ריבועי, 1080×1080 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-one-phone', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-one-phone.jpg', thumb: 'social/post-one-phone.jpg', title: 'פוסט: "לא עוד טכנאי"', text: 'ריבועי, 1080×1080 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-independence', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-independence.jpg', thumb: 'social/post-independence.jpg', title: 'פוסט: "עצמאות מלאה, וביטחון שיש על מי לסמוך"', text: 'ריבועי, 1080×1080 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-post-overview', area: 'social', group: 'פוסטים', kind: 'JPG', file: 'social/post-overview.jpg', thumb: 'social/post-overview.jpg', title: 'תמונה ארוכה: סקירה של החברה', text: 'לשיתוף בוואטסאפ ובלינקדאין, 1080×2560 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-dom-1-household', area: 'social', group: 'תחומי שירות', kind: 'JPG', file: 'social/dom-1-household.jpg', thumb: 'social/dom-1-household.jpg', title: 'תחום 1: ניהול משק הבית', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-dom-2-maintenance', area: 'social', group: 'תחומי שירות', kind: 'JPG', file: 'social/dom-2-maintenance.jpg', thumb: 'social/dom-2-maintenance.jpg', title: 'תחום 2: אחזקת הבית', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-dom-3-medical', area: 'social', group: 'תחומי שירות', kind: 'JPG', file: 'social/dom-3-medical.jpg', thumb: 'social/dom-3-medical.jpg', title: 'תחום 3: ליווי רפואי', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-dom-4-legal', area: 'social', group: 'תחומי שירות', kind: 'JPG', file: 'social/dom-4-legal.jpg', thumb: 'social/dom-4-legal.jpg', title: 'תחום 4: בירוקרטיה ומשפטים', text: 'חדש, משלים את הסדרה · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-dom-5-digital', area: 'social', group: 'תחומי שירות', kind: 'JPG', file: 'social/dom-5-digital.jpg', thumb: 'social/dom-5-digital.jpg', title: 'תחום 5: דיגיטל', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-dom-6-culture', area: 'social', group: 'תחומי שירות', kind: 'JPG', file: 'social/dom-6-culture.jpg', thumb: 'social/dom-6-culture.jpg', title: 'תחום 6: תרבות ופנאי', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-family-talk', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-family-talk.jpg', thumb: 'social/tip-family-talk.jpg', title: 'טיפ: שיחה משפחתית על העתיד', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-stay-close', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-stay-close.jpg', thumb: 'social/tip-stay-close.jpg', title: 'טיפ: איך נשארים קרובים גם כשגרים רחוק', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-abroad', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-abroad.jpg', thumb: 'social/tip-abroad.jpg', title: 'טיפ: טסים לחו"ל עם ההורים', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-winter', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-winter.jpg', thumb: 'social/tip-winter.jpg', title: 'טיפ: לפני החורף, בודקים את הבית', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-bank-scam', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-bank-scam.jpg', thumb: 'social/tip-bank-scam.jpg', title: 'טיפ: שיחה מ"הבנק" שמבקשת קוד', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-meds', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-meds.jpg', thumb: 'social/tip-meds.jpg', title: 'טיפ: סדר בתרופות', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-loneliness', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-loneliness.jpg', thumb: 'social/tip-loneliness.jpg', title: 'טיפ: בדידות היא לא "עוד חלק מהגיל"', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-smartphone', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-smartphone.jpg', thumb: 'social/tip-smartphone.jpg', title: 'טיפ: הסמארטפון לידידותי', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-poa', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-poa.jpg', thumb: 'social/tip-poa.jpg', title: 'טיפ: ייפוי כוח מתמשך', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-doctor', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-doctor.jpg', thumb: 'social/tip-doctor.jpg', title: 'טיפ: איך מתכוננים לביקור אצל הרופא', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-safety', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-safety.jpg', thumb: 'social/tip-safety.jpg', title: 'טיפ: שלושה שינויים לבית בטוח יותר', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
  { id: 'social-tip-warning-signs', area: 'social', group: 'טיפים שבועיים', kind: 'JPG', file: 'social/tip-warning-signs.jpg', thumb: 'social/tip-warning-signs.jpg', title: 'טיפ: חמישה סימני אזהרה', text: 'פוסט 1080×1350 · עם הטלפון של רועי וכתובת האתר.' },
]
