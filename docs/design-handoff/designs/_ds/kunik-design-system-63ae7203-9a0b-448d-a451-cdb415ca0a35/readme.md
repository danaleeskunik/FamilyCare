# Kunik Design System

The design language of **Dana Kunik** (דנה קוניק) — a one-person practice in Ramat HaSharon that teaches technology to older adults, and the small suite of tools built to run it.

Everything here is RTL Hebrew first. The audience is people in their seventies and eighties learning a smartphone, and the operator is a single teacher working from a phone between house calls. That produces the two rules the whole system obeys: **nothing is smaller than it needs to be, and nothing moves unless it has to.**

## Sources

| Source | Path given to us | What was taken from it |
|---|---|---|
| `KunikHome` codebase | `KunikHome/` (local mount) | `kunikHome.dc.html` — the uncompiled source of the family-admin hub: domain list, field definitions, icon paths, accent colours, sidebar rail |
| `DanaTech` / final codebase | `final/` (local mount) | `home.html` (raw), plus `index.html`, `teaching-toolkit.html`, `practice-sheets.html`, `flier.html` — self-contained bundles that were unpacked to recover their real source, and `Rubik.ttf` / `Heebo.ttf` |
| Marketing deck | `final/מצגת-טק-בגובה-העיניים.pptx` | Seven slides of verbatim Hebrew copy, rebuilt as slide templates |
| Portrait | embedded in `final/flier.html` | `assets/dana-portrait.png` |
| GitHub | `danaleeskunik/kunikHome` @ `main`; reference repo `danaleeskunik/DanaTech` @ `main` | Recorded in the source's own `github.md`; not fetched here |

The bundled pages were unpacked to recover their real source before anything was written; the recovered files were reference-only and are not kept here.

## Products

**טק בגובה העיניים — "Tech at Eye Level"** (`ui_kits/tech-eye-level/`). The teaching business. A hub page, a business manager (students, payments, weekly schedule), a teaching toolkit (lesson plans and practice sheets by level), a printable practice sheet, and a printable A4 flier.

**kunikHome** (`ui_kits/kunik-home/`). A private family-admin hub covering seven life domains: insurance, savings, health, vehicles, documents, payment reminders, income.

Both apps are Hebrew, RTL, navy-headed, card-based, and share one component vocabulary.

---

## Content fundamentals

**Voice.** Warm, direct, practical. It sounds like a competent friend, not a product. Copy is written *to* a person and almost always in second person: "בחרי לאן להיכנס", "נתקעת? אל תישארי עם השאלה — כתבי לי ואחזור אליך."

**Gender.** Hebrew forces a choice. The system uses feminine second person by default (the operator and most students are women) and switches to the inclusive slash form when the reader could be either: "התלמיד/ה", "לבן/בת משפחה", "רופא/מרפאה מטפלים". Never a masculine default.

**Reassurance before instruction.** The most characteristic move in the whole brand: name the fear, then dissolve it. "אי אפשר 'לשבור' טלפון בלחיצה. נסי בחופשיות!" · "אין צורך לסיים הכל — כל משימה שעשיתם היא התקדמות." · "בלי לחץ ובלי שיפוט."

**Empty states name the next action.** Never "nothing here yet." Always: "אין שיעורים קבועים. הוסיפי יום ושעה לתלמיד/ה בכרטיס שלה."

**Casing and punctuation.** Hebrew has no case. Latin product names are kept exactly as branded — WhatsApp, Zoom, FaceTime, ChatGPT, Google Photos, gov.il, Gett, Waze. Sentences end in a full stop; headings usually do not. Exclamation marks appear, sparingly, and only in encouragement ("שלום!", "נסי בחופשיות!"). Em-dashes are common as a Hebrew maqaf-style separator: "רמה 1 — סמארטפון".

**Numbers.** Israeli conventions: `₪` before the figure, phone numbers as `053-700-4934` always set LTR inside the RTL flow, dates as `12.11.26`.

**Emoji.** None. The only non-letter glyph in body copy is the check mark `✓` on printed sheets ("סמנו ✓ בכל משימה").

**Length.** Card blurbs are one sentence. Bullet items are four to eight words. Lesson steps are one instruction each — never two verbs in one line.

**What it never does.** No marketing superlatives, no "revolutionary", no urgency framing, no jargon. When a technical term is unavoidable it is immediately translated: "בינה מלאכותית (AI) בסיסי — היכרות ראשונה עם כלים כמו ChatGPT".

---

## Visual foundations

**Colour.** One dominant hue: navy `#0F2E52`. It is the header, the sidebar, the hero, the icon circles, and the print mark. Against it sits a single action blue `#006EE5` for anything clickable, with `#0055B2` on hover and `#003C80` pressed. Two pale blues — `#3D9AFF` and `#9CC7F5` — exist mainly to build the logo and to carry secondary text on navy. Semantic hues are green `#00A563` (done, money in), amber `#E1631B` (tips and warnings) and red `#BE0000` (overdue, destructive). WhatsApp actions always use the real brand green `#25D366` with dark-green ink. kunikHome adds seven fixed domain accents, each with its own pale surface. Backgrounds are near-white and cool: canvas `#F4F7FB`, cards pure white, fields `#F7F9FC`.

**Type.** Rubik for everything, weights 400–800; headings are always 800, labels 700, supporting copy 500–600. Heebo appears only for numerals — phone numbers, times, stat figures, sheet numbers — usually at 900 with negative tracking. Sizes carry half-pixels on purpose (13.5, 14.5, 15.5); do not round them to a scale. Task and instruction text never drops below 16px.

**Spacing.** Not a strict 4px grid. Real values in the source include 7, 9, 11, 13, 18, 22 and 26. Content maxes out at 1240px (business app), 1040px (toolkit) or 760px (marketing hub), with a `clamp(14px, 4vw, 24px)` gutter.

**Backgrounds.** Flat colour, with exactly one texture in the system: a white dot pattern at 22–26px spacing over the navy hero, at 5–14% opacity. There is one gradient, also navy: `radial-gradient(120% 130% at 85% 0%, #1B4C88, #0F2E52 60%, #0A2340)`, used on the flier and title slide. No gradients anywhere in product UI. No full-bleed photography.

**Cards.** White, `1px solid #E4EAF1`, radius 12–18px, and a shadow so faint it reads as depth rather than drop: `0 2px 8px rgba(15,46,82,.06)`. The shadow is navy-tinted, which is what keeps the greys cool. Print panels use `0 4px 6px rgba(0,0,0,.1)`; the floating home pill uses `0 4px 10px rgba(0,0,0,.22)`. There is no third elevation level.

**Borders.** Four hairlines, each with a job: `#E4EAF1` cards, `#DFE2E4` form fields (at 2px), `#F0F3F7` table rows, `#DDE3EB` section rules. Dashed `#C3D4E8` marks an empty list waiting to be filled.

**Radii.** 8px chips, 9–10px header controls and fields, 12px rows, 14px content cards, 16px print panels, 18px home cards, 20px modals, 999px pills, 50% avatars and the home pill. Nothing is square.

**Callouts.** One coloured-edge pattern exists: a tinted block with a 4px bar on the leading (right) edge — amber for tips, deeper amber for warnings, blue for information. This is the teaching voice made visible and is used nowhere else.

**Animation.** Almost none. A single 150ms `ease` on two things: cards that navigate lift by 3px into `0 14px 30px rgba(15,46,82,.14)`, and accordion chevrons rotate 180°. No bounces, no slide-ins, no skeletons, no page transitions.

**Hover and press.** Buttons darken (`#006EE5` → `#0055B2` → `#003C80`); they never lighten, never scale, never shrink on press. Cards lift. Nav items gain an 8%-white fill on navy. Links go from `#006EE5` to `#0055B2`.

**Transparency and blur.** No blur anywhere. Transparency appears only on navy: 7–8% white fills for header controls and selected rail items, 22% white borders, 12% white dividers. The modal scrim is `rgba(15,25,40,.45)` — tinted navy, not neutral black.

**Layout rules.** One fixed element: the 52px navy home pill, top-left (the trailing corner in RTL), hidden in print. Headers are sticky; the active tab is filled with the canvas colour and squared at the bottom so it merges into the page. Tables scroll horizontally inside their card with a sticky action column. Long tab strips fade at both ends with a linear-gradient mask.

**Imagery.** Exactly one image in the entire brand: Dana's portrait, cropped to a circle, 5px white ring, eyes positioned at 18% from the top. Warm, softly lit, neutral grey background. No stock photography, no illustration, no decorative graphics.

**Tap targets and readability.** 44px minimum for anything a person taps, 52px for the home pill, 46px form fields, 16px body text on instructional surfaces. The only exception is the 30px icon button inside dense data tables.

---

## Iconography

A single hand-authored line set, drawn on a 24×24 viewBox with `fill="none"`, `stroke="currentColor"`, round caps and round joins. There is no icon font, no sprite sheet, and no third-party library in the source — so the exact path data was copied out of the source markup into `assets/icons/` (39 files) and mirrored in the `Icon` component's path map. Nothing was substituted from a CDN.

Stroke weight varies by role and is deliberate: `1.6` for the pictorial device icons on the flier (smartphone, computer, video, sparkles), `1.8–1.9` for UI glyphs, `2.0–2.2` for checks, chevrons and the plus. Sizes in use: 13–15px inside buttons and table actions, 17–21px in list rows and nav, 24–26px in card tiles, 32–36px on slides.

One icon is filled rather than stroked: the WhatsApp glyph, which is always rendered in `#0A2E17` on `#25D366`.

Colour always comes from the parent via `currentColor`. Icons never carry their own hue.

**Emoji: never.** **Unicode as icons: once** — the `✓` in printed practice-sheet instructions, and the `+` character inside the "add option" button and the quick-action tiles, both of which are typographic rather than iconographic. **Illustration: none.**

## Intentional additions

- **`Icon`** — the source inlines every SVG by hand. A wrapper was added so consumers get the exact path data and stroke weights rather than re-drawing them. No new glyphs were invented.
- **`DateChip`, `ListRow`, `EmptyState`, `SyncStatus`, `SectionLabel`, `StatCard`, `LevelPill`, `Callout`** — these are not named components in the source, but each is a literal repeated markup pattern lifted verbatim from it. Nothing was added that has no counterpart in the source.
- **No `Toast`, `Avatar`, `Tabs`, `Tooltip`, `Modal` primitive.** The source has no toasts or tooltips; tabs live inside `AppHeader`; the one modal is the kunikHome record form, which lives in the UI kit.

---

## Index

| Path | What it is |
|---|---|
| `styles.css` | The single entry point consumers link. Imports only. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `motion.css` |
| `assets/` | `logo.svg` (app icon), `logo-bars.svg` (bare mark), `dana-portrait.png`, `fonts/Rubik.ttf`, `fonts/Heebo.ttf`, `icons/` (39 SVGs) |
| `components/` | The reusable primitives, grouped below |
| `guidelines/` | 18 foundation specimen cards (Colors, Type, Spacing, Brand) |
| `ui_kits/tech-eye-level/` | The teaching-business kit — see its `README.md` |
| `ui_kits/kunik-home/` | The family-admin kit — see its `README.md` |
| `slides/` | Seven 1280×720 slide templates built from the marketing deck |
| `SKILL.md` | Agent-skill wrapper for use outside this project (Claude Code etc.) |

### Components

**`components/brand/`** — `Logo`, `Icon`
**`components/core/`** — `Button`, `IconButton`, `Card`, `Badge`, `Callout`, `SectionLabel`, `StatCard`, `LevelPill`
**`components/forms/`** — `TextField`, `SelectField`, `Checkbox`
**`components/navigation/`** — `AppHeader`, `SidebarNav`, `HomeFab`
**`components/data/`** — `ListRow`, `DateChip`, `DataTable`, `DomainCard`
**`components/feedback/`** — `SyncStatus`, `EmptyState`

Each directory carries a `<Name>.jsx`, a `<Name>.d.ts` props contract, a `<Name>.prompt.md` usage note, and one `@dsCard` HTML showing its states.

## Caveats

- **Fonts.** `Rubik.ttf` and `Heebo.ttf` were shipped with the source and are used directly. They appear to be variable TTFs and are declared as `font-weight: 100 900`; if they turn out to be single-weight statics, the `@font-face` rules in `tokens/fonts.css` need splitting per weight.
- **No wordmark.** The source contains no logotype — only the three-bar mark and the brand name set in Rubik 800. None was invented.
- **Dark theme.** The source has none, so none was written.
