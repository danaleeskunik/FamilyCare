-- 0019: vendor contact details (טלפון, מייל, איש קשר, אתר, תחילת קשר, הערות חופשיות).
-- Safe to run more than once.

alter table public.vendors add column if not exists contact_name text;
alter table public.vendors add column if not exists phone text;
alter table public.vendors add column if not exists email text;
alter table public.vendors add column if not exists website text;                  -- link to the vendor's own site
alter table public.vendors add column if not exists relationship_started_on date;  -- when the vendor started working with the company
alter table public.vendors add column if not exists notes text;                    -- free text
