# Family Care — מפת פרויקט

פלטפורמת תפעול RTL בעברית למועדון קונסיירז' ללקוחות 65+. Vite 8 + React 19 + TS + react-router (basename `/FamilyCare/`) + Supabase. פריסה: GitHub Pages (Actions). ה-`.env` ציבורי (מפתח publishable).

## מבנה
- `src/data/model.ts` — טיפוסי view-model וקבועים (חוזה בין DB ל-UI)
- `src/lib/` — `queries.ts` (טעינה, `optional()` סובל טבלאות חסרות), `report.ts` (שכר, שעות, חריגות), `dates.ts`
- `src/store/` — `AuthStore` (תפקידים admin|companion|family), `AppStore` (כל ה-CRUD)
- `src/components/` — `ui.tsx`, `Fields.tsx`, `Modal.tsx`, `EntityForms.tsx`
- `src/pages/admin|…`, `src/layouts/AdminLayout.tsx`, `src/styles/{tokens,base}.css`
- `supabase/migrations/0001…` + `full_setup.sql`, `upgrade_*.sql`, `seed_*.sql`, `reset_and_seed.sql`, `README.md`
- `docs/design-handoff/` — מקור האמת לעיצוב

## חוקים
- RTL: מספרים ותאריכים בתוך `<Ltr>`; כסף דרך `money()`.
- CSS: רק טוקנים מ-`tokens.css` ומחלקות קיימות; אין צבעים/ריווחים קשיחים.
- DB: RLS default-deny, anon ללא גישה; שדות חיוב רק ב-`client_billing` (admin). כל שינוי סכימה = migration חדשה + עדכון `full_setup.sql`.
- אחרי שינוי טבלה/עמודה: לעדכן `model.ts` ו-`queries.ts`.
- עסק: מסלולים basic 1600/4, platinum 3500/8, top 10000/12. שכר מלווה 70×1.3 + 30/יום נסיעות. חריגה: grace 15 דק', חיוב 300 שעה ראשונה / 250 נוספות (יחסי); המלווה מקבל תמיד על שעות בפועל.
- SQL ללוח: `LANG=en_US.UTF-8 pbcopy < file.sql` ואז אימות ב-`osascript -e 'the clipboard as «class utf8»'`.
- SQL נבדק תחבירית עם pglast בלבד; לא הורץ על Postgres מקומי.
- תשובות למשתמשת: עברית, קצר. commit/push רק כשמבקשים.

## פקודות
- dev: `npm run dev` (5173) · בדיקה: `npx tsc -b && npm run build`

## עבודה עם סוכנים (`.claude/agents/`)
הסשן הראשי = מפעיל: מתכנן, מחלק, מסכם; לא קורא קבצים גדולים בעצמו. משימה של 1–2 שורות — עושים ישירות.
- `db` — migrations/RLS/RPC · `ui` — לוגיקה ורכיבים · `design` — CSS/טוקנים/pixel-perfect
- `verify` — build וזרימות (Haiku) · `security-review` — RLS/auth לפני push (Opus)
סדר: `db` → עדכון `model.ts` → `ui` → `design` → `verify`. במקביל רק כשאין תלות בקבצים. כל סוכן מחזיר סיכום עד 10 שורות, בלי קוד גולמי.
