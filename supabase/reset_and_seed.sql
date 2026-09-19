-- Reload reference + demo data with correct Hebrew.
-- DELETES all rows in regions, membership_plans, staff, vendors, clients and everything that hangs off them
-- (tasks, contacts, invoices, ...). Keeps profiles and logins. Only use while the data is demo data.
truncate table public.regions, public.membership_plans, public.staff_members, public.vendors, public.clients restart identity cascade;

-- Required reference data (regions, plans, pricing rules). Safe to re-run.
insert into public.regions (name) values
  ('רמת השרון'), ('הרצליה'), ('צפון ת"א'), ('רעננה')
on conflict (name) do nothing;

insert into public.membership_plans (id, name, monthly_price, monthly_sessions, hours_per_session, sort_order) values
  ('basic', 'בסיסי', 1600, 4, null, 1),
  ('platinum', 'פלטינום', 3500, 8, 3, 2),
  ('top_platinum', 'טופ פלטינום', 10000, 12, null, 3)
on conflict (id) do nothing;

insert into public.pricing_settings (id) values (true) on conflict (id) do nothing;

-- Demo data from the design handoff. Run after full_setup.sql. Safe to re-run.
-- IDs are deterministic (md5 of a label) so rows can reference each other without lookups.
-- Note: ratings shown in the UI are computed from vendor_reviews, so demo values differ from the mock-ups.

-- ---- Staff ----
insert into public.staff_members (id, full_name, job_title, gender, languages) values
  (md5('staff:noa')::uuid,    'נועה שרעבי', 'personal_companion', 'f', '{עברית,רוסית}'),
  (md5('staff:adi')::uuid,    'עדי רוזן',   'social_worker',      'f', '{עברית,אנגלית}'),
  (md5('staff:daniel')::uuid, 'דניאל כהן',  'student',            'm', '{עברית}'),
  (md5('staff:tamar')::uuid,  'תמר בן־דוד', 'student',            'f', '{עברית,ערבית}')
on conflict (id) do nothing;

insert into public.staff_regions (staff_id, region_id)
select md5('staff:' || s.k)::uuid, r.id
from (values ('noa','רמת השרון'), ('noa','הרצליה'), ('adi','הרצליה'), ('adi','רעננה'),
             ('daniel','הרצליה'), ('daniel','צפון ת"א'), ('tamar','צפון ת"א')) as s(k, region)
join public.regions r on r.name = s.region
on conflict do nothing;

insert into public.staff_availability (staff_id, day, from_time, note)
select md5('staff:' || k)::uuid, date '2026-09-15', t::time, n
from (values ('adi', '15:00', 'פנויה מ-15:00'), ('tamar', '16:00', 'זמינה מ-16:00'), ('daniel', null, 'זמין')) as a(k, t, n)
where not exists (select 1 from public.staff_availability x where x.staff_id = md5('staff:' || a.k)::uuid and x.day = date '2026-09-15');

-- ---- Clients ----
insert into public.clients (id, full_name, birth_date, gender, region_id, address, phone, building_code, plan_id, member_since,
                            trial_ends_on, regular_companion_id, dependency_level, mobility_notes, cognitive_notes, monthly_budget_cap, card_last4)
select md5('client:' || c.k)::uuid, c.name, c.birth::date, case when c.k in ('yaakov', 'arie') then 'm' else 'f' end, r.id, c.addr, c.phone, c.code, c.plan, c.since::date,
       c.trial::date, case when c.companion is null then null else md5('staff:' || c.companion)::uuid end,
       c.dep, c.mob, c.cog, c.cap, c.card
from (values
  ('sara',   'שרה לוי',    '1942-03-01', 'רמת השרון',  'ז''בוטינסקי 18, רמת השרון', '052-441-8830', '2580#', 'platinum',    '2024-03-01', null,         'noa',    'light', 'הליכון · מדרגות בקושי · מעלית בבניין. מעקה בטיחות הותקן במקלחת 04.25. הסעות — מונית VIP בלבד.', 'צלולה · שכחה קלה. מומלץ להזכיר תורים יום מראש בשיחה, לא בהודעה בלבד.', 3000::numeric, '4417'),
  ('yaakov', 'יעקב ברנע',  '1947-03-01', 'הרצליה',     null, null, null, 'basic',        '2025-06-01', null,         'daniel', null,    null, null, null::numeric, null),
  ('hana',   'חנה פלד',    '1938-03-01', 'הרצליה',     null, null, null, 'top_platinum', '2024-11-01', null,         'adi',    null,    null, null, null::numeric, null),
  ('miriam', 'מרים אדלר',  '1950-03-01', 'צפון ת"א',   null, null, null, 'platinum',     '2026-03-01', null,         null,     null,    null, null, null::numeric, null),
  ('arie',   'אריה גולן',  '1945-03-01', 'רמת השרון',  null, null, null, 'basic',        '2026-08-30', '2026-09-30', 'noa',    null,    null, null, null::numeric, null)
) as c(k, name, birth, region, addr, phone, code, plan, since, trial, companion, dep, mob, cog, cap, card)
join public.regions r on r.name = c.region
on conflict (id) do nothing;

insert into public.family_contacts (id, client_id, contact_type, full_name, relation, permission, is_orderer, note) values
  (md5('contact:ronit')::uuid,  md5('client:sara')::uuid,   'family',    'רונית לוי־שדה', 'בת',  'full',      true,  null),
  (md5('contact:meir')::uuid,   md5('client:sara')::uuid,   'family',    'מאיר לוי',      'בן',  'view_only', false, null),
  (md5('contact:gil')::uuid,    md5('client:sara')::uuid,   'physician', 'ד"ר גיל אבידן', 'רופא מטפל', 'view_only', false, 'מכבי רמת השרון'),
  (md5('contact:ilana')::uuid,  md5('client:yaakov')::uuid, 'family',    'אילנה ברנע',    null,  'full',      true,  null),
  (md5('contact:doron')::uuid,  md5('client:hana')::uuid,   'family',    'דורון פלד',     null,  'full',      true,  null),
  (md5('contact:galit')::uuid,  md5('client:miriam')::uuid, 'family',    'גלית אדלר',     null,  'full',      true,  null),
  (md5('contact:tamarg')::uuid, md5('client:arie')::uuid,   'family',    'תמר גולן',      null,  'full',      true,  null)
on conflict (id) do nothing;

-- ---- Sara's care profile ----
insert into public.client_medications (id, client_id, name, dose, schedule, notes) values
  (md5('med:1')::uuid, md5('client:sara')::uuid, 'אליקוויס', '5 מ"ג', 'בוקר וערב', 'מרשמים מתחדשים ב-1 לחודש · איסוף על ידי המלווה'),
  (md5('med:2')::uuid, md5('client:sara')::uuid, 'לוסארטן',  '50 מ"ג', 'בוקר', null),
  (md5('med:3')::uuid, md5('client:sara')::uuid, 'ויטמין D', null, 'פעם בשבוע', null)
on conflict (id) do nothing;

insert into public.client_allergies (client_id, allergen, severity) values
  (md5('client:sara')::uuid, 'פניצילין', 'high'),
  (md5('client:sara')::uuid, 'לקטוז', 'medium')
on conflict (client_id, allergen) do nothing;

insert into public.client_preferences (id, client_id, category, title, details) values
  (md5('pref:1')::uuid, md5('client:sara')::uuid, 'food',      'רביבה וסיליה · דליקטסן בן יהודה', 'אוהבת: מרק עוף, גבינה בולגרית, עוגת גבינה. לא אוכלת חריף.'),
  (md5('pref:2')::uuid, md5('client:sara')::uuid, 'culture',   'הבימה · הקאמרי · מוזיקה קלאסית', 'עיתון "הארץ" בשישי. מעדיפה מופעי בוקר.'),
  (md5('pref:3')::uuid, md5('client:sara')::uuid, 'routine',   'הרגלי יום־יום', 'קמה ב-7:00 · קפה הפוך ב-8:00 · מנוחה אחר הצהריים 14:00–16:00 · לא לתאם ביקורים אחרי 19:00.'),
  (md5('pref:4')::uuid, md5('client:sara')::uuid, 'companion', 'מלווה אישה, עברית ורוסית', 'רצוי אותו פרצוף. החלפה — רק בתיאום מראש עם רונית.')
on conflict (id) do nothing;

-- ---- Vendors ----
insert into public.vendors (id, name, trade, license_expires_on, insurance_expires_on) values
  (md5('vendor:avi')::uuid,     'אבי מזרחי',        'אינסטלציה',      '2027-04-30', '2027-04-30'),
  (md5('vendor:cortech')::uuid, 'קור־טק מיזוג',     'מיזוג אוויר',    '2026-11-30', '2026-11-30'),
  (md5('vendor:yossi')::uuid,   'יוסי בר־און',      'טכנאי גז',       '2026-08-31', '2027-01-31'),   -- licence expired -> frozen
  (md5('vendor:alon')::uuid,    'מוניות אלון · VIP', 'הסעות',          '2027-02-28', '2027-02-28'),
  (md5('vendor:noam')::uuid,    'ד"ר נעם הרשקו',    'רופא עד הבית',   '2027-09-30', '2027-09-30'),
  (md5('vendor:shachar')::uuid, 'א. שחר מנעולנות',  'מנעולן · חירום', '2027-03-31', '2026-08-15')    -- insurance expired -> frozen
on conflict (id) do nothing;

insert into public.vendor_regions (vendor_id, region_id)
select md5('vendor:' || v.k)::uuid, r.id
from (values
  ('avi','רמת השרון'), ('avi','הרצליה'),
  ('yossi','רמת השרון'), ('yossi','הרצליה'), ('yossi','רעננה'),
  ('noam','הרצליה'), ('noam','רמת השרון')
) as v(k, region) join public.regions r on r.name = v.region
on conflict do nothing;
-- Nationwide / Gush Dan vendors cover all regions.
insert into public.vendor_regions (vendor_id, region_id)
select md5('vendor:' || k)::uuid, r.id from (values ('cortech'), ('alon'), ('shachar')) as v(k) cross join public.regions r
on conflict do nothing;

insert into public.vendor_price_items (id, vendor_id, label, amount, sort_order) values
  (md5('price:avi:1')::uuid, md5('vendor:avi')::uuid, 'ביקור', 350, 1),
  (md5('price:avi:2')::uuid, md5('vendor:avi')::uuid, 'שעה', 280, 2),
  (md5('price:cortech:1')::uuid, md5('vendor:cortech')::uuid, 'ביקור', 300, 1),
  (md5('price:cortech:2')::uuid, md5('vendor:cortech')::uuid, 'שעה', 250, 2),
  (md5('price:yossi:1')::uuid, md5('vendor:yossi')::uuid, 'ביקור', 390, 1),
  (md5('price:alon:1')::uuid, md5('vendor:alon')::uuid, 'רמה"ש', 40, 1),
  (md5('price:alon:2')::uuid, md5('vendor:alon')::uuid, 'ת"א בעומס', 120, 2),
  (md5('price:alon:3')::uuid, md5('vendor:alon')::uuid, 'המתנה', 111, 3),
  (md5('price:noam:1')::uuid, md5('vendor:noam')::uuid, 'ביקור', 700, 1),
  (md5('price:shachar:1')::uuid, md5('vendor:shachar')::uuid, 'קריאת חירום', 450, 1)
on conflict (id) do nothing;

-- ---- Tasks: today (15.9), the rest of the week and month, plus recent history ----
insert into public.tasks (id, client_id, scheduled_date, start_time, end_time, title, region_id, staff_id, vendor_id, status, checked_in_at, checked_out_at)
select md5('task:' || t.k)::uuid, md5('client:' || t.client)::uuid, t.d::date, t.st::time, t.et::time, t.title, r.id,
       case when t.staff is null then null else md5('staff:' || t.staff)::uuid end,
       case when t.vendor is null then null else md5('vendor:' || t.vendor)::uuid end,
       t.status, t.cin::timestamptz, t.cout::timestamptz
from (values
  ('1',  'sara',   '2026-09-15', '09:30', '11:30', 'ליווי לרופא + מרשמים',               'רמת השרון', 'noa',    null,       'in_progress', '2026-09-15 09:31+03', null),
  ('2',  'yaakov', '2026-09-15', '11:00', null,    'קניות מזון וסידור מקרר',             'הרצליה',    'daniel', null,       'planned',     null, null),
  ('3',  'hana',   '2026-09-15', '13:00', null,    'תיקון מזגן — ליווי טכנאי',           'הרצליה',    'adi',    'cortech',  'confirmed',   null, null),
  ('4',  'miriam', '2026-09-15', '16:00', null,    'הדרכת WhatsApp',                     'צפון ת"א',  null,     null,       'planned',     null, null),
  ('5',  'sara',   '2026-09-15', '17:30', null,    'בית קפה + מונית VIP',                'רמת השרון', 'noa',    'alon',     'planned',     null, null),
  ('6',  'arie',   '2026-09-17', '10:00', null,    'ביקור היכרות',                       'רמת השרון', 'noa',    null,       'planned',     null, null),
  ('7',  'sara',   '2026-09-17', '11:00', null,    'קניות במעדנייה וסידור הבית',         'רמת השרון', 'noa',    null,       'planned',     null, null),
  ('8',  'sara',   '2026-09-18', '10:00', null,    'חלה, עיתון ופרחים — הטבת המסלול',    'רמת השרון', 'noa',    null,       'planned',     null, null),
  ('9',  'hana',   '2026-09-22', '19:30', null,    'קונצרט בהיכל התרבות',                'הרצליה',    'adi',    null,       'planned',     null, null),
  ('h1', 'sara',   '2026-09-11', '09:00', null,    'ליווי לרופא + איסוף מרשמים',         'רמת השרון', 'daniel', null,       'completed',   '2026-09-11 09:00+03', '2026-09-11 12:10+03'),
  ('h2', 'sara',   '2026-09-08', '10:00', null,    'בית קפה, סידור דואר וארנונה',        'רמת השרון', 'noa',    null,       'completed',   '2026-09-08 10:00+03', '2026-09-08 12:00+03'),
  ('h3', 'sara',   '2026-09-12', '14:00', null,    'תיקון נזילה במטבח',                  'רמת השרון', 'noa',    'avi',      'completed',   '2026-09-12 14:00+03', '2026-09-12 15:20+03'),
  ('h4', 'hana',   '2026-09-10', '13:00', null,    'תיקון מזגן',                         'הרצליה',    'adi',    'cortech',  'completed',   '2026-09-10 13:00+03', '2026-09-10 14:30+03')
) as t(k, client, d, st, et, title, region, staff, vendor, status, cin, cout)
join public.regions r on r.name = t.region
on conflict (id) do nothing;

insert into public.task_briefing_items (id, task_id, label, is_done, sort_order) values
  (md5('brief:1')::uuid, md5('task:1')::uuid, 'איסוף מרשמים בבית המרקחת', true, 1),
  (md5('brief:2')::uuid, md5('task:1')::uuid, 'ליווי לתור אצל ד"ר אבידן ב-10:15', false, 2),
  (md5('brief:3')::uuid, md5('task:1')::uuid, 'לבדוק שיש חלב וירקות במקרר', false, 3)
on conflict (id) do nothing;

insert into public.visit_summaries (id, task_id, author_id, body, status, approved_at, sent_at) values
  (md5('sum:h1')::uuid, md5('task:h1')::uuid, md5('staff:daniel')::uuid, 'ליווי לרופא ואיסוף מרשמים. הכול עבר בשלום.', 'sent', '2026-09-11 13:00+03', '2026-09-11 13:05+03'),
  (md5('sum:h2')::uuid, md5('task:h2')::uuid, md5('staff:noa')::uuid,    'בית קפה בכיכר, סידור דואר ותשלום ארנונה.', 'sent', '2026-09-08 13:00+03', '2026-09-08 13:05+03'),
  (md5('sum:h3')::uuid, md5('task:h3')::uuid, md5('staff:noa')::uuid,    'תוקנה נזילה בכיור במטבח. הספק ניקה אחריו.', 'pending_approval', null, null)
on conflict (id) do nothing;

insert into public.task_feedback (id, task_id, given_by, rating, comment) values
  (md5('fb:h1')::uuid, md5('task:h1')::uuid, md5('contact:ronit')::uuid, 5, null),
  (md5('fb:h2')::uuid, md5('task:h2')::uuid, md5('contact:ronit')::uuid, 4.5, null)
on conflict (id) do nothing;

insert into public.vendor_reviews (id, vendor_id, task_id, reviewer_type, rating, comment) values
  (md5('rev:1')::uuid, md5('vendor:avi')::uuid,     md5('task:h3')::uuid, 'companion', 5.0, 'הגיע בזמן, ניקה אחריו. המלווה אישרה.'),
  (md5('rev:2')::uuid, md5('vendor:cortech')::uuid, md5('task:h4')::uuid, 'companion', 3.8, 'איחור של שעה. נשלחה הערה לספק.')
on conflict (id) do nothing;

insert into public.service_requests (id, client_id, requested_by, description, created_at) values
  (md5('req:1')::uuid, md5('client:sara')::uuid,   md5('contact:ronit')::uuid, 'רופא/ה עד הבית', now() - interval '20 minutes'),
  (md5('req:2')::uuid, md5('client:miriam')::uuid, md5('contact:galit')::uuid, 'כרטיסים לקונצרט', now() - interval '1 day'),
  (md5('req:3')::uuid, md5('client:hana')::uuid,   md5('contact:doron')::uuid, 'הנדימן למעקה',     now() - interval '1 day')
on conflict (id) do nothing;

insert into public.incidents (id, client_id, task_id, reported_by, description, severity, status, reported_at) values
  (md5('inc:1')::uuid, md5('client:sara')::uuid,   md5('task:1')::uuid, md5('staff:noa')::uuid,
   'כאב בברך ימין בעלייה במדרגות. ממתין לתיאום ביקור רופא/ה עד הבית.', 'medium', 'open', '2026-09-15 10:00+03'),
  (md5('inc:2')::uuid, md5('client:yaakov')::uuid, null, md5('staff:daniel')::uuid,
   'ירידה בתיאבון. ממתין לפתיחת תחקיר.', 'medium', 'open', '2026-09-15 08:30+03')
on conflict (id) do nothing;

insert into public.receipts (id, client_id, uploaded_by, amount, receipt_date) values
  (md5('rc:1')::uuid, md5('client:sara')::uuid, md5('staff:noa')::uuid, 184.50, '2026-09-08'),
  (md5('rc:2')::uuid, null,                     md5('staff:daniel')::uuid, 96.00, '2026-09-11')   -- pending assignment
on conflict (id) do nothing;

-- ---- September invoices (totals match the finance screen) ----
insert into public.invoices (id, client_id, billed_to, period_month, status, issued_at, paid_at) values
  (md5('inv:sara')::uuid,   md5('client:sara')::uuid,   md5('contact:ronit')::uuid, '2026-09-01', 'paid',          '2026-09-01 08:00+03', '2026-09-01 08:01+03'),
  (md5('inv:hana')::uuid,   md5('client:hana')::uuid,   md5('contact:doron')::uuid, '2026-09-01', 'paid',          '2026-09-01 08:00+03', '2026-09-01 08:01+03'),
  (md5('inv:yaakov')::uuid, md5('client:yaakov')::uuid, md5('contact:ilana')::uuid, '2026-09-01', 'pending',       '2026-09-01 08:00+03', null),
  (md5('inv:miriam')::uuid, md5('client:miriam')::uuid, md5('contact:galit')::uuid, '2026-09-01', 'card_declined', '2026-09-01 08:00+03', null)
on conflict (id) do nothing;

insert into public.invoice_lines (id, invoice_id, kind, description, amount) values
  (md5('il:sara:1')::uuid,   md5('inv:sara')::uuid,   'membership',        'דמי חברות — פלטינום', 3500),
  (md5('il:sara:2')::uuid,   md5('inv:sara')::uuid,   'companion_overage', 'שעות ליווי מעבר למכסה', 800),
  (md5('il:sara:3')::uuid,   md5('inv:sara')::uuid,   'vendor_cost',       'ספקים + ניהול', 1518),
  (md5('il:hana:1')::uuid,   md5('inv:hana')::uuid,   'membership',        'דמי חברות — טופ פלטינום', 10000),
  (md5('il:hana:2')::uuid,   md5('inv:hana')::uuid,   'companion_overage', 'שעות ליווי מעבר למכסה', 550),
  (md5('il:hana:3')::uuid,   md5('inv:hana')::uuid,   'vendor_cost',       'ספקים + ניהול', 990),
  (md5('il:yaakov:1')::uuid, md5('inv:yaakov')::uuid, 'membership',        'דמי חברות — בסיסי', 1600),
  (md5('il:yaakov:2')::uuid, md5('inv:yaakov')::uuid, 'companion_overage', 'שעות ליווי מעבר למכסה', 1050),
  (md5('il:yaakov:3')::uuid, md5('inv:yaakov')::uuid, 'vendor_cost',       'ספקים + ניהול', 264),
  (md5('il:miriam:1')::uuid, md5('inv:miriam')::uuid, 'membership',        'דמי חברות — פלטינום', 3500),
  (md5('il:miriam:2')::uuid, md5('inv:miriam')::uuid, 'companion_overage', 'שעות ליווי מעבר למכסה', 300)
on conflict (id) do nothing;

insert into public.payments (id, invoice_id, amount, status, provider_ref) values
  (md5('pay:sara')::uuid,   md5('inv:sara')::uuid,   5818, 'succeeded', null),
  (md5('pay:hana')::uuid,   md5('inv:hana')::uuid,   11540, 'succeeded', null),
  (md5('pay:miriam')::uuid, md5('inv:miriam')::uuid, 3800, 'failed', null)
on conflict (id) do nothing;
