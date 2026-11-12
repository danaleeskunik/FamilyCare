"""Companion interview form (A4). Two outputs from one source:
 companion-interview.pdf  - blank, for printing
 companion-interview-fillable.html - same form with typeable fields (open in a browser, fill in, Cmd+P to save as PDF)."""
import re, subprocess, pathlib, html
ROOT = pathlib.Path(__file__).parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTS = re.search(r'FONTS = """(.*?)"""', (ROOT / "build.py").read_text(encoding="utf-8"), re.S).group(1)
e = html.escape
FILL = False
_n = 0

def nid():
    global _n; _n += 1; return f"x{_n}"
def line(label, tall=1):
    inner = f'<textarea rows="{tall}"></textarea>' if FILL else f'<div class="ln" style="height:{tall * 7}mm"></div>'
    return f'<div class="f"><label>{e(label)}</label>{inner}</div>'
def pair(a, b): return f'<div class="pair">{a}{b}</div>'
def boxes(opts, col=False, name=None):
    name = name or nid()
    box = (lambda o: f'<label class="o"><input type="checkbox">{e(o)}</label>') if FILL else (lambda o: f'<span><i></i>{e(o)}</span>')
    return f'<div class="boxes{" col" if col else ""}">' + "".join(box(o) for o in opts) + "</div>"
def opts(label, o, col=False): return f'<div class="f"><label>{e(label)}</label>{boxes(o, col)}</div>'
def q(label, tall=3): return line(label, tall)
def section(title, *items): return f'<section><h3>{e(title)}</h3>{"".join(items)}</section>'
def rate(label):
    name = nid()
    if FILL:
        dots = "".join(f'<label class="o r"><input type="radio" name="{name}">{i}</label>' for i in range(1, 6))
    else:
        dots = "".join(f'<span class="r"><i></i>{i}</span>' for i in range(1, 6))
    return f'<div class="rate"><span class="rl">{e(label)}</span><span class="rd">{dots}</span></div>'

def build():
    global _n; _n = 0
    guide = ["לשאול את אותן שאלות את כל המועמדים/ות — כך אפשר להשוות ביניהם.",
             "לא שואלים על גיל, מצב משפחתי, הריון, בריאות או דת. שואלים על ניסיון, זמינות והתאמה לתפקיד.",
             "בשאלות המצבים: מבקשים דוגמה אמיתית מהעבר, ולא \"מה היית עושה\" באופן כללי.",
             "לרשום בקצרה את מה שנאמר, ולהעריך בסוף הטופס מיד אחרי הראיון."]
    g = "".join(f"<li>{e(x)}</li>" for x in guide)
    top = f'<h1>טופס ראיון למלווה/ת</h1><div class="guide"><b>הנחיות למראיין/ת</b><ul>{g}</ul></div>'
    s1 = section("פרטים כלליים",
        pair(line("שם מלא"), line("תאריך הראיון")),
        pair(line("טלפון"), line("דוא\"ל")),
        pair(line("עיר מגורים"), line("שם המראיין/ת")),
        line("איך הגיע/ה אלינו (המלצה, מודעה, רשתות...)"),
        q("תחביבים", 2),
        q("האם את/ה אדם שירותי?", 2),
        q("הערות כלליות", 3))
    s2 = section("רקע מקצועי",
        opts("הכשרה / מקצוע / לימודים", ["עובד/ת סוציאלי/ת", "פסיכולוגיה", "ריפוי בעיסוק", "סיעוד / אחות", "פיזיותרפיה", "סיוע סיעודי / מטפל/ת", "סטודנט/ית", "אחר"]),
        line("פרטי ההכשרה (מוסד, שנת סיום)", 1),
        q("ניסיון בעבודה עם בני 65+ — איפה, כמה זמן, באיזה תפקיד?"),
        q("עבודה אחרונה, ומה הסיבה לעזיבה / לחיפוש תפקיד חדש?", 2),
        line("שירות צבאי"),
        q("פירוט שירות צבאי (תפקיד, יחידה, משך, ומה לקחת ממנו)", 2),
        q("האם את/ה יכול/ה לנהל שיחה על חדשות / פוליטיקה / תרבות?", 2),
        q("האם את/ה יכול/ה להסיע ברכב לקוח לבית קפה / הצגה / קניות?", 2),
        q("האם את/ה יודע/ת לסדר מקרר?", 2),
        q("האם את/ה יודע/ת להזמין תור בקופת חולים? בעירייה?", 2),
        opts("ניסיון ספציפי", ["דמנציה / אלצהיימר", "ליווי לבדיקות ולרופאים", "אחרי ניתוח / שיקום", "עבודה מול משפחות", "עבודה עצמאית (חשבונית)"]))
    s3 = section("זמינות ותנאים",
        q("ימים ושעות שבהם זמין/ה (קבוע / גמיש)", 2),
        pair(line("אזורים נוחים (רמת השרון, הרצליה, תל אביב, רעננה...)"), line("תאריך התחלה אפשרי")),
        pair(opts("רכב ורישיון נהיגה", ["יש רכב", "יש רישיון, בלי רכב", "אין"]), opts("מעמד העסקה מועדף", ["עצמאי/ת (חשבונית)", "שכיר/ה", "פתוח/ה לשניהם"])),
        line("היקף משוער (שעות בשבוע) וציפיות שכר"),
        line("אילוצים או התחייבויות שחשוב שנדע עליהם", 1))
    s4 = section("שאלות מצבים (לבקש דוגמה מהעבר)",
        q("למה ליווי של קשישים? מה מושך אותך בתפקיד, ומה קשה לך בו?"),
        q("מתי טיפלת במישהו שהתנגד, כעס או סירב לשתף פעולה? מה עשית?"),
        q("הלקוח/ה נופל/ת או מרגיש/ה רע באמצע הפגישה. מה עושים, ובאיזה סדר?"),
        q("לקוח/ה מבקש/ת שתיקח כסף או תשלם במקומו, תתן תרופה או תעשה משהו מחוץ לתפקיד. איך מגיבים?"),
        q("בן/בת משפחה מתערב/ת, מבקר/ת או לא מרוצה מהליווי. איך מתמודדים?"),
        q("לקוח/ה מתבודד/ת, לא רוצה לצאת מהבית ולא רוצה פעילות. איך יוצרים קשר?"),
        q("מה המשמעות של דיסקרטיות בתפקיד הזה? תנו דוגמה."),
        q("אחרי כל פגישה צריך לתעד אותה באפליקציה (הערות, שעות, הוצאות). עד כמה נוח לך עם זה? באיזה מכשיר?", 2))
    s5 = section("שפות ותקשורת",
        opts("שפות", ["עברית", "אנגלית", "רוסית", "ספרדית", "צרפתית", "אחר"]),
        line("שפה אחרת (לפרט)"),
        opts("סמארטפון ואפליקציות", ["נוח/ה עם סמארטפון", "WhatsApp", "ניווט (Waze / מפות)", "זקוק/ה להדרכה"]))
    s6 = section("ממליצים ומסמכים",
        pair(line("ממליץ/ה 1 (שם, תפקיד, טלפון)"), line("ממליץ/ה 2 (שם, תפקיד, טלפון)")),
        opts("מסמכים שנדרשים להמשך", ["קורות חיים", "תעודות והכשרות", "אישור יושר / תעודת יושר", "תעודת זהות ורישיון נהיגה", "טופס 101 (שכיר/ה)", "אישורי עצמאי/ת (עוסק)"]))
    s7 = ('<section class="eval"><h3>הערכת המראיין/ת (למלא אחרי הראיון)</h3>'
        '<div class="scale">1 = חלש מאוד · 5 = מצוין</div>'
        + rate("חום ואמפתיה") + rate("ניסיון ומקצועיות") + rate("אמינות ואחריות") + rate("תקשורת ויכולת הקשבה") + rate("גמישות וזמינות") + rate("התאמה לערכי Family Care")
        + q("נקודות חוזק", 2) + q("חששות / נקודות לבירור", 2)
        + opts("המלצה", ["מתאים/ה — להמשיך", "מתאים/ה בהסתייגות", "לא מתאים/ה", "ראיון נוסף / שיחה עם ממליצים"])
        + q("הצעד הבא ומי אחראי עליו", 2) + '</section>')
    return f'<div class="top"><img src="logo-dark.png" alt="Family Care"></div>{top}{s1}{s2}{s3}{s4}{s5}{s6}{s7}'

CSS = f"""{FONTS}
@page{{size:A4;margin:13mm 16mm 17mm}}
html,body{{width:178mm}}
body{{margin:0}}
.f,.rate{{break-inside:avoid}} h2,h3{{break-after:avoid}} section{{break-inside:auto}}
.top img{{height:14mm;display:block}}
h1{{margin:7mm 0 4mm;padding-bottom:3mm;border-bottom:.7mm solid var(--action);font-size:21pt;font-weight:500;color:var(--header)}}
section{{margin-top:4.5mm}}
h3{{font-size:11.5pt;font-weight:500;color:var(--link);padding-bottom:1.2mm;border-bottom:.3mm solid #CFE5E3;margin-bottom:1.5mm}}
.guide{{padding:3.5mm 5mm;border-radius:3mm;background:var(--tint);font-size:8.8pt;line-height:1.5}} .guide b{{color:var(--header);font-weight:500;font-size:10pt}}
.guide ul{{margin:1mm 0 0;padding-inline-start:4.5mm}}
.f{{margin-top:2mm}} .f>label{{display:block;font-size:9.4pt;line-height:1.4;color:var(--ink)}}
.ln{{background:repeating-linear-gradient(to bottom,transparent 0,transparent 6.7mm,#B5C0CA 6.7mm,#B5C0CA 7mm)}}
textarea{{display:block;width:100%;box-sizing:border-box;border:0;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 6.7mm,#B5C0CA 6.7mm,#B5C0CA 7mm);background-attachment:local;font:inherit;font-size:10pt;line-height:7mm;padding:0;resize:vertical;outline:none;direction:rtl}}
textarea:focus{{background:#F3FAF9}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:0 7mm}}
.boxes{{display:flex;flex-wrap:wrap;gap:1.5mm 7mm;margin-top:1.5mm;font-size:9.4pt}} .boxes.col{{flex-direction:column;gap:1.3mm}}
.boxes span{{display:flex;align-items:flex-start;gap:2mm;line-height:1.35}}
.boxes i,.r i{{flex:none;width:3.8mm;height:3.8mm;margin-top:.3mm;border:.35mm solid var(--ink2);border-radius:1mm;display:block}}
.o{{display:flex;align-items:center;gap:2mm;line-height:1.35;cursor:pointer}} .o input{{margin:0;width:4mm;height:4mm;accent-color:var(--action)}}
.scale{{font-size:8.6pt;color:var(--ink2);margin:1mm 0 1mm}}
.rate{{display:flex;justify-content:space-between;align-items:center;padding:1.2mm 0;border-bottom:.2mm solid #E3ECEB;font-size:9.6pt}}
.rd{{display:flex;gap:6mm}} .r{{display:flex;align-items:center;gap:1.5mm}} .rd span.r i{{border-radius:50%;margin-top:0}}
.fillbar{{position:sticky;top:0;background:#FFF8E1;padding:2mm 4mm;font-size:10pt;text-align:center;margin:0 -2mm 2mm}}
@media print{{.fillbar{{display:none}}}}
"""
def page(body, bar=""):
    return f'<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>Family Care | טופס ראיון למלווה/ת</title><style>{CSS}</style></head><body>{bar}{body}</body></html>'

(ROOT / "companion-interview.html").write_text(page(build()), encoding="utf-8")
FILL = True
(ROOT / "companion-interview-fillable.html").write_text(page(build(), '<div class="fillbar">למלא כאן במחשב, ואז Cmd+P ← "שמירה כ-PDF" (השדות לא נשמרים אם סוגרים את הדף)</div>'), encoding="utf-8")
base = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=4000", "--no-pdf-header-footer"]
subprocess.run([CHROME, *base, f"--print-to-pdf={ROOT/'companion-interview.pdf'}", f"file://{ROOT/'companion-interview.html'}"], check=True, capture_output=True)
import fitz
d = fitz.open(ROOT / "companion-interview.pdf"); print("pages:", len(d))
for i, p in enumerate(d, 1): p.get_pixmap(dpi=70).save(ROOT / f"_ci{i}.png")
