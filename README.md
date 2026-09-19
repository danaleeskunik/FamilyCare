# Family Care

פלטפורמת תפעול לשירותי Family Care — מועדון קונסיירז' ללקוחות בגיל השלישי ולילדיהם הבוגרים. עברית, RTL מלא.

## מה יש כאן

שלושה משטחים, לפי handoff העיצוב ב-`docs/design-handoff/`:

| נתיב | משטח |
|---|---|
| `/admin` | קונסולת תפעול — לוח היום, ספקים, לקוחות, מלווים, כספים |
| `/admin/clients/:id` | תיק לקוח (כרגע רק `sara-levi`) |
| `/companion` | אפליקציית מלווה בשטח (מובייל) |
| `/client` | אפליקציית לקוח/ה ומשפחה (מובייל, טיפוגרפיה גדולה במכוון) |

הנתונים והאימות ב-Supabase (`supabase/`). מסוף התפעול (`/admin`) דורש התחברות של משתמש/ת עם תפקיד `admin`. מסכי המלווה והלקוח עדיין דמו סטטי. `src/data/mock.ts` משמש כטיפוסים ולנתוני ה-seed.

## הקמת Supabase

הוראות מלאות, מפת הישויות והכללים ב-[`supabase/README.md`](supabase/README.md).
בקצרה: להריץ `supabase/full_setup.sql` ב-SQL Editor, ליצור משתמש/ת ולהגדיר אותו/ה כ-admin.
`.env` מכיל את ה-URL וה-publishable key (גלויים בכוונה). ההגנה על הנתונים היא RLS + התחברות. לעולם לא לשים כאן service_role או סיסמת DB.

> הסכימה החדשה יחסית (מזהי uuid וקשרים בין הטבלאות). קוד האפליקציה עדיין עובד עם המודל השטוח הישן ועובר התאמה.

## הרצה

```bash
npm install
npm run dev
```

## מבנה

- `src/styles/tokens.css` — טוקנים (מותג teal מעל מערכת העיצוב של Kunik)
- `src/components/ui.tsx` — Button, Card, Badge, Callout, StatCard, Icon, ועוד
- `src/layouts`, `src/pages` — המסכים
- `docs/design-handoff/` — קבצי העיצוב המקוריים, README של ה-handoff ותוכנית העסקית

## כללי RTL

רצפים מספריים שחייבים להיקרא LTR (יחסים, משכי זמן, טלפונים, קודים) עוטפים ב-`<Ltr>`; מטבע דרך `money()` (LRM + ₪ אחרי המספר).
