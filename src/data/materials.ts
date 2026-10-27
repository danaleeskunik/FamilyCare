/** Ready-made files available from the personal area. Files live in public/materials; add a row here to publish another one. */
export type Material = {
  id: string
  group: string
  title: string
  text: string
  kind: 'PDF' | 'PNG' | 'DOCX'
  file: string // path under /materials
  thumb: string // path under /materials/thumbs
}

export const MATERIALS: Material[] = [
  {
    id: 'companions-brochure', group: 'גיוס מלווים', kind: 'PDF', file: 'companions-brochure.pdf', thumb: 'companions-brochure.jpg',
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
    id: 'families-brochure', group: 'למשפחות הלקוחות', kind: 'PDF', file: 'families-brochure.pdf', thumb: 'families-brochure.jpg',
    title: 'ברושור לילדי הלקוחות (2 עמודים)',
    text: 'מי אנחנו, מה אנחנו עושים בשביל ההורים, איך מתחילים, המסלולים ויצירת קשר. הלוגו, הטלפון והוואטסאפ לחיצים.',
  },
  {
    id: 'abroad-brochure', group: 'למשפחות הלקוחות', kind: 'PDF', file: 'abroad-brochure.pdf', thumb: 'abroad-brochure.jpg',
    title: 'ברושור לילדים שגרים בחו"ל (2 עמודים)',
    text: 'למי שההורים בארץ והם מחוץ לה: מענה בכל שעה, עדכון שקוף, טיפול מקצה לקצה והמסלולים. הלוגו, הטלפון והוואטסאפ לחיצים.',
  },
  {
    id: 'seniors-brochure', group: 'ללקוחות עצמם', kind: 'PDF', file: 'seniors-brochure.pdf', thumb: 'seniors-brochure.jpg',
    title: 'ברושור לבני הגיל השלישי (2 עמודים)',
    text: 'פונה ישירות אל ההורים: אתם מחליטים, מלווה קבועה, טלפון אחד לכל דבר, השירותים והמסלולים. הלוגו, הטלפונים והוואטסאפ לחיצים.',
  },
  {
    id: 'new-client-questionnaire', group: 'שאלונים', kind: 'PDF', file: 'new-client-questionnaire.pdf', thumb: 'new-client-questionnaire.jpg',
    title: 'שאלון קליטה והיכרות ללקוח חדש (להדפסה)',
    text: 'טופס ריק, 3 עמודים, למילוי בפגישת ההיכרות. אותם שדות שבלשונית "שאלון היכרות" בתיק הלקוח.',
  },
  {
    id: 'client-interview-guide', group: 'שאלונים', kind: 'DOCX', file: 'client-interview-guide.docx', thumb: 'client-interview-guide.jpg',
    title: 'מדריך לשיחת היכרות עם לקוח (Word)',
    text: 'שאלון הנציג: שיחה עם הבן או הבת, שיחה עם ההורה בבית, סיכום לנציג ומתי עוצרים ומדברים עם אלון.',
  },
]
