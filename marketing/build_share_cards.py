"""WhatsApp "postcards" for the brochures: a 1200x630 card image + a tiny link page with Open Graph tags per brochure.
Pasting https://myfamilycareclub.com/s/<slug>/ in WhatsApp shows the card; opening the link goes straight to the PDF.
Output: public/s/<slug>/{index.html,card.jpg}"""
import re, subprocess, pathlib, html, base64, io
import fitz
from PIL import Image
ROOT = pathlib.Path(__file__).parent
PUB = ROOT.parent / "public"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
FONTS = re.search(r'FONTS = """(.*?)"""', (ROOT / "build.py").read_text(encoding="utf-8"), re.S).group(1)
SITE = "https://myfamilycareclub.com"
e = html.escape
br = lambda t: e(t).replace("\n", "<br>")
flat = lambda t: e(t.replace("\n", " "))
FONTS = FONTS.replace("url(fonts/", f"url(file://{ROOT}/fonts/")  # the card pages live in a temp folder
b64 = lambda p: base64.b64encode(pathlib.Path(p).read_bytes()).decode()

# Customer-facing copy for the brochures; everything else gets its headline from the material's title.
DEFAULT_SUB = "מלווה אישית קבועה, בעלי מקצוע נבחרים וטיפול מלא מההזמנה ועד הסיום."
COPY = {
 "families-brochure": dict(slug="families", title="הורים בטוחים יותר, משפחה רגועה יותר",
      sub="מלווה אישית קבועה, הכול במקום אחד, והנטל יורד מהכתפיים.", desc="מי אנחנו, מה אנחנו עושים בשביל ההורים, איך מתחילים והמסלולים."),
 "abroad-brochure": dict(slug="abroad", title="אתם רחוקים.\nההורים בידיים טובות.",
      sub="מלווה קבועה לפי תכנית שבועית, מענה בכל שעה, ואתם יודעים תמיד מה שלום ההורים.", desc="הילדים בחו\"ל, ההורים בישראל: מלווה אישית קבועה, מענה לכל בקשה, ואתם יודעים תמיד מה שלומם."),
 "hr-brochure": dict(slug="hr", title="מתכננים רילוקיישן לעובדים שלכם?\nאנחנו נדאג להורים בישראל",
      sub="מלווה אישית קבועה להורי העובד, מענה בכל שעה ועדכון שקוף.", desc="Family Care דואגת להורים של עובדים שעוברים לחו\"ל: מלווה אישית קבועה, טיפול מלא בבית ובבירוקרטיה, ועדכון שקוף לעובד."),
 "seniors-brochure": dict(slug="seniors", title="אתם מחליטים, אנחנו דואגים לשאר",
      sub="מלווה אישית קבועה וטלפון אחד לכל דבר.", desc="מלווה אישית קבועה וטלפון אחד לכל דבר, באישור שלכם ובקצב שלכם."),
 "companions-brochure": dict(slug="companions", title="מלווים אישיים לגיל השלישי",
      sub="סטודנטים/יות ועובדים/ות סוציאליים/ות: שעות גמישות ושכר הוגן.", desc="הצטרפו כמלווים/ות אישיים/ות לבני הגיל השלישי ברמת השרון, הרצליה, צפון ת\"א ורעננה."),
 "companions-social-pdf": dict(title="מחפשים עבודה עם משמעות לצד הלימודים?", sub="מלווים אישיים לגיל השלישי: שעות גמישות, לקוחות קבועים ושכר הוגן.", desc="מלווים אישיים לגיל השלישי ברמת השרון, הרצליה, צפון ת\"א ורעננה."),
 "companions-social-png": dict(title="מחפשים עבודה עם משמעות לצד הלימודים?", sub="מלווים אישיים לגיל השלישי: שעות גמישות, לקוחות קבועים ושכר הוגן.", desc="מלווים אישיים לגיל השלישי ברמת השרון, הרצליה, צפון ת\"א ורעננה."),
}
COPY["families-brochure-en"] = dict(slug="families-en", en=True, title="Your parents are in good hands. You get peace of mind.",
      sub="A permanent personal companion, everything in one place, and the burden off your shoulders.", desc="Family Care is a private concierge club for older adults and their families.")
COPY["seniors-brochure-en"] = dict(slug="seniors-en", en=True, title="More time for what you love. We'll take care of the rest.",
      sub="A permanent personal companion and one phone number for everything.", desc="Family Care is a personal service club for older adults. You decide, we take care of it.")
SKIP = {"new-client-questionnaire", "site-link"}  # internal document, not for sharing

def headline(m):
    t = m["title"]
    q = re.search(r'"(.+)"\s*$', t)
    if q: return q.group(1).strip(), None
    mm = re.match(r"^(תחום \d+|תמונה ארוכה|טיפ)\s*:\s*(.+)$", t)
    if mm: return mm.group(2).strip(), ("טיפ" if mm.group(1) == "טיפ" else "תחום שירות" if mm.group(1).startswith("תחום") else None)
    return t, None

def spec(m):
    c = COPY.get(m["id"])
    if c: return dict(slug=c.get("slug", m["id"]), title=c["title"], sub=c["sub"], desc=c["desc"], tag=None, en=c.get("en", False))
    h, tag = headline(m)
    return dict(slug=m["id"], title=h, sub=DEFAULT_SUB, desc=DEFAULT_SUB, tag=tag, en=False)

CSS = FONTS + """
@page{margin:0} html,body{margin:0}
.c{position:relative;width:1200px;height:630px;overflow:hidden;color:#fff;font-family:Rubik,sans-serif;direction:rtl;
 background:radial-gradient(760px 520px at 88% -12%,rgba(43,196,188,.40),transparent 62%),linear-gradient(165deg,var(--deep),var(--header) 58%,#14625E)}
.o1{position:absolute;width:520px;height:520px;border-radius:50%;left:-120px;bottom:-200px;background:radial-gradient(circle at 40% 40%,rgba(43,196,188,.45),rgba(43,196,188,0) 70%)}
.o2{position:absolute;width:300px;height:300px;border-radius:50%;left:330px;top:-110px;background:radial-gradient(circle at 50% 50%,rgba(159,214,210,.28),rgba(159,214,210,0) 70%)}
.t{position:absolute;inset:0 0 0 auto;width:600px;padding:58px 60px 52px 0;display:flex;flex-direction:column}
.t img.lg{height:62px;align-self:flex-start;margin-bottom:auto}
.tag{align-self:flex-start;padding:10px 24px;border-radius:999px;background:rgba(43,196,188,.18);border:1.5px solid rgba(43,196,188,.55);color:#BFF0EC;font-size:25px;font-weight:500;margin-bottom:22px}
h1{margin:0;font-weight:500;font-size:56px;line-height:1.16;letter-spacing:-.01em}
.sub{margin-top:20px;font-size:26px;line-height:1.5;color:#CFECEA;max-width:540px}
.site{margin-top:30px;font-size:25px;color:var(--bright);direction:ltr;text-align:right;font-weight:500}
.paper{position:absolute;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 36px 70px rgba(2,22,21,.55);transform:rotate(-5deg)}
.c.en{direction:ltr}
.c.en .t{inset:0 auto 0 0;padding:58px 0 52px 64px}
.c.en .t img.lg,.c.en .tag{align-self:flex-start}
.c.en .site{text-align:left}
.c.en .paper{left:auto!important;right:60px}
.c.en .paper.b{right:178px}
.c.en h1{font-size:50px}
.c.en .o1{left:auto;right:-120px}
.c.en .o2{left:auto;right:330px}
.paper img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
.paper.b{transform:rotate(4deg);opacity:.96;margin-top:36px}
"""

def page_png(pdf, n):
    d = fitz.open(PUB / "materials" / pdf)
    n = min(n, len(d) - 1)
    pix = d[n].get_pixmap(matrix=fitz.Matrix(1.6, 1.6))
    return base64.b64encode(pix.tobytes("png")).decode(), pix.width, pix.height

def img_b64(path):
    im = Image.open(PUB / "materials" / path).convert("RGB")
    w, h = im.size
    im.thumbnail((700, 1500))
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode(), w, h

def paper(src, mime, w, h, maxh=500, width=300, left=60, cls=""):
    pw = min(width, maxh * w / h) if h * width / w > maxh else width
    ph = min(maxh, pw * h / w)
    top = (630 - ph) / 2
    return f'<div class="paper {cls}" style="left:{left}px;top:{top:.0f}px;width:{pw:.0f}px;height:{ph:.0f}px"><img src="data:{mime};base64,{src}"></div>'

def papers(m):
    if m["kind"] == "PDF":
        d = fitz.open(PUB / "materials" / m["file"])
        b, w, h = page_png(m["file"], 0)
        front = paper(b, "image/png", w, h)
        if len(d) > 1:
            b2, w2, h2 = page_png(m["file"], 1)
            return paper(b2, "image/png", w2, h2, left=178, cls="b") + front
        return paper(b, "image/png", w, h, width=330, left=90)
    b, w, h = img_b64(m["file"])
    return paper(b, "image/jpeg", w, h, width=360, left=90)

def card_html(m, c):
    logo = b64(PUB / "brand" / "logo-white.png")
    tag = f'<span class="tag">{e(c["tag"])}</span>' if c["tag"] else ""
    return f'''<!doctype html><html lang="{"en" if c["en"] else "he"}" dir="{"ltr" if c["en"] else "rtl"}"><meta charset="utf-8"><style>{CSS}</style>
<div class="c{" en" if c["en"] else ""}"><div class="o1"></div><div class="o2"></div>
{papers(m)}
<div class="t"><img class="lg" src="data:image/png;base64,{logo}" alt="">
{tag}<h1>{br(c["title"])}</h1><p class="sub">{e(c["sub"])}</p>
<div class="site">myfamilycareclub.com</div></div></div></html>'''

def share_page(c, v):
    url = f"{SITE}/s/{c['slug']}/"
    img = f"{url}card.jpg?v={v}"
    title = f"Family Care | {c['title']}"
    return f'''<!doctype html>
<html lang="{"en" if c["en"] else "he"}" dir="{"ltr" if c["en"] else "rtl"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{flat(title)}</title>
<meta name="description" content="{e(c["desc"])}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Family Care">
<meta property="og:locale" content="he_IL">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{flat(c["title"])}">
<meta property="og:description" content="{e(c["desc"])}">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0;url=/materials/{c["file"]}">
<style>body{{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#0E4F4C;color:#fff;text-align:center}}a{{color:#fff;background:#16A5A0;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600}}</style>
</head>
<body><main><p>{flat(c["title"])}</p><p><a href="/materials/{c["file"]}">פתיחת הברושור</a></p></main></body>
</html>
'''

V = "8"
import json
MATS = json.loads((ROOT / "materials.json").read_text(encoding="utf-8"))
tmp = ROOT / "_share"; tmp.mkdir(exist_ok=True)
for m in MATS:
    if m["id"] in SKIP: continue
    c = spec(m); c["file"] = m["file"]
    out = PUB / "s" / c["slug"]; out.mkdir(parents=True, exist_ok=True)
    h = tmp / f'{c["slug"]}.html'; h.write_text(card_html(m, c), encoding="utf-8")
    png = tmp / f'{c["slug"]}.png'
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--window-size=1200,630",
                    f"--screenshot={png}", f"file://{h}"], check=True, capture_output=True)
    Image.open(png).convert("RGB").save(out / "card.jpg", quality=84, optimize=True)
    (out / "index.html").write_text(share_page(c, V), encoding="utf-8")
    print(c["slug"], (out / "card.jpg").stat().st_size // 1024, "KB")
