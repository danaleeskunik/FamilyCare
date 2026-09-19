# Handoff: Family Care Services — operations platform (Hebrew, RTL)

## Overview

Family Care Services is an Israeli luxury concierge club for third-age clients (65+) and their adult
children. A single operations team dispatches personal companions (מלווים) and vetted contractors
(ספקים) to clients' homes, bills the family, and closes every service with a written summary.

This bundle contains three connected design surfaces:

1. **Operations console (admin / מוקד תפעול)** — desktop, 5 tabs: today's board, vendor registry,
   clients, companions, finance.
2. **Client file (תיק לקוח)** — desktop, 4 tabs: medical/functional, personal preferences, service
   history, finance & membership.
3. **Companion app (מלווה בשטח)** and **client & family app (לקוח/ה ומשפחה)** — mobile, single
   scrolling screen each, reached from the role switcher at the top of the operations file.

All copy is Hebrew and **the entire product is RTL**. Copy in this document is verbatim from the
designs and must not be rewritten.

## About the design files

The files in `designs/` are **design references created in HTML** — prototypes showing intended look
and behavior, not production code to copy. They are authored in a streaming component format
(`.dc.html` + `support.js`) that exists only in the design tool.

The task is to **recreate these designs in the target codebase's environment** (React, Vue, native —
whatever the app is built in), using its established patterns, router, data layer and component
library. If no environment exists yet, choose an appropriate stack; React + a CSS-in-JS or utility
framework with full RTL support is a natural fit. Do not ship the HTML directly and do not port
`support.js`.

To view the prototypes: open `designs/Family Care App.dc.html` in a browser (it loads
`support.js` and the design-system bundle from relative paths — serve the `designs/` folder over a
local HTTP server, not `file://`).

## Fidelity

**High-fidelity.** Colors, typography, spacing, radii and shadows are final and are listed exactly
below. Recreate pixel-faithfully using the codebase's existing libraries where they match; deviate
only where an existing component in the target codebase covers the same role.

`designs/Family Care Wireframes.dc.html` is the earlier **low-fidelity** exploration of the same
flows — included for context on intent only. Where the wireframes and the hi-fi files disagree, the
hi-fi files win.

---

## Design system

The designs are built on the **Kunik Design System**, bundled here at `designs/_ds/kunik-design-system-63ae7203-9a0b-448d-a451-cdb415ca0a35/`:

- `tokens/*.css` — CSS custom properties for color, type, spacing, radius, elevation, motion.
- `styles.css` — single entry point, imports the tokens.
- `_ds_bundle.js` — the React components (`Button`, `Card`, `Badge`, `Callout`, `Icon`, `AppHeader`,
  `DataTable`, `StatCard`, `EmptyState`, …) exposed on `window.KunikDesignSystem_63ae72`.
- `assets/icons/` — 39 hand-authored line SVGs, 24×24, `fill=none`, `stroke=currentColor`, round
  caps/joins. Icons take color from the parent via `currentColor` and never carry their own hue.
- `assets/fonts/` — Rubik and Heebo TTFs.

**Deviation from the base system:** Kunik's brand hue is navy. Family Care replaces it with a teal
family (below). Everything else — type ramp, spacing, radii, card treatment, the near-zero animation
policy, the 44px tap-target floor — is unchanged. Implement the teal as the brand token values, not
as overrides scattered through components.

### Colors

| Role | Hex | Used for |
|---|---|---|
| Brand deep | `#0A3B39` | demo strip background, reassurance-block ink |
| Brand header | `#0E4F4C` | app header, mobile hero cards, active tab label |
| Brand action | `#16A5A0` | primary buttons, active filter chip, progress fill, selected checkbox |
| Brand bright | `#2BC4BC` | active role pill, plan pill on client file |
| Brand link/ink | `#0E7C77` | links, time labels, stat accent |
| Link hover | `#0A5F5B` | `a:hover` |
| On-navy secondary | `#9FD6D2` | subtitles on brand ground |
| On-navy tertiary | `#CFECEA` | inactive role-pill label, hero support line |
| Pill ink on bright | `#06302E` | label on `#2BC4BC` |
| Tint surface | `#E6F5F4` | reassurance block, contact avatar |
| Canvas | `#F4F7FB` | page background, active tab fill |
| Card | `#FFFFFF` | all cards, tables |
| Field / inset | `#F7F9FC` | table head, inset panels |
| Inert bar | `#EEF2F7` | progress track, image placeholders |
| Ink 1 | `#14202E` | body text |
| Ink 2 | `#5B6B7C` | secondary text |
| Ink 3 | `#7A8899` | card labels, table headers |
| Ink 4 | `#8A95A1` | placeholder text |
| Success | `#00A563` | positive figure (operating profit) |
| Warning | `#E1631B` | warning figures, callout edge |
| Warning surface | `#FDF1E7`, ink `#7A3B12` | briefing warning block |
| Danger | `#BE0000` | unassigned, expired licence, declined card |
| Card border | `#E4EAF1` · Field border `#DFE2E4` · Row rule `#F0F3F7` · Dashed empty `#C3D4E8` |

### Typography

- **Rubik** for everything. Weights in use: 400, 500, 600, 700, 800, 900.
- **Heebo** for numerals only — times, currency, hours, counts, phone numbers — usually 700–900 with
  `letter-spacing:-.5px` on large figures.
- Sizes carry half-pixels on purpose (12.5, 13.5, 14.5, 15.5). Do not round to a scale.
- Desktop ramp: stat figure `900 28px Heebo`; card title `800 15px`; panel title `800 15.5px`; table
  body `400–600 14px`; table head `600 12.5px`; card label `700 12.5px`; meta `500 12.5–13px`.
- Mobile (companion) ramp: hero title `800 17px`; card title `800 15.5px`; visit name `800 19px`;
  task line `600 15px`; meta `500 12.5–13px`.
- Mobile (client, 76–88-year-old readers) ramp — **deliberately larger, never reduce**: greeting
  `800 24px`; hero headline `800 21px/1.35`; card title `800 19px`; body/list item `600 16–17px/1.45`;
  no text below 15px anywhere on this surface.

### Spacing, radius, elevation, motion

- Spacing values actually used: 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 26.
  Not a strict 4px grid.
- Page gutter `clamp(14px, 4vw, 24px)`. Desktop content max-width `1240px`; companion app `430px`;
  client app `470px`.
- Radii: 6px checkbox, 8px progress bar, 10px field / tab top corners, 12px rows and inset panels,
  14px sub-cards, 16px table cards, 18px mobile hero and tiles, 20px client hero, 999px pills,
  50% avatars.
- Card: `background:#fff; border:1px solid #E4EAF1; border-radius:16px; box-shadow:0 2px 8px rgba(15,46,82,.06)`.
- Animation: essentially none. 150ms ease on interactive card lift (translateY(-3px) →
  `0 14px 30px rgba(15,46,82,.14)`) and chevron rotation. No page transitions, no skeletons, no
  bounce. Buttons darken on hover/press, never lighten or scale.

### RTL specifics (important)

- `direction: rtl` on the document; all logical properties (`padding-inline`, `text-align:start`).
- Numeric runs that must read LTR inside RTL text are wrapped with
  `direction:ltr; unicode-bidi:isolate; text-align:right` — applies to: ratios (`5 / 8`), durations
  (`62:40`, `21:40`), phone numbers (`052-441-8830`), and the building code (`2580#`).
- Currency is written `‎1,600 ₪` with a leading LRM (U+200E) and the shekel sign after the figure.
- Dates are `15.9`, `31.8`, `12.11.26`. Times are `09:30`, `17:30`.
- The warning block inside the companion briefing uses `border-right: 4px solid #E1631B` — a
  **leading-edge** bar in RTL. Use a logical border-inline-start in production.

---

## Screens

### 0. Role switcher (prototype scaffolding)

A dark strip (`#0A3B39`, padding `9px` × gutter) at the very top with the label
`תצוגת דמו — מסך הכניסה לפי סוג משתמש` and three pills: `מנהל/ת`, `מלווה בשטח`, `לקוח/ה ומשפחה`.
Pills: `padding:7px 15px`, radius 999px, `700 13px`; selected = `#2BC4BC` on `#06302E`, unselected =
transparent on `#CFECEA` with `1px solid rgba(255,255,255,.22)`.

**This strip is a prototype device only.** In production these are three separate authenticated
entry points resolved by role — do not build the switcher.

---

### 1. Operations console — header (all admin tabs)

Sticky, `z-index:20`, background `#0E4F4C`, white ink. Inner container max 1240px,
padding `16px gutter 0`.

Left cluster (gap 13px): logo `assets/logo-white.png` at height 46px; title
`שלום אלון — מוקד התפעול` (`800 15.5px/1.25`); subtitle
`שלישי 15.9 · 14 לקוחות פעילים · 6 מלווים במשמרת` (`500 12.5px/1.3`, `#9FD6D2`).
Right cluster (gap 9px): `Button variant=onNavy size=sm icon=calendar` → `לוח שבועי`;
`Button size=sm icon=plus color=#16A5A0` → `משימה חדשה`.

Tab strip below, `margin-top:16px`, `gap:4px`, horizontally scrollable. Each tab:
`padding:12px 22px; border-radius:10px 10px 0 0; font:700 15px`. Active tab = canvas fill `#F4F7FB`
with `#0E4F4C` ink (merges into the page); inactive = transparent with `#9FD6D2`.
Tabs: `לוח היום` · `ספקים ובעלי מקצוע` · `לקוחות` · `מלווים` · `כספים`.

Body container: max 1240px, `padding:22px gutter`, vertical stack, gap 14px.

---

### 2. Tab — לוח היום (today's board)

**Stat row**, 4 equal columns, gap 14px, `Card size=sm`. Each: label `700 12.5px #7A8899`, figure
`900 28px Heebo letter-spacing:-.5px`, footnote `500 12.5px #5B6B7C`.

| Label | Figure | Footnote |
|---|---|---|
| משימות היום | 9 | 4 הושלמו · 5 בהמשך היום |
| ממתין לשיבוץ | 3 *(danger `#BE0000`)* | אחת מהן להיום 16:00 |
| חריגות פתוחות | 2 *(warning `#E1631B`)* | דורשות תחקיר ומענה למשפחה |
| הכנסות ספטמבר | ‎112,400 ₪ | דמי חברות + העמסות |

**Callout** `tone=warning title="דורש החלטה עכשיו"`:
`מרים אדלר — הדרכת WhatsApp ב-16:00 עדיין ללא מלווה. שני מלווים זמינים באזור הרצליה. דניאל כ. דיווח על ירידה בתיאבון אצל יעקב ברנע — ממתין לפתיחת תחקיר.`

**Table card `משימות היום`.** Card header `15px 18px`, bottom rule `#E4EAF1`, title `800 15.5px`,
with three region filter chips on the trailing side: `רמת השרון` (active: fill `#16A5A0`, white ink),
`הרצליה`, `צפון ת"א` (inactive: `1px solid #DFE2E4`, `#5B6B7C`). Chips are `4px 12px`, radius 999px,
`700 12.5px`.

Table: header cells `600 12.5px #7A8899` on `#F7F9FC`, `padding:11px 18px`, bottom border `#E4EAF1`.
Body cells `padding:12px 18px`, row rule `1px solid #F0F3F7`, last row no rule.
Columns: שעה · לקוח/ה · משימה · מלווה / ספק · סטטוס.

| שעה | לקוח/ה | משימה | מלווה / ספק | סטטוס |
|---|---|---|---|---|
| 09:30 | שרה לוי | ליווי לרופא + מרשמים | נועה ש. | Badge green `בביצוע` |
| 11:00 | יעקב ברנע | קניות מזון וסידור מקרר | דניאל כ. | Badge neutral `מתוכנן` |
| 13:00 | חנה פלד | תיקון מזגן — ליווי טכנאי | קור־טק · עדי ר. | Badge blue `אושר ללקוח` |
| 16:00 | מרים אדלר | הדרכת WhatsApp | `ללא שיבוץ` in `#BE0000` | **action pill** `שיבוץ` — `#16A5A0` fill, white `800 12px`, `4px 10px`, radius 999px, pointer |
| 17:30 | שרה לוי | בית קפה + מונית VIP | נועה ש. · מוניות אלון | Badge neutral `מתוכנן` |

Time cells use Heebo 500 14px.

**Three cards below**, equal columns, gap 14px:

1. `בקשות חדשות מהמשפחות` — three rows, name on the leading side and relative time (`12.5px #5B6B7C`)
   on the trailing side: `רונית לוי — רופא/ה עד הבית · לפני 20 דק׳`;
   `משפחת אדלר — כרטיסים לקונצרט · אתמול`; `חנה פלד — הנדימן למעקה · אתמול`.
2. `סיכומי ביקור לאישור` — body
   `כל שירות נסגר במשוב ותחקיר. 3 סיכומים ממתינים לאישור מנהלת לפני שליחה למשפחה.` +
   `Button variant=secondary size=sm` → `מעבר לתור האישורים`.
3. `מסלולים פעילים` — three rows: `בסיסי · ‎1,600 ₪` → 5; `פלטינום · ‎3,500 ₪` → 7;
   `טופ פלטינום · ‎10,000 ₪` → 2. Counts in Heebo 700.

---

### 3. Tab — ספקים ובעלי מקצוע (vendor registry)

**Stat row (4):** ספקים מאושרים `28` / `ב-11 תחומי מקצוע`; רישיון או ביטוח שפג `2` (danger) /
`מוקפאים עד חידוש`; דירוג ממוצע `4.6` / `מ-146 משובי לקוחות ומלווים`; דמי ניהול שנצברו `‎8,940 ₪` /
`10% על עבודות קבלנים בספטמבר`.

**Callout** `tone=warning title="בקרת רישיונות"`:
`לטכנאי הגז יוסי בר־און פג תוקף הרישיון ב-31.8, ולמנעולן א. שחר פגה פוליסת צד ג׳. שניהם מוקפאים אוטומטית ולא ניתנים לשיבוץ עד העלאת מסמך מעודכן.`

**Table `מאגר בעלי מקצוע מאושרים`** with a search field placeholder
`חיפוש לפי תחום, שם או אזור` (`1px solid #DFE2E4`, radius 10px, `8px 14px`, `500 13.5px #8A95A1`)
and `Button size=sm icon=plus color=#16A5A0` → `ספק חדש`.
Columns: בעל מקצוע · תחום · אזור · מחירון מוסכם · רישיון / ביטוח · דירוג · סטטוס.

| בעל מקצוע | תחום | אזור | מחירון מוסכם | רישיון / ביטוח | דירוג | סטטוס |
|---|---|---|---|---|---|---|
| אבי מזרחי | אינסטלציה | רמת השרון · הרצליה | ביקור ‎350 ₪ · שעה ‎280 ₪ | בתוקף עד 04.27 | 4.9 | green `פעיל` |
| קור־טק מיזוג | מיזוג אוויר | גוש דן | ביקור ‎300 ₪ · שעה ‎250 ₪ | בתוקף עד 11.26 | 4.5 | green `פעיל` |
| יוסי בר־און | טכנאי גז | השרון | ביקור ‎390 ₪ | **`פג 31.8`** `700 #BE0000` | 4.2 | red `מוקפא` |
| מוניות אלון · VIP | הסעות | ארצי | רמה"ש ‎40 ₪ · ת"א בעומס ‎120 ₪ · המתנה ‎111 ₪ | בתוקף עד 02.27 | 4.8 | green `פעיל` |
| ד"ר נעם הרשקו | רופא עד הבית | הרצליה · רמת השרון | ביקור ‎700 ₪ | בתוקף עד 09.27 | 5.0 | green `פעיל` |
| א. שחר מנעולנות | מנעולן · חירום | גוש דן | קריאת חירום ‎450 ₪ | **`ביטוח צד ג׳ פג`** `700 #BE0000` | 4.0 | red `מוקפא` |

**Two cards below (2 columns):**

1. `איך מחושב החיוב ללקוח` — worked example, rows separated by `#F0F3F7`, value column Heebo 700:
   עלות בעל המקצוע ‎1,000 ₪ · תוספת זמינות 10% ‎100 ₪ *(muted)* · דמי ניהול 10% ‎110 ₪ *(muted)* ·
   `ליווי נציג — שעה ראשונה ‎300 ₪ + נוספת ‎250 ₪` ‎550 ₪ · **סה"כ ללקוח ‎1,760 ₪** (`800 15.5px`,
   value Heebo 900).
2. `משובי איכות אחרונים` — `אבי מזרחי · תיקון נזילה אצל שרה לוי` /
   `5.0 — הגיע בזמן, ניקה אחריו. המלווה אישרה.`; `קור־טק · תיקון מזגן אצל חנה פלד` /
   `3.8 — איחור של שעה. נשלחה הערה לספק.` + `Button variant=secondary size=sm` → `כל דוחות התחקיר`.

---

### 4. Tab — לקוחות (clients)

**Stat row (4):** לקוחות פעילים `14` / `יעד שנתיים: 100 משפחות`; בתקופת היכרות `3` /
`חודש ראשון ללא התחייבות`; `ניצול מכסה — ממוצע כל 14 הלקוחות` `71%` /
`מהמפגשים שבמסלול נוצלו החודש`; פגישות היכרות השבוע `2` / `ביקור ראשון חינם`.

**Table `כל הלקוחות`**, search placeholder `חיפוש לפי שם, אזור או מסלול`,
`Button size=sm icon=plus color=#16A5A0` → `לקוח/ה חדש/ה`.
Columns: לקוח/ה · גיל · אזור · מסלול · מפגשים · מלווה קבוע/ה · מזמין/ת השירות · הביקור הבא · (link).

| לקוח/ה | גיל | אזור | מסלול | מפגשים | מלווה קבוע/ה | מזמין/ת השירות | הביקור הבא |
|---|---|---|---|---|---|---|---|
| שרה לוי | 84 | רמת השרון | green `פלטינום` | 5 / 8 | נועה ש. | רונית לוי־שדה | היום 17:30 |
| יעקב ברנע | 79 | הרצליה | neutral `בסיסי` | 3 / 4 | דניאל כ. | אילנה ברנע | היום 11:00 |
| חנה פלד | 88 | הרצליה | blue `טופ פלטינום` | 9 / 12 | עדי ר. · עו"ס | דורון פלד | היום 13:00 |
| מרים אדלר | 76 | צפון תל אביב | green `פלטינום` | 6 / 8 | `אין מלווה קבועה` `500 #BE0000` | גלית אדלר | היום 16:00 |
| אריה גולן | 81 | רמת השרון | orange `תקופת היכרות` | 1 / 4 | נועה ש. | תמר גולן | חמישי 10:00 |

Last column: link `תיק לקוח` → the client-file screen (screen 7).
`מפגשים` is the LTR-isolated ratio.

**Callout** `tone=tip title="לטיפול השבוע"`:
`מרים אדלר עדיין ללא מלווה קבועה אחרי שישה מפגשים — כדאי לקבע התאמה. אריה גולן מסיים תקופת היכרות ב-30.9 וצריך שיחת המשך לבחירת מסלול.`

---

### 5. Tab — מלווים (companions)

**Stat row (4):** מלווים פעילים `9` / `2 עו"ס · 5 סטודנטים · 2 מלווים`; שעות במשמרת היום `21:40`
(LTR-isolated) / `6 מלווים בשטח`; שכר מוערך לחודש `‎38,600 ₪` /
`כולל מקדם 1.3 ונסיעות ‎30 ₪ ליום`; דירוג ממוצע מהמשפחות `4.8` / `מתוך 63 משובים בספטמבר`.

**Table `צוות המלווים`** + `Button size=sm icon=plus color=#16A5A0` → `מלווה חדש/ה`.
Columns: מלווה · תפקיד · אזורים · שפות · לקוחות קבועים · שעות החודש · זמינות היום.

| מלווה | תפקיד | אזורים | שפות | לקוחות קבועים | שעות החודש | זמינות היום |
|---|---|---|---|---|---|---|
| נועה שרעבי | מלווה אישית | רמת השרון · הרצליה | עברית, רוסית | שרה לוי · אריה גולן | 62:40 | green `בביקור` |
| עדי רוזן | עובדת סוציאלית | הרצליה · רעננה | עברית, אנגלית | חנה פלד | 71:15 | neutral `פנויה מ-15:00` |
| דניאל כהן | סטודנט | הרצליה · צפון ת"א | עברית | יעקב ברנע | 44:00 | green `זמין` |
| תמר בן־דוד | סטודנטית | צפון ת"א | עברית, ערבית | — | 28:30 | green `זמינה מ-16:00` |

**Two cards below:**

1. `חישוב שכר מלווה` — `שכר שעתי (פי 2 ממינימום)` ‎70 ₪ · `מקדם 1.3 — סוציאליות וביטוח לאומי`
   ‎91 ₪ *(muted)* · `נסיעות ליום עבודה` ‎30 ₪ · **`עלות שעת ליווי לחברה` ‎91 ₪**.
2. `התאמת מלווה ללקוח` — explainer
   `השיבוץ מחושב לפי קרבה גיאוגרפית, שפה, מגדר, סוג המשימה והעדפה אישית של הלקוח.` then two
   suggestion rows (`1px solid #E4EAF1`, radius 12px, `10px 12px`, `600 14px`) with the match in
   `#0E7C77 800`: `מרים אדלר · הדרכת WhatsApp 16:00` → `תמר ב. — 1.6 ק"מ`;
   `אריה גולן · ביקור חמישי` → `נועה ש. — קבועה`.

---

### 6. Tab — כספים (finance)

**Stat row (4):** דמי חברות שנגבו `‎52,500 ₪` / `סליקה אוטומטית ב-1.9`; שעות ליווי והעמסות
`‎59,900 ₪` / `כולל ‎8,940 ₪ דמי ניהול`; הוצאות תפעול `‎71,200 ₪` / `שכר, קבלנים, משרד ושיווק`;
רווח תפעולי `‎41,200 ₪` in `#00A563` / `36.6% מההכנסות`.

Layout below: `grid-template-columns: repeat(auto-fit, minmax(640px, 1fr))`, gap 14px,
`align-items:start`.

**Table `חשבוניות ספטמבר`** + `Button variant=secondary size=sm icon=export` → `ייצוא ל-iCount`.
Columns: מזמין/ת השירות · דמי חברות · שעות ליווי · ספקים + ניהול · סה"כ · סטטוס.
Money cells Heebo 400, total column Heebo 700, all `white-space:nowrap`.

| מזמין/ת השירות | דמי חברות | שעות ליווי | ספקים + ניהול | סה"כ | סטטוס |
|---|---|---|---|---|---|
| רונית לוי־שדה | ‎3,500 ₪ | ‎800 ₪ | ‎1,518 ₪ | ‎5,818 ₪ | green `שולם` |
| דורון פלד | ‎10,000 ₪ | ‎550 ₪ | ‎990 ₪ | ‎11,540 ₪ | green `שולם` |
| אילנה ברנע | ‎1,600 ₪ | ‎1,050 ₪ | ‎264 ₪ | ‎2,914 ₪ | orange `ממתין לסליקה` |
| גלית אדלר | ‎3,500 ₪ | ‎300 ₪ | ‎0 ₪ | ‎3,800 ₪ | red `כרטיס נדחה` |

**Side column (two cards):**

1. `רווחיות לפי מסלול` — three labelled progress bars, track `#EEF2F7`, height 8px, radius 999px:
   `בסיסי · 5 לקוחות` 22% fill `#9CC7F5`; `פלטינום · 7 לקוחות` 38% fill `#16A5A0`;
   `טופ פלטינום · 2 לקוחות` 45% fill `#0E4F4C`. Percentages Heebo 800.
2. `ארנק דיגיטלי — קבלות מהשטח` — `קבלות שנסרקו החודש` 37 · `סכום מצטבר` ‎6,412 ₪ ·
   `ממתינות לשיוך ללקוח` 4 in `#BE0000`.

**Callout** `tone=warning title="גבייה"`:
`הכרטיס של גלית אדלר נדחה בסליקת ה-1.9. נשלחה בקשה לעדכון אמצעי תשלום; ‎3,800 ₪ פתוחים.`

---

### 7. Client file — `designs/Client File.dc.html`

Own page, reached from the client table. Same sticky `#0E4F4C` header pattern; title
`תיק לקוח · שרה לוי, 84`, subtitle `רמת השרון · לקוחה מאז 03.24 · מנהלת תיק: ליאת ב.`, a 1px ×
22px `rgba(255,255,255,.22)` divider after the logo. Header actions: plan pill `מסלול פלטינום`
(`#2BC4BC` on `#06302E`, `800 12.5px`, `6px 13px`, radius 999px);
`Button variant=onNavy size=sm icon=message` → `הודעה למשפחה`;
`Button size=sm icon=plus color=#16A5A0` → `הזמנת שירות`.
Tabs: `רפואי ותפקודי` · `העדפות אישיות` · `היסטוריית שירות` · `כספים ומנוי`.

Body: `grid-template-columns: 288px minmax(0,1fr)`, gap 18px, `align-items:start`.

**Sidebar (sticky, `top:132px`, gap 13px):**

- Identity card — 62px circle avatar `#E3EAF2` with initials `ש"ל` in `800 20px #0E4F4C`; name
  `שרה לוי` `800 18px`; `84 · תלות קלה · הליכון`. Then three label/value rows (`500 13.5px #5B6B7C`
  label, `700` value): טלפון `052-441-8830` (Heebo, LTR); כתובת `ז'בוטינסקי 18, רמת השרון`;
  קוד לבניין `2580#` (Heebo 900, LTR).
- `אנשי קשר` — three 34px circle avatars (`#E6F5F4`, `#EEF2F7`, `#FDEEE4`) with name `700 14px` and
  role `500 12.5px #5B6B7C`: `רונית לוי־שדה` / `בת · מזמינת השירות · הרשאה מלאה`; `מאיר לוי` /
  `בן · צפייה בלבד`; `ד"ר גיל אבידן` / `רופא מטפל · מכבי רמת השרון`.
- `מסמכים משפטיים` + Badge neutral `מורשים בלבד` — two document rows with the `document` icon at
  17px (`1px solid #E4EAF1`, radius 12px, `9px 11px`, `600 13.5px`): `ייפוי כוח מתמשך`,
  `ייפוי כוח רפואי`; then a dashed empty row (`1px dashed #C3D4E8`, `#8A95A1`):
  `אין הנחיות מקדימות. אפשר להעלות מסמך.`

**Tab רפואי ותפקודי** — 2×2 cards + callout.

- `תרופות קבועות`: אליקוויס 5 מ"ג / בוקר וערב; לוסארטן 50 מ"ג / בוקר; ויטמין D / פעם בשבוע; footer
  `מרשמים מתחדשים ב-1 לחודש · איסוף על ידי המלווה`.
- `רגישויות ואלרגיות`: Badge red `פניצילין`, Badge orange `לקטוז`; note
  `מופיע אוטומטית בתדריך לכל מלווה ולכל ספק רפואי שמגיע לבית.`
- `ניידות`: `הליכון · מדרגות בקושי · מעלית בבניין`; note
  `מעקה בטיחות הותקן במקלחת 04.25. הסעות — מונית VIP בלבד.`
- `מצב קוגניטיבי`: `צלולה · שכחה קלה`; note
  `מומלץ להזכיר תורים יום מראש בשיחה, לא בהודעה בלבד.`
- Callout `tone=warning title="חריגה שדווחה 15.9"`:
  `נועה דיווחה על כאב בברך ימין בעלייה במדרגות. ממתין לתיאום ביקור רופא/ה עד הבית.`

**Tab העדפות אישיות** — 2×2 cards.

- `אוכל ומעדניות`: `רביבה וסיליה · דליקטסן בן יהודה` /
  `אוהבת: מרק עוף, גבינה בולגרית, עוגת גבינה. לא אוכלת חריף.`
- `תרבות ופנאי`: `הבימה · הקאמרי · מוזיקה קלאסית` / `עיתון "הארץ" בשישי. מעדיפה מופעי בוקר.`
- `הרגלי יום־יום`: `קמה ב-7:00 · קפה הפוך ב-8:00 · מנוחה אחר הצהריים 14:00–16:00 · לא לתאם ביקורים אחרי 19:00.`
- `העדפות למלווה`: Badges neutral `מלווה אישה`, neutral `עברית ורוסית`, green
  `נועה ש. — מלווה קבועה`; note `רצוי אותו פרצוף. החלפה — רק בתיאום מראש עם רונית.`

**Tab היסטוריית שירות** — table `ביקורים ושירותים אחרונים`, header meta
`ספטמבר 2026 · 9 ביקורים · 18:40 שעות`. Columns: תאריך · מלווה / ספק · מה נעשה · משך · עלות · (link).
Header cells here are `800 12.5px`; body rows `padding:13px 18px`.

| תאריך | מלווה / ספק | מה נעשה | משך | עלות | link |
|---|---|---|---|---|---|
| 15.9 | נועה ש. | קניות במעדנייה, סידור מקרר, הליכה | 2:05 | ‎550 ₪ | סיכום ביקור |
| 12.9 | אבי מ. · אינסטלטור | תיקון נזילה במטבח | 1:20 | ‎1,210 ₪ | חשבונית |
| 11.9 | דניאל כ. | ליווי לרופא + איסוף מרשמים | 3:10 | ‎850 ₪ | סיכום ביקור |
| 8.9 | נועה ש. | בית קפה, סידור דואר וארנונה | 2:00 | ‎550 ₪ | סיכום ביקור |
| 4.9 | מוניות אלון · VIP | הסעה לתיאטרון הבימה וחזרה | — | ‎264 ₪ | חשבונית |

Below: small card `דירוג איכות ממוצע` — `4.8` in `900 26px Heebo #0E7C77` baseline-aligned with
`מתוך 9 משובים של המשפחה החודש`.

**Tab כספים ומנוי**

- Three cards: `דמי חברות חודשיים` ‎3,500 ₪ / `נגבה ב-1.9 · כרטיס מסתיים ב-4417`;
  `מפגשים שנוצלו החודש` `5 / 8` + 62% progress bar (`#16A5A0` on `#EEF2F7`) /
  `פעמיים בשבוע · 3 שעות למפגש`; `חיובים נוספים החודש` ‎2,318 ₪ /
  `קבלנים, נסיעות וקבלות שנסרקו`.
- Card `פירוט לחשבונית ספטמבר` + `Button variant=secondary size=sm icon=export` → `הפקת דוח חודשי`.
  Rows (`500 14.5px`, `padding:11px 0`, rule `#F0F3F7`, values Heebo 700):
  `אינסטלטור — עלות בעל מקצוע` ‎1,000 ₪ · `תוספת זמינות 10%` ‎100 ₪ *(muted)* · `דמי ניהול 10%`
  ‎110 ₪ *(muted)* · `שעות ליווי מעבר למכסה (1 + 2)` ‎800 ₪ · `נסיעות ומוניות VIP` ‎264 ₪ ·
  **`סה"כ לחיוב` ‎2,318 ₪** (`800 15.5px`, value Heebo 900).
- Card `הטבות המסלול · פלטינום` + Badge green `תגמול נקודות בקצב גבוה`; six benefit chips in a
  2-column grid (`1px solid #E4EAF1`, radius 12px, `10px 12px`, `600 14px`):
  `מפגשי בוקר — קפה ומאפה` · `ביקור שישי חודשי — חלה, עיתון, פרחים` ·
  `רכב יוקרה או מונית VIP לבילויים` · `ליווי נציג בכל ביקור טכנאי` · `תיאום מראש — 3 ימים` ·
  `אחזקת הבית — עד יום אחד`.
- Callout `tone=info title="תקרה תקציבית"`:
  `רונית הגדירה תקרה של ‎3,000 ₪ לחודש מעבר לדמי החברות. נותרו ‎682 ₪ — התראה תישלח בהתקרבות לרף.`

---

### 8. Companion app (מלווה בשטח) — mobile

Single column, `max-width:430px`, `padding:18px gutter`, gap 13px.

**Hero** — `#0E4F4C`, radius 18px, `padding:17px 18px`, white ink.
`בוקר טוב, נועה` (`800 17px`) / `שלישי 15.9 · 3 ביקורים · 7:15 שעות` (`500 13px #9FD6D2`); white logo
at 34px on the trailing side. Two inset tiles (`rgba(255,255,255,.08)`, `1px solid rgba(255,255,255,.22)`,
radius 12px, padding 10px): `שעות החודש` `62:40` (LTR-isolated, Heebo 900 20px);
`נסיעות להחזר` `‎120 ₪`.

**Current-visit card** — Card with `border-color:#16A5A0`.
Badge green `הביקור הנוכחי` + `09:30–11:30` (`700 13.5px Heebo #5B6B7C`).
`שרה לוי, 84` (`800 19px`); `ז'בוטינסקי 18, רמת השרון · קוד 2580#` (code LTR-isolated, 700).
Briefing panel (`#F7F9FC`, radius 12px, padding 12px): label `תדריך הביקור`, then three 20px
checkbox rows (`radius 6px`, `2px` border; checked = `#16A5A0` fill+border, unchecked = `#C3D4E8`),
`600 15px` labels: **[✓]** `איסוף מרשמים בבית המרקחת`; `ליווי לתור אצל ד"ר אבידן ב-10:15`;
`לבדוק שיש חלב וירקות במקרר`.
Alert block: `#FDF1E7`, leading 4px `#E1631B` bar, radius 12px, `11px 13px`, `600 14px/1.5 #7A3B12`:
`אלרגיה לפניצילין · הליכון · מדרגות בקושי. לא לתאם אחרי 19:00.`
Two `size=lg` buttons side by side (52px tall): `Check-Out` (`color=#16A5A0`) and `ניווט` (secondary).

**Two quick-action tiles** (interactive cards, 96px): icon `image` 22px + `סריקת קבלה` /
`צילום ושיוך ללקוח`; icon `warning` 22px + `דיווח חריגה` / `שינוי במצב או תקלה בבית`.

**Visit-summary card** `סיכום ביקור — נשלח למשפחה` — textarea placeholder panel (`#F7F9FC`,
radius 12px, `500 15px/1.6 #5B6B7C`): `מה נעשה בביקור? כתבי בשתי שורות, או הקליטי ונמלא עבורך.`
Photo strip: one dashed 74×60 add-tile `+ תמונה` (`1px dashed #C3D4E8`, `#8A95A1`) plus two filled
`#EEF2F7` thumbs. Actions: `Button size=md color=#16A5A0` → `שליחת סיכום`;
`Button variant=quiet size=md` → `טיוטה`.

**`בהמשך היום`** — two rows, time in `500 14px Heebo #0E7C77` in a fixed 44px leading column:
`13:00` `חנה פלד — ליווי טכנאי מזגן` / `סוקולוב 7, הרצליה · קור־טק`;
`17:30` `שרה לוי — בית קפה` / `מונית VIP מתואמת ל-17:15`.

---

### 9. Client & family app (לקוח/ה ומשפחה) — mobile

Single column, `max-width:470px`, gap 14px. **Everything here is one step larger than the companion
app by design — these users are 76–88. Do not shrink type or tap targets.**

**Hero** — `#0E4F4C`, radius 20px, padding 20px. `שלום שרה` (`800 24px`) /
`יום שלישי, 15 בספטמבר` (`600 16px #9FD6D2`); white logo 40px. Inset panel
(`rgba(255,255,255,.08)`, `1px solid rgba(255,255,255,.22)`, radius 14px, padding 15px):
`היום ב-9:30` (`600 15px #9FD6D2`) / `נועה מגיעה לקחת אותך לד"ר אבידן` (`800 21px/1.35`) /
`המונית תחכה למטה ב-9:20` (`600 16px #CFECEA`).

**Two action tiles**, min-height 112px, radius 18px, icon at top and label at bottom (`800 19px`):
`בקשה חדשה` — solid `#16A5A0`, white, icon `message` 26px; `להתקשר לרונית` — white card, icon
`bell` 26px.

**`התוכנית שלי לחודש ספטמבר`** (`Card size=lg`) — four rows, day label in `700 16px Heebo #0E7C77`
in a 52px leading column, body `600 17px/1.45`: `שלישי` `ביקור של נועה — ליווי לרופא`; `חמישי`
`קניות במעדנייה וסידור הבית`; `שישי` `חלה, עיתון ופרחים — הטבת המסלול`; `22.9`
`קונצרט בהיכל התרבות עם חנה`.

**`המסלול והזכויות שלי`** + Badge green `פלטינום` — `מפגשים החודש` `5 / 8` with a 12px progress bar
at 62% (`#16A5A0` on `#EEF2F7`), then four benefit lines (`600 16px/1.5`):
`ביקור שישי חודשי — חלה, עיתון ופרחים` · `מפגשי בוקר עם קפה ומאפה` ·
`מונית VIP או רכב יוקרה לבילויים` · `נציגה קבועה — נועה ש.`

**`סיכומי הביקורים שלי`** — two bordered blocks (`1px solid #E4EAF1`, radius 14px, padding 14px):
`חמישי 11.9 · דניאל` / `ליווי לרופא ואיסוף מרשמים. הכול עבר בשלום.` + two 62×50 `#EEF2F7` photo
thumbs; `שני 8.9 · נועה` / `בית קפה בכיכר, סידור דואר ותשלום ארנונה.`

**Reassurance block** — `#E6F5F4`, radius 18px, padding 18px, `600 17px/1.5 #0A3B39`:
`רוצה משהו? אפשר גם להקליט הודעה במקום להקליד — אנחנו נחזור אליך תוך שעה.`

---

## Interactions & behavior

Implemented in the prototype:

- **Role switch** — swaps the entire surface (admin console / companion app / client app). Prototype
  only; production resolves role at login.
- **Admin tabs** (5) and **client-file tabs** (4) — local state, instant swap, no transition. Active
  tab takes the canvas fill and merges into the page body.
- **Navigation** — `תיק לקוח` links from the client table to the client-file page.
- Tab strips are horizontally scrollable (`overflow-x:auto`); tables scroll horizontally inside
  their card.

Designed but not wired — build these:

- `שיבוץ` action pill on an unassigned task → assignment flow using the matching logic in
  `התאמת מלווה ללקוח` (geography, language, gender, task type, client preference).
- Region filter chips on the today's board (single-select, `רמת השרון` default).
- Search fields on the vendor and client tables (placeholder copy given above).
- `Check-Out` / `ניווט` on the companion current-visit card; checkbox toggling in the briefing.
- Receipt scan and exception report tiles.
- Visit summary: text or voice dictation, photo attachment, send or save draft. Every service closes
  with a summary; three summaries await manager approval before going to the family.
- Vendor auto-freeze when a licence or insurance policy expires — frozen vendors cannot be assigned.
- `ייצוא ל-iCount`, `הפקת דוח חודשי` exports.
- Budget-ceiling alert when monthly extra charges approach the family-set cap.

States to add that the static designs do not show: loading, empty, error, form validation.
Empty states must name the next action (design-system rule) — never "nothing here yet".

## State model (suggested)

- `session.role`: `admin | companion | client`
- `ui.adminTab`: `dash | vendors | clients | staff | money`
- `ui.clientFileTab`: `med | pref | hist | fin`
- `ui.regionFilter`: string | null
- Domain entities: `Client`, `FamilyContact` (with permission level: full / view-only), `Companion`,
  `Vendor` (with licence + insurance expiry, freeze flag, rating), `Task`/`Visit` (time, client,
  description, assignee, status), `VisitSummary` (text, photos, approval state), `Receipt`,
  `Invoice`, `MembershipPlan`, `Exception`/incident.

## Business rules embedded in the designs

- **Plans:** בסיסי ‎1,600 ₪/mo (4 sessions) · פלטינום ‎3,500 ₪/mo (8) · טופ פלטינום ‎10,000 ₪/mo (12).
  First month is a no-commitment trial (`תקופת היכרות`), first visit free.
- **Client billing for contractor work:** vendor cost + 10% availability surcharge + 10% management
  fee + representative escort (‎300 ₪ first hour, ‎250 ₪ each additional).
- **Companion cost to the company:** hourly wage ‎70 ₪ (twice minimum) × 1.3 social-cost factor =
  ‎91 ₪/hour, plus ‎30 ₪ travel per working day.
- Overage: hours beyond the plan quota are billed separately.

## Assets

| Asset | Path | Notes |
|---|---|---|
| White logo (on brand ground) | `designs/assets/logo-white.png` | 46px header, 34px companion hero, 40px client hero. Alt: `Family Care — always with you` |
| Full-colour logo | `designs/assets/family-care-logo.png` | not used in these screens |
| Trimmed logo | `designs/assets/logo-trim.png` | not used in these screens |
| Icons | `designs/_ds/.../assets/icons/` | 39 line SVGs, 24×24, currentColor |
| Fonts | `designs/_ds/.../assets/fonts/` | Rubik.ttf, Heebo.ttf |

Image placeholders (`#EEF2F7` blocks, dashed `+ תמונה` tiles) mark where real user photos go — no
stock photography anywhere in this brand.

## Files

| File | What it is |
|---|---|
| `designs/Family Care App.dc.html` | Hi-fi: role switcher, 5-tab operations console, companion app, client app |
| `designs/Client File.dc.html` | Hi-fi: 4-tab client file |
| `designs/Family Care Wireframes.dc.html` | Lo-fi wireframes of the same flows (context only) |
| `designs/_ds/…` | Kunik Design System — tokens, styles, component bundle, icons, fonts |
| `designs/assets/` | Family Care logos |
| `designs/support.js` | Design-tool runtime. **Do not port.** |
| `business-plan.txt` | Source business plan (Hebrew) — vision, client profiles, service catalogue, plan pricing, pricing mechanics, vetted-vendor network |

## Copy rules (from the design system)

- Warm, direct, practical second person. Feminine by default; inclusive slash form
  (`התלמיד/ה`, `לקוח/ה`, `רופא/ה`) when the reader could be either. Never a masculine default.
- Name the worry, then dissolve it — the reassurance block on the client app is the pattern.
- No emoji. Latin product names kept as branded (WhatsApp, iCount, VIP). `₪` before the figure,
  phones LTR as `053-700-4934`, dates as `12.11.26`.
- Em-dash as a Hebrew separator: `רמה 1 — סמארטפון`.
