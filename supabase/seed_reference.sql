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
