-- Landing-page lead form: anyone can leave details; the lead lands in public.leads (source 'landing')
-- and an email goes to the office. anon has no table access; it can only call submit_lead().

alter table public.leads add column if not exists country text;

create or replace function public.submit_lead(
  p_first text, p_last text, p_phone text, p_email text default null, p_country text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_first text := btrim(coalesce(p_first, ''));
  v_last text := btrim(coalesce(p_last, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_email text := nullif(btrim(coalesce(p_email, '')), '');
  v_country text := nullif(btrim(coalesce(p_country, '')), '');
  v_digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if length(v_first) not between 1 and 60 or length(v_last) not between 1 and 60 then raise exception 'invalid_name'; end if;
  if length(v_digits) not between 7 and 15 or length(v_phone) > 30 then raise exception 'invalid_phone'; end if;
  if v_email is not null and (length(v_email) > 120 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then raise exception 'invalid_email'; end if;
  if v_country is not null and length(v_country) > 60 then raise exception 'invalid_country'; end if;

  -- Abuse guards: at most 20 landing leads an hour; the same phone twice in a day is accepted but not duplicated.
  if (select count(*) from public.leads where source = 'landing' and created_at > now() - interval '1 hour') >= 20 then raise exception 'rate_limited'; end if;
  if exists (select 1 from public.leads where source = 'landing' and regexp_replace(coalesce(phone, ''), '\D', '', 'g') = v_digits and created_at > now() - interval '1 day') then return; end if;

  insert into public.leads (name, phone, email, country, source)
  values (v_first || ' ' || v_last, v_phone, v_email, v_country, 'landing');
end $$;

revoke all on function public.submit_lead(text, text, text, text, text) from public;
grant execute on function public.submit_lead(text, text, text, text, text) to anon, authenticated;

-- Email to the office on every landing lead, sent by Resend through pg_net (async, never blocks the form).
-- The API key lives in Supabase Vault under the name resend_api_key. Without it the lead is still saved, no email is sent.
create extension if not exists pg_net;

create or replace function public.notify_new_lead() returns trigger
language plpgsql security definer set search_path = public, vault, net as $$
declare
  k text;
  esc text;
  rows_html text;
begin
  if new.source <> 'landing' then return new; end if;
  select decrypted_secret into k from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if k is null then return new; end if;

  rows_html := format('<tr><td><b>שם</b></td><td>%s</td></tr><tr><td><b>טלפון</b></td><td dir="ltr" style="text-align:right">%s</td></tr><tr><td><b>מייל</b></td><td>%s</td></tr><tr><td><b>מדינה</b></td><td>%s</td></tr>',
    replace(replace(replace(new.name, '&', '&amp;'), '<', '&lt;'), '>', '&gt;'),
    replace(replace(replace(coalesce(new.phone, '-'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'),
    replace(replace(replace(coalesce(new.email, '-'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'),
    replace(replace(replace(coalesce(new.country, '-'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;'));

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'from', 'Family Care <leads@myfamilycareclub.com>',
      'to', jsonb_build_array('office@myfamilycareclub.com'),
      'subject', 'ליד חדש מהאתר: ' || new.name,
      'html', '<div dir="rtl" style="font-family:Arial,sans-serif;font-size:16px"><p>התקבלה פנייה חדשה מהאתר.</p><table cellpadding="6">' || rows_html || '</table><p>הליד נשמר ברשימת הלידים באפליקציה.</p></div>'
    ) || case when new.email is not null then jsonb_build_object('reply_to', new.email) else '{}'::jsonb end
  );
  return new;
exception when others then
  return new;  -- an email problem must never lose the lead
end $$;

drop trigger if exists leads_notify on public.leads;
create trigger leads_notify after insert on public.leads for each row execute function public.notify_new_lead();
