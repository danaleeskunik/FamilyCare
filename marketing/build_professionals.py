"""Variants of the companion-recruitment brochure + social card for social workers and therapists (built from build.py's templates)."""
import pathlib, subprocess
ROOT = pathlib.Path(__file__).parent
src = (ROOT / "build.py").read_text(encoding="utf-8")
exec(src.split('(ROOT/"companions-brochure.html")')[0])  # defines BROCHURE, SOCIAL, CHROME, ...

base = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=4000", "--no-pdf-header-footer"]
PRO_LINE = "הרקע המקצועי שלכם מאפשר ליווי מדויק יותר: הקשבה, זיהוי צרכים ושיתוף המשפחה."
VARIANTS = {
  "social-workers": dict(
    who="עובדים/ות סוציאליים/ות",
    h1="עובדים/ות סוציאליים/ות: ליווי אישי של לקוחות קבועים",
    pref="ניסיון בעבודה סוציאלית, עם אוכלוסייה מבוגרת ועם משפחות, יתרון",
    card_h1="עובדים/ות סוציאליים/ות? <em>ליווי אישי</em> של לקוחות קבועים",
  ),
  "therapists": dict(
    who="מטפלים/ות",
    h1="מטפלים/ות? ליווי אישי של לקוחות קבועים, לצד העבודה שלכם",
    pref="רקע טיפולי (ריפוי בעיסוק, פסיכותרפיה, טיפול באמנויות, פיזיותרפיה ועוד), יתרון",
    card_h1="מטפלים/ות? <em>ליווי אישי</em> של לקוחות קבועים",
  ),
}

def swap(s, old, new):
    assert s.count(old) == 1, old
    return s.replace(old, new)

for key, v in VARIANTS.items():
    b = BROCHURE
    b = swap(b, "<title>Family Care | מגייסים מלווים</title>", f"<title>Family Care | מגייסים מלווים, {v['who']}</title>")
    b = swap(b, "מחפשים עבודה שיש בה משמעות לצד הלימודים?", v["h1"])
    b = swap(b, "מחפשת אנשים רגישים ואחראים", "מחפשת אנשי מקצוע רגישים ואחראים")
    b = swap(b, "ולא עוד משמרת אקראית.</p>", f"ולא עוד משמרת אקראית. {PRO_LINE}</p>")
    b = swap(b, "עדיפות לסטודנטים/יות לעבודה סוציאלית, פסיכולוגיה, מדעי החברה וסיעוד", v["pref"])
    b = swap(b, "מתאימות ללוח הלימודים ולמבחנים", "מתאימות לצד משרה או עבודה קיימת")
    b = swap(b, "קרוב לבית ולקמפוס, באזור המרכז", "קרוב לבית, באזור המרכז")
    s = SOCIAL
    s = swap(s, "<title>Family Care | מגייסים מלווים</title>", f"<title>Family Care | מגייסים מלווים, {v['who']}</title>")
    s = swap(s, "סטודנטים/יות? <em>עבודה עם משמעות</em> לצד הלימודים", v["card_h1"])
    (ROOT / f"companions-brochure-{key}.html").write_text(b, encoding="utf-8")
    (ROOT / f"companions-social-{key}.html").write_text(s, encoding="utf-8")
    for kind in ("brochure", "social"):
        html = ROOT / f"companions-{kind}-{key}.html"
        subprocess.run([CHROME, *base, f"--print-to-pdf={html.with_suffix('.pdf')}", f"file://{html}"], check=True, capture_output=True)
    subprocess.run([CHROME, *base, "--window-size=1080,1350", f"--screenshot={ROOT/f'companions-social-{key}.png'}", f"file://{ROOT/f'companions-social-{key}.html'}"], check=True, capture_output=True)
    import fitz
    d = fitz.open(ROOT / f"companions-brochure-{key}.pdf"); print(key, "pdf pages:", len(d))
    d[0].get_pixmap(dpi=70).save(ROOT / f"_pro-{key}.png")
