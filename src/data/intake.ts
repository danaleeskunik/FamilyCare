/** The intake questionnaire ("שאלון קליטה, היכרות ומיפוי צרכים"). Answers live in client_intake; sensitive ones in client_intake_private. */
export type IntakeKind = 'text' | 'long' | 'payment'
export type IntakeField = { key: string; label: string; kind: IntakeKind; private?: boolean; ltr?: boolean }
export type IntakeSection = { id: string; title: string; fields: IntakeField[] }

export const PAYMENT_METHODS = [
  { value: 'bank', label: 'הוראה בנקאית / העברה' },
  { value: 'card', label: 'כרטיס אשראי' },
  { value: 'bit', label: 'Bit / PayBox' },
]

export const INTAKE: IntakeSection[] = [
  {
    id: 'life', title: '1. העולם הרך: זהות, סיפור חיים וקשר חברתי',
    fields: [
      { key: 'nickname', label: 'שם חיבה מועדף (איך כולם קוראים לו/לה?)', kind: 'text' },
      { key: 'past_occupation', label: 'במה עסק/ה בעבר? מה היה מרכז העשייה והעניין שלו/שלה?', kind: 'long' },
      { key: 'personality', label: 'קווים בולטים באופי (חברתי, סגור, עצמאי מאוד, דאגן, חוש הומור מיוחד)', kind: 'long' },
      { key: 'friends', label: 'מי החברים הקרובים שלו/שלה היום? באיזו תדירות מדברים או נפגשים?', kind: 'long' },
      { key: 'hobbies', label: 'מה עושה בשעות הפנאי? (קריאת עיתון, טלוויזיה, תשבצים, גינון, בישול, מנוחה)', kind: 'long' },
      { key: 'small_pleasures', label: 'הפינוקים וההנאות הקטנות (בית קפה קבוע, מאפה אהוב, נסיעה לים, קניון רמת אביב)', kind: 'long' },
      { key: 'loneliness', label: 'האם יש תחושת בדידות או קושי רגשי בתקופה האחרונה? האם חווה אובדן או משבר לאחרונה?', kind: 'long' },
      { key: 'kids_dynamics', label: 'הדינמיקה מול הילדים (חושש להעיק? מסתיר מידע רפואי או קשיים מתוך רצון לשמור על אגו ועצמאות?)', kind: 'long' },
    ],
  },
  {
    id: 'daily', title: '2. מיפוי אתגרים, קשיים וצרכים ביום-יום',
    fields: [
      { key: 'home_difficulties', label: 'במה ההורה הכי מתקשה בבית כיום? (להתכופף, לפתוח קופסאות, להחליף מנורות או מצעים, להרים דברים)', kind: 'long' },
      { key: 'food', label: 'איך מנוהל המקרר והמזון? (מי עושה קניות? יש אוכל טרי? העדפה למעדניות כמו דליקטסן או קצביות אהרוני?)', kind: 'long' },
      { key: 'maintenance', label: 'תקלות ואחזקה (איך מגיב כשיש תקלה כמו מזגן או נזילה? חושש להכניס טכנאים זרים? נוטה להזניח?)', kind: 'long' },
      { key: 'mobility', label: 'ניידות ויציאה מהבית (איך ההליכה ושיווי המשקל? יש פחד מנפילות? עדיין נוהג/ת? מרגיש/ה תקוע/ה בבית?)', kind: 'long' },
      { key: 'medical_envelope', label: 'המעטפת הרפואית (מי עוקב אחר תרופות ומרשמים? האם יש צורך בליווי פיזי לבדיקות ותורים לתחושת ביטחון?)', kind: 'long' },
      { key: 'tech', label: 'טכנולוגיה ודיגיטל (באילו מכשירים משתמש/ת? מה קורה כשהשלט משתבש או האינטרנט מתנתק? חווה תסכול?)', kind: 'long' },
    ],
  },
  {
    id: 'contacts', title: '3. פרטים טכניים, אנשי קשר וניהול סיכונים',
    fields: [
      { key: 'national_id', label: 'תעודת זהות של ההורה', kind: 'text', private: true, ltr: true },
      { key: 'home_phone', label: 'טלפון בבית', kind: 'text', ltr: true },
      { key: 'emergency_contact', label: 'איש קשר בחירום (נוסף): שם, מידת הקרבה וטלפון', kind: 'text' },
      { key: 'home_help', label: 'עזרה קיימת בבית (מנקה, מטפל סיעודי)', kind: 'text' },
      { key: 'home_hours', label: 'ימים ושעות נוכחות שלהם בבית', kind: 'text' },
    ],
  },
  {
    id: 'access', title: '4. נגישות, אבטחה ופרטי כניסה לנכס',
    fields: [
      { key: 'address_details', label: 'כתובת מלאה (רחוב, מספר, דירה, קומה, יש מעלית?)', kind: 'text' },
      { key: 'door_code', label: 'קוד כניסה לבית (אם יש קודן)', kind: 'text', private: true, ltr: true },
      { key: 'spare_key', label: 'מיקום מפתח פיזי רזרבי לחירום', kind: 'text', private: true },
      { key: 'alarm_code', label: 'קוד אזעקה בבית (אם יש)', kind: 'text', private: true, ltr: true },
      { key: 'emergency_service', label: 'מוקד מצוקה (נטלי, שחל, פרטי מנוי)', kind: 'text' },
      { key: 'cameras', label: 'מצלמות בבית? (האם המשפחה צופה?)', kind: 'text' },
    ],
  },
  {
    id: 'systems', title: '5. מערכות קריטיות בבית ומעטפת רפואית',
    fields: [
      { key: 'electric_panel', label: 'ארון חשמל ומפסק ראשי (מיקום)', kind: 'text' },
      { key: 'water_shutoff', label: 'שיבר מים ראשי של הדירה (מיקום)', kind: 'text' },
      { key: 'wifi', label: 'רשת WiFi ביתית (שם וסיסמה)', kind: 'text', private: true, ltr: true },
      { key: 'tv_provider', label: 'ספק כבלים וטלוויזיה (YES, HOT, אחר)', kind: 'text' },
      { key: 'health_fund', label: 'קופת חולים, שם המרפאה ורופא המשפחה המטפל', kind: 'long' },
    ],
  },
  {
    id: 'match', title: '6. התאמת מסלול, ציפיות ודרכי תשלום',
    fields: [
      { key: 'companion_profile', label: 'פרופיל המלווה המועדף ותכונות אופי נדרשות (גבר או אישה, אנרגטי ויוזם, שקט וקשוב)', kind: 'long' },
      { key: 'payment_method', label: 'דרך תשלום מועדפת על הלקוח', kind: 'payment', private: true },
      { key: 'sensitive_topics', label: 'הערות מיוחדות, קווים אדומים או נושאים רגישים שאין להעלות מול ההורה', kind: 'long' },
    ],
  },
]
