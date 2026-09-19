-- Reload reference + demo data with correct Hebrew.
-- DELETES all rows in regions, membership_plans, staff, vendors, clients and everything that hangs off them
-- (tasks, contacts, notes, slots, expenses, planning items, invoices, ...). Keeps profiles and logins. Only use while the data is demo data.
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
select md5('staff:' || k)::uuid, current_date, t::time, n
from (values ('adi', '15:00', 'פנויה מ-15:00'), ('tamar', '16:00', 'זמינה מ-16:00'), ('daniel', null, 'זמין')) as a(k, t, n)
where not exists (select 1 from public.staff_availability x where x.staff_id = md5('staff:' || a.k)::uuid and x.day = current_date);

-- ---- Clients ----
insert into public.clients (id, full_name, birth_date, gender, region_id, address, phone, building_code, plan_id, member_since,
                            trial_ends_on, regular_companion_id, dependency_level, mobility_notes, cognitive_notes)
select md5('client:' || c.k)::uuid, c.name, c.birth::date, case when c.k in ('yaakov', 'arie') then 'm' else 'f' end, r.id,
       c.addr, c.phone, c.code, c.plan, c.since::date,
       case when c.trial is null then null else current_date + c.trial::int end,
       case when c.companion is null then null else md5('staff:' || c.companion)::uuid end,
       c.dep, c.mob, c.cog
from (values
  ('sara',   'שרה לוי',    '1942-03-01', 'רמת השרון', 'ז''בוטינסקי 18, רמת השרון', '052-441-8830', '2580#', 'platinum',     '2024-03-01', null, 'noa',    'light',
   'הליכון · מדרגות בקושי · מעלית בבניין. מעקה בטיחות הותקן במקלחת 04.25. הסעות — מונית VIP בלבד.',
   'צלולה · שכחה קלה. מומלץ להזכיר תורים יום מראש בשיחה, לא בהודעה בלבד.'),
  ('yaakov', 'יעקב ברנע',  '1947-03-01', 'הרצליה',    null, null, null, 'basic',        '2025-06-01', null, 'daniel', null, null, null),
  ('hana',   'חנה פלד',    '1938-03-01', 'הרצליה',    null, null, null, 'top_platinum', '2024-11-01', null, 'adi',    null, null, null),
  ('miriam', 'מרים אדלר',  '1950-03-01', 'צפון ת"א',  null, null, null, 'platinum',     '2026-03-01', null, null,     null, null, null),
  ('arie',   'אריה גולן',  '1945-03-01', 'רמת השרון', null, null, null, 'basic',        '2026-08-30', '15', 'noa',    null, null, null)
) as c(k, name, birth, region, addr, phone, code, plan, since, trial, companion, dep, mob, cog)
join public.regions r on r.name = c.region
on conflict (id) do nothing;

insert into public.client_billing (client_id, card_last4, monthly_budget_cap) values
  (md5('client:sara')::uuid, '4417', 3000)
on conflict (client_id) do nothing;

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
  (md5('vendor:avi')::uuid,     'אבי מזרחי',        'אינסטלציה',      (current_date + interval '8 months')::date,  (current_date + interval '8 months')::date),
  (md5('vendor:cortech')::uuid, 'קור־טק מיזוג',     'מיזוג אוויר',    (current_date + interval '2 months')::date,  (current_date + interval '2 months')::date),
  (md5('vendor:yossi')::uuid,   'יוסי בר־און',      'טכנאי גז',       (current_date - 19),                          (current_date + interval '4 months')::date),   -- licence expired -> frozen
  (md5('vendor:alon')::uuid,    'מוניות אלון · VIP', 'הסעות',          (current_date + interval '5 months')::date,  (current_date + interval '5 months')::date),
  (md5('vendor:noam')::uuid,    'ד"ר נעם הרשקו',    'רופא עד הבית',   (current_date + interval '12 months')::date, (current_date + interval '12 months')::date),
  (md5('vendor:shachar')::uuid, 'א. שחר מנעולנות',  'מנעולן · חירום', (current_date + interval '6 months')::date,  (current_date - 35))                           -- insurance expired -> frozen
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

-- ---- Tasks: dates are relative to today, so the demo always looks current ----
insert into public.tasks (id, client_id, scheduled_date, start_time, end_time, title, region_id, staff_id, vendor_id, status, checked_in_at, checked_out_at)
select md5('task:' || t.k)::uuid, md5('client:' || t.client)::uuid, current_date + t.off, t.st::time, t.et::time, t.title, r.id,
       case when t.staff is null then null else md5('staff:' || t.staff)::uuid end,
       case when t.vendor is null then null else md5('vendor:' || t.vendor)::uuid end,
       t.status,
       case when t.cin is null then null else ((current_date + t.off) + t.cin::time) at time zone 'Asia/Jerusalem' end,
       case when t.cout is null then null else ((current_date + t.off) + t.cout::time) at time zone 'Asia/Jerusalem' end
from (values
  ('1',  'sara',   0,  '09:30', '11:30', 'ליווי לרופא + מרשמים',               'רמת השרון', 'noa',    null,       'in_progress', '09:31', null),
  ('2',  'yaakov', 0,  '11:00', null,    'קניות מזון וסידור מקרר',             'הרצליה',    'daniel', null,       'planned',     null,    null),
  ('3',  'hana',   0,  '13:00', null,    'תיקון מזגן — ליווי טכנאי',           'הרצליה',    'adi',    'cortech',  'confirmed',   null,    null),
  ('4',  'miriam', 0,  '16:00', null,    'הדרכת WhatsApp',                     'צפון ת"א',  null,     null,       'planned',     null,    null),
  ('5',  'sara',   0,  '17:30', null,    'בית קפה + מונית VIP',                'רמת השרון', 'noa',    'alon',     'planned',     null,    null),
  ('h1', 'sara',   -4, '09:00', '11:00',    'ליווי לרופא + איסוף מרשמים',         'רמת השרון', 'daniel', null,       'completed',   '09:00', '12:10'),
  ('h2', 'sara',   -7, '10:00', '12:00',    'בית קפה, סידור דואר וארנונה',        'רמת השרון', 'noa',    null,       'completed',   '10:00', '12:00'),
  ('h3', 'sara',   -3, '14:00', '15:00',    'תיקון נזילה במטבח',                  'רמת השרון', 'noa',    'avi',      'completed',   '14:00', '15:20'),
  ('h4', 'hana',   -5, '13:00', '14:00',    'תיקון מזגן',                         'הרצליה',    'adi',    'cortech',  'completed',   '13:00', '14:30')
) as t(k, client, off, st, et, title, region, staff, vendor, status, cin, cout)
join public.regions r on r.name = t.region
on conflict (id) do nothing;

insert into public.task_briefing_items (id, task_id, label, is_done, sort_order) values
  (md5('brief:1')::uuid, md5('task:1')::uuid, 'איסוף מרשמים בבית המרקחת', true, 1),
  (md5('brief:2')::uuid, md5('task:1')::uuid, 'ליווי לתור אצל ד"ר אבידן ב-10:15', false, 2),
  (md5('brief:3')::uuid, md5('task:1')::uuid, 'לבדוק שיש חלב וירקות במקרר', false, 3)
on conflict (id) do nothing;

insert into public.visit_summaries (id, task_id, author_id, body, status, approved_at, sent_at) values
  (md5('sum:h1')::uuid, md5('task:h1')::uuid, md5('staff:daniel')::uuid, 'ליווי לרופא ואיסוף מרשמים. הכול עבר בשלום.', 'sent', now() - interval '4 days', now() - interval '4 days'),
  (md5('sum:h2')::uuid, md5('task:h2')::uuid, md5('staff:noa')::uuid,    'בית קפה בכיכר, סידור דואר ותשלום ארנונה.', 'sent', now() - interval '7 days', now() - interval '7 days'),
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
   'כאב בברך ימין בעלייה במדרגות. ממתין לתיאום ביקור רופא/ה עד הבית.', 'medium', 'open', now() - interval '1 hour'),
  (md5('inc:2')::uuid, md5('client:yaakov')::uuid, null, md5('staff:daniel')::uuid,
   'ירידה בתיאבון. ממתין לפתיחת תחקיר.', 'medium', 'open', now() - interval '3 hours')
on conflict (id) do nothing;

insert into public.receipts (id, client_id, uploaded_by, amount, receipt_date) values
  (md5('rc:1')::uuid, md5('client:sara')::uuid, md5('staff:noa')::uuid, 184.50, current_date - 7),
  (md5('rc:2')::uuid, null,                     md5('staff:daniel')::uuid, 96.00, current_date - 4)   -- pending assignment
on conflict (id) do nothing;

-- ---- September invoices (totals match the finance screen) ----
insert into public.invoices (id, client_id, billed_to, period_month, status, issued_at, paid_at) values
  (md5('inv:sara')::uuid,   md5('client:sara')::uuid,   md5('contact:ronit')::uuid, date_trunc('month', current_date)::date, 'paid', date_trunc('month', current_date) + interval '8 hours', date_trunc('month', current_date) + interval '8 hours 1 minute'),
  (md5('inv:hana')::uuid,   md5('client:hana')::uuid,   md5('contact:doron')::uuid, date_trunc('month', current_date)::date, 'paid', date_trunc('month', current_date) + interval '8 hours', date_trunc('month', current_date) + interval '8 hours 1 minute'),
  (md5('inv:yaakov')::uuid, md5('client:yaakov')::uuid, md5('contact:ilana')::uuid, date_trunc('month', current_date)::date, 'pending', date_trunc('month', current_date) + interval '8 hours', null),
  (md5('inv:miriam')::uuid, md5('client:miriam')::uuid, md5('contact:galit')::uuid, date_trunc('month', current_date)::date, 'card_declined', date_trunc('month', current_date) + interval '8 hours', null)
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

-- ---- Notes and highlights (needs migration 0008) ----
insert into public.client_notes (id, client_id, kind, body) values
  (md5('note:1')::uuid, md5('client:sara')::uuid, 'highlight', 'לא לתאם ביקורים אחרי 19:00. להזכיר תורים יום מראש בשיחה, לא רק בהודעה.'),
  (md5('note:2')::uuid, md5('client:sara')::uuid, 'highlight', 'אלרגיה לפניצילין. במדרגות ללוות ולתת יד, במיוחד אחרי כאב הברך שדווח ב-15.9.'),
  (md5('note:3')::uuid, md5('client:sara')::uuid, 'note',      'אוהבת לספר על הנכדים. כדאי להקדיש כמה דקות לשיחה בתחילת הביקור.')
on conflict (id) do nothing;

-- ---- Recurring visit slots (what each client asked for). Weekdays are relative to today so
-- they never fall on today's demo visits; visits are generated from them automatically. ----
insert into public.client_visit_slots (id, client_id, weekday, start_time, end_time, purpose, staff_id)
select md5('slot:' || v.k)::uuid, md5('client:' || v.client)::uuid, extract(dow from current_date + v.off)::smallint,
       v.st::time, v.et::time, v.purpose, case when v.staff is null then null else md5('staff:' || v.staff)::uuid end
from (values
  ('sara1',   'sara',   1, '09:30', '11:30', 'ליווי לרופא וסידורים',                'noa'),
  ('sara2',   'sara',   3, '11:00', '13:00', 'קניות במעדנייה וסידור הבית',          'noa'),
  ('yaakov1', 'yaakov', 2, '11:00', '13:00', 'קניות מזון וסידור מקרר',              'daniel'),
  ('hana1',   'hana',   4, '13:00', '15:00', 'ליווי ופנאי — קפה וטיול קצר',         'adi'),
  ('miriam1', 'miriam', 3, '16:00', '17:00', 'הדרכת WhatsApp',                      null),
  ('arie1',   'arie',   2, '10:00', '12:00', 'ביקור היכרות',                        'noa')
) as v(k, client, off, st, et, purpose, staff)
on conflict (id) do nothing;

-- ---- Companion extra expenses (needs migration 0010) ----
insert into public.staff_expenses (id, staff_id, task_id, expense_date, amount, description, status) values
  (md5('exp:1')::uuid, md5('staff:noa')::uuid,    md5('task:h2')::uuid, current_date - 7, 32.00, 'ארוחת צהריים במהלך הביקור', 'approved'),
  (md5('exp:2')::uuid, md5('staff:noa')::uuid,    md5('task:h3')::uuid, current_date - 3, 18.50, 'קפה וכריך בזמן ההמתנה לאינסטלטור', 'pending'),
  (md5('exp:3')::uuid, md5('staff:daniel')::uuid, md5('task:h1')::uuid, current_date - 4, 24.00, 'ארוחה קלה אחרי התור אצל הרופא', 'pending')
on conflict (id) do nothing;

-- ---- Office planning board (needs migration 0012). Dates are relative to today. ----
insert into public.coordination_items (id, client_id, vendor_id, kind, title, event_date, due_date, status, notes) values
  (md5('co:1')::uuid, md5('client:sara')::uuid,   md5('vendor:alon')::uuid,   'transport', 'מונית VIP להצגה בתיאטרון הבימה וחזרה',   current_date + 9,  current_date + 6,  'in_progress', 'להזמין המתנה של שעתיים'),
  (md5('co:2')::uuid, md5('client:miriam')::uuid, null,                       'tickets',   'כרטיסים לקונצרט בהיכל התרבות',            current_date + 12, current_date + 8,  'new',         'משפחת אדלר ביקשה שני כרטיסים'),
  (md5('co:3')::uuid, md5('client:hana')::uuid,   md5('vendor:avi')::uuid,    'contractor','הנדימן להתקנת מעקה בטיחות במקלחת',        current_date + 5,  current_date + 2,  'ordered',     null),
  (md5('co:4')::uuid, md5('client:sara')::uuid,   md5('vendor:noam')::uuid,   'doctor',    'ביקור רופא עד הבית בעקבות כאב בברך',       current_date + 3,  current_date + 1,  'in_progress', 'לתאם שעה אחרי 10:00'),
  (md5('co:5')::uuid, md5('client:yaakov')::uuid, null,                       'other',     'בדיקת דם בבית — תיאום עם המעבדה',          current_date - 2,  current_date - 4,  'done',        null)
on conflict (id) do nothing;
