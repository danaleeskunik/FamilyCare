"""Brochure for HR / relocation teams in companies (2 x A4): employees moving abroad, parents staying in Israel. Reuses the illustration, fonts and WhatsApp icon from build.py."""
import re, subprocess, pathlib
ROOT = pathlib.Path(__file__).parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
src = (ROOT / "build.py").read_text(encoding="utf-8")
def block(name):
    m = re.search(name + r' = """(.*?)"""', src, re.S); return m.group(1)
ILLUSTRATION, WA_ICON, FONTS = block("ILLUSTRATION"), block("WA_ICON"), block("FONTS")

def icon(path, size=26, sw=1.9): return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"><path d="{path}"/></svg>'
P = {
 "home": "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
 "tools": "M14.5 6.5a4 4 0 0 0-5 5L3.5 17.5a1.8 1.8 0 0 0 2.6 2.6l6-6a4 4 0 0 0 5-5l-2.6 2.6-2.4-.6-.6-2.4z",
 "medical": "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 8v8M8 12h8",
 "phone": "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2",
 "music": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
 "legal": "M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zM19 7l-2.5 6a3 3 0 0 0 5 0L19 7z",
 "shield": "M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5 4.5-5",
 "lock": "M6 11h12v9H6zM8.500 11V8a3.500 3.500 0 0 1 7 0v3",
 "call": "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
 "check": "M4 12.5l5 5L20 6.5",
 "arrow": "M19 12H5M11 6l-6 6 6 6",
}
CHECK = icon(P["check"], 20, 2.4)

WHY = [
 ("עובד רגוע, ממוקד בעבודה", "העובד יודע שמישהו אמין נמצא עם ההורים, ויכול להתמקד במעבר ובתפקיד החדש."),
 ("כתובת אחת במקום עשרות ספקים", "טלפון אחד לכל צורך: רופא, תיקון בבית, סידורים ובירוקרטיה. העובד לא צריך לארגן מרחוק."),
 ("מישהו שם, תמיד", "מלווה אישית קבועה שמכירה את ההורים, ביקורים לפי המסלול, ונוכחות אנושית וחמה בבית."),
 ("שקיפות מלאה לעובד", "סיכום כתוב אחרי כל ביקור, משוב בסיום כל שירות, וחשבון מפורט."),
 ("מענה וזמינות", "טלפון אחד, בשיחה, בוואטסאפ או במייל. מענה בשעות הפעילות, וזמינות 24/7 בחירום."),
 ("ההורים לא לבד", "חברה, בילוי וזמן איכות שמפחיתים בדידות, והדרכה בטכנולוגיה כדי שהקשר עם העובד יישאר קרוב."),
]
SERVICES = [
 ("home", "ניהול משק הבית", "תרופות ומזון, רכב, כביסה, יומן ותזכורות, קניות, תשלומים ובירוקרטיה מול בנק, קופת חולים, ביטוח לאומי ועוד."),
 ("tools", "אחזקת הבית", "רשת בעלי מקצוע שעברו את אישורנו. אנחנו מתאמים, מלווים את העבודה ודואגים למחיר הוגן, לאיכות ולניקיון."),
 ("medical", "תיאום רפואי", "ליווי לרופא או לבית חולים, ותיאום ביקורי בית של אנשי מקצוע."),
 ("phone", "דיגיטל וטכנולוגיה", "טלפון, טלוויזיה, אינטרנט, מחשב ואפליקציות. מגיעים מיד, מתקנים ומדריכים באדיבות."),
 ("music", "תרבות ופנאי", "בית קפה, קונצרט, מוזיאון, טיול ואירועים משפחתיים. מתאמים הכול ומלווים מההתחלה ועד הסוף."),
 ("legal", "בירוקרטיה ומשפטים", "תיאום מול עורכי דין: ייפוי כוח, צוואות, זכויות."),
]
STEPS = [
 ("שיחה ראשונה", "מדברים עם אלון, גם מרחוק, ומספרים על העובד ועל ההורים."),
 ("היכרות בבית ההורים", "נציג מטעמנו מגיע, מקשיב ופותח תיק אישי."),
 ("התאמת מסלול", "מגדירים את בסיס תכולת הפגישות."),
 ("היכרות עם המלווה", "פגישת הכרות והתאמה עם המלווה מהצוות."),
 ("תכנון משותף ביומן", "מתכננים יחד פעילויות ואירועים."),
 ("נהנים משקט", "מקבלים עדכונים, ומדייקים את השירות לאורך הזמן."),
]
FLOW = [
 ("הודעה", "העובד או ההורים שולחים הודעה בוואטסאפ, מתקשרים או כותבים במייל. מענה בשעות הפעילות, ובחירום 24/7."),
 ("טיפול", "אנחנו מדברים עם בעלי המקצוע, דואגים למחיר משתלם ומלווים את העבודה בבית."),
 ("תשלום", "אנחנו מאשרים מול העובד את עלות התיקון לפני הביצוע. בסיום הוא משלם לנו מרחוק, ואנחנו מעבירים לבעל המקצוע."),
 ("עדכון", "העובד מקבל סיכום ביצוע, ובית נקי. דו\"ח סיכום באפליקציה."),
]
PLANS = [
 ("Business", "2,950", ["4 פגישות בחודש", "2 שעות לפגישה", "זמינים בחירום 24/7"], False),
 ("Platinum", "8,350", ["8 פגישות בחודש", "3 שעות לפגישה", "יומן משפחה חלקי, בפגישות", "זמינים בחירום 24/7", "בימי שישי: פרחים, עיתון או חלה"], True),
 ("Top Platinum", "15,950", ["12 פגישות בחודש", "4 שעות לפגישה", "יומן משפחה ברמה יומית", "זמינים בחירום 24/7", "בימי שישי: פרחים, עיתון או חלה"], False),
]

why_html = "".join(f'<li>{CHECK}<div><b>{t}</b><span>{d}</span></div></li>' for t, d in WHY)
svc_html = "".join(f'<div class="svc"><i>{icon(P[i])}</i><b>{t}</b><span>{d}</span></div>' for i, t, d in SERVICES)
steps_html = "".join(f'<div class="step"><em>{n}</em><div><b>{t}</b><span>{d}</span></div></div>' for n, (t, d) in enumerate(STEPS, 1))
flow_html = "".join(f'<div class="flow"><b>{t}</b><span>{d}</span></div>' for t, d in FLOW)
plans_html = "".join(
  f'<div class="plan{" feat" if f else ""}"><h4>{n}</h4><div class="price"></div><ul>' + "".join(f"<li>{CHECK}<span>{x}</span></li>" for x in items) + "</ul></div>"
  for n, p, items, f in PLANS)

HTML = f"""<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>Family Care | רילוקיישן לעובדים</title>
<style>{FONTS}
@page{{size:A4;margin:0}}
html,body{{width:210mm}}
.page{{position:relative;width:210mm;height:297mm;overflow:hidden;background:#fff;page-break-after:always;break-after:page}}
.page:last-child{{page-break-after:auto;break-after:auto}}
.hero{{position:relative;height:104mm;background:radial-gradient(520px 300px at 85% -10%,rgba(43,196,188,.35),transparent 62%),linear-gradient(165deg,var(--deep),var(--header) 60%,#14625E);color:#fff;padding:12mm 14mm 0}}
.logo{{height:15mm;display:block}} .hero>a{{display:inline-block}}
h1{{margin-top:11mm;font-size:23pt;line-height:1.14;font-weight:500;letter-spacing:-.01em;max-width:104mm}}
.sub{{margin-top:4mm;max-width:104mm;color:#CFECEA;font-size:11.5pt;line-height:1.6}}
.art{{position:absolute;left:4mm;top:12mm;width:86mm}}
.sec{{padding:0 14mm}}
h2{{font-size:14.5pt;font-weight:500;color:var(--link);margin-bottom:3mm}}
.why{{margin-top:9mm}}
.why ul{{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4mm 8mm;align-items:start}}
.why li{{display:flex;gap:2.5mm;align-items:flex-start}}
.why li svg{{flex:none;color:var(--action);margin-top:.4mm}}
.why b,.step b,.flow b,.svc b{{display:block;font-weight:500}}
.why b{{font-size:11pt}} .why span{{display:block;margin-top:.6mm;font-size:9.5pt;line-height:1.5;color:var(--ink2)}}
.what{{margin-top:7mm}}
.svcs{{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}}
.svc{{padding:4mm;border-radius:4mm;background:var(--tint);color:var(--header)}}
.svc i{{display:block;color:var(--link)}}
.svc b{{margin-top:1.8mm;font-size:11pt}} .svc span{{display:block;margin-top:1mm;font-size:9pt;line-height:1.5;color:var(--ink2)}}
.foot{{position:absolute;inset-inline:14mm;bottom:7mm;display:flex;justify-content:space-between;font-size:8.5pt;color:var(--ink2)}}
.foot a{{color:inherit}}
.top2{{padding:10mm 14mm 0}}
.top2 .row{{display:flex;justify-content:space-between;align-items:center}}
.top2 .logo2{{height:11mm;filter:none}}
.steps{{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm 5mm}}
.step{{display:flex;gap:3mm;align-items:flex-start}}
.step em{{flex:none;width:8.5mm;height:8.5mm;border-radius:50%;background:var(--header);color:#fff;font:500 12pt/8.5mm Rubik,sans-serif;text-align:center;font-style:normal;box-shadow:0 0 0 1.5mm var(--tint)}}
.step b{{font-size:10.5pt}} .step span{{display:block;margin-top:.5mm;font-size:9pt;line-height:1.45;color:var(--ink2)}}
.blk{{margin-top:6mm}}
.flows{{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}}
.flow{{position:relative;padding:3.6mm;border-radius:3.5mm;border:1px solid #BFE3DF;background:#fff}}
.flow b{{font-size:10.5pt;color:var(--link)}} .flow span{{display:block;margin-top:1mm;font-size:9pt;line-height:1.5;color:var(--ink)}}
.two{{display:grid;grid-template-columns:1fr 1.6fr;gap:5mm}}
.card{{padding:4.5mm;border-radius:4mm;background:var(--tint)}}
.card h3{{display:flex;align-items:center;gap:2mm;font-size:11.5pt;font-weight:500;color:var(--header);margin-bottom:1.8mm}}
.card h3 svg{{color:var(--link)}}
.card p{{font-size:9.3pt;line-height:1.6;color:var(--ink)}}
.card .pr{{margin-top:1.8mm}} .card .pr strong{{display:block;font-weight:500;color:var(--link);font-size:9.5pt}}
.plans{{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}}
.plan{{padding:4.5mm;border-radius:4mm;border:1px solid #BFE3DF;background:#fff}}
.plan h4{{font-size:12.5pt;font-weight:500;direction:ltr;text-align:start;color:var(--header)}}
.price{{margin:1.5mm 0 2.5mm;padding-bottom:2.5mm;border-bottom:1px solid #D9ECEA;font-size:11pt;color:var(--ink2)}}
.price strong{{font-size:21pt;font-weight:500;color:var(--ink);letter-spacing:-.02em}} .price small{{font-size:9pt}}
.plan ul{{list-style:none;padding:0;display:flex;flex-direction:column;gap:1.5mm}}
.plan li{{display:flex;gap:2mm;font-size:9.3pt;line-height:1.4}} .plan li svg{{flex:none;width:15px;height:15px;color:var(--action);margin-top:.3mm}}
.plan.feat{{background:linear-gradient(170deg,var(--deep),var(--header));border-color:transparent;color:#fff}}
.plan.feat h4,.plan.feat .price strong{{color:#fff}} .plan.feat .price{{color:#CFECEA;border-color:rgba(255,255,255,.2)}} .plan.feat li svg{{color:var(--bright)}}
.note{{margin-top:2.5mm;font-size:9pt;color:var(--ink2);text-align:center}}
.cta{{position:absolute;inset-inline:0;bottom:0;height:37mm;padding:5mm 14mm;background:linear-gradient(170deg,var(--header),var(--deep));color:#fff;display:flex;align-items:center;justify-content:space-between;gap:8mm}}
.cta h3{{font-size:16pt;font-weight:500}}
.cta .who{{margin-top:1.5mm;display:flex;align-items:center;gap:7mm;font-size:17pt;font-weight:500;color:var(--bright)}} .cta .who bdi{{direction:ltr;letter-spacing:.02em}}
.cta p{{margin-top:1.5mm;font-size:10pt;color:#CFECEA}} .cta a{{color:inherit}}
.wa{{flex:none;text-align:center;font-size:9.5pt;color:#CFECEA}} .wa a{{text-decoration:none;display:block}}
.wa div{{width:21mm;height:21mm;margin:0 auto 1.8mm;filter:drop-shadow(0 1.5mm 3mm rgba(0,0,0,.25))}} .wa svg{{width:100%;height:100%;display:block}}
</style></head><body>

<div class="page">
 <div class="hero">
  <a href="https://myfamilycareclub.com" aria-label="Family Care, לאתר החברה"><img class="logo" src="logo-white.png" alt="Family Care"></a>
  <h1>מתכננים רילוקיישן<br>לעובדים שלכם?<br><span style="color:var(--bright)">אנחנו נדאג להורים בישראל</span></h1>
  <p class="sub">עובד שעובר לחו"ל משאיר מאחור הורים בישראל. Family Care נמצאת איתם לפי תוכנית פגישות שבועיות: מלווה אישית קבועה, מענה לכל בקשה ועדכון שקוף לעובד. כך הוא יכול להתמקד בעבודה ובמעבר.</p>
  <div class="art">{ILLUSTRATION}</div>
 </div>
 <section class="sec why"><h2>מה מקבלים העובד והארגון</h2><ul>{why_html}</ul></section>
 <section class="sec what"><h2>מה אנחנו עושים בשביל ההורים בישראל</h2><div class="svcs">{svc_html}</div></section>
 <div class="foot"><span>Family Care · always with you · טיפוח המשפחה שלי בע"מ · ח.פ. 516868817</span><a href="https://myfamilycareclub.com">myfamilycareclub.com</a></div>
</div>

<div class="page">
 <div class="top2">
  <div class="row"><a href="https://myfamilycareclub.com" style="display:inline-block;padding:2.5mm 4mm;border-radius:3mm;background:var(--deep)"><img class="logo2" src="logo-white.png" alt="Family Care" style="height:9mm;display:block"></a><span style="font-size:9pt;color:var(--ink2)">לצוותי משאבי אנוש ורילוקיישן</span></div>
  <section class="blk" style="margin-top:6mm"><h2>איך מתחילים, גם מרחוק</h2><div class="steps">{steps_html}</div></section>
  <section class="blk"><h2>דוגמה: תקלה בבית ההורים, והעובד בחו"ל</h2><div class="flows">{flow_html}</div></section>
  <section class="blk two">
   <div class="card"><h3>{icon(P['lock'],22)}פרטיות וחיסיון</h3><p>אנחנו מתחייבים לשמירת הפרטיות. עובדי החברה חתומים על סודיות, והמידע נשמר מאובטח.</p></div>
   <div class="card"><h3>{icon(P['shield'],22)}כיצד מתומחר השירות</h3>
    <p class="pr"><strong>במנוי</strong>זמינות הצוות האישי ופעילות המלווה.</p>
    <p class="pr"><strong>שירותים חיצוניים</strong>אינם כלולים במחיר: בעלי מקצוע, נסיעות, כרטיסים וקניות.<br>משלמים רק על מה שמזמינים, עם חשבון מפורט.</p>
    <p class="pr"><strong>תשלום</strong>העברה בנקאית או כרטיס אשראי.</p>
   </div>
  </section>
  <section class="blk"><h2>מסלולי המועדון</h2><div class="plans">{plans_html}</div><p class="note">אזורי שירות: רמת השרון, הרצליה, צפון תל אביב, רעננה והסביבה</p></section>
 </div>
 <div class="cta">
  <div>
   <h3>בואו נדבר על הצעה לעובדים שלכם. הכול בטלפון אחד.</h3>
   <div class="who"><a href="tel:+972549995858" style="color:inherit;text-decoration:none;display:flex;align-items:center;gap:2mm">{icon(P['call'],22,2)}<span>אלון</span><bdi>054-9995858</bdi></a></div>
   <p><a href="mailto:office@myfamilycareclub.com">office@myfamilycareclub.com</a> · <a href="https://myfamilycareclub.com">myfamilycareclub.com</a></p>
  </div>
  <div class="wa"><a href="https://wa.me/972549995858" aria-label="שיחה בוואטסאפ עם אלון"><div>{WA_ICON}</div>לחצו לשיחה בוואטסאפ</a></div>
 </div>
</div>
</body></html>"""

(ROOT / "hr-brochure.html").write_text(HTML, encoding="utf-8")
base = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=4000", "--no-pdf-header-footer"]
subprocess.run([CHROME, *base, f"--print-to-pdf={ROOT/'hr-brochure.pdf'}", f"file://{ROOT/'hr-brochure.html'}"], check=True, capture_output=True)
import fitz
d = fitz.open(ROOT / "hr-brochure.pdf"); print("pages:", len(d), [len(p.get_links()) for p in d])
for i, p in enumerate(d, 1): p.get_pixmap(dpi=100).save(ROOT / f"_hr{i}.png")
