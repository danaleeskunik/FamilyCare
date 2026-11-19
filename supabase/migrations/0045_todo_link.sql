-- 0045: the alert task in "משימות לטיפול" links straight to the companion's report (where hours are approved).
-- Safe to run more than once.

alter table public.admin_todos add column if not exists link text;

create or replace function public.notify_hours(p_staff uuid, p_client uuid, p_date date, p_start text, p_end text, p_text text, p_kind text) returns void
language plpgsql security definer set search_path = public, vault, net as $$
declare
  who text; cl text; k text; label text; hrs text;
begin
  select full_name into who from public.staff_members where id = p_staff;
  select full_name into cl from public.clients where id = p_client;
  label := case p_kind when 'activity' then 'פעילות שלא תוכננה, לאישור' else 'שעות ביקור' end;
  hrs := left(p_start, 5) || '–' || left(p_end, 5);
  insert into public.admin_todos (title, details, due_on, created_by, link)
  values ('דיווח שעות: ' || coalesce(who, 'מלווה') || ' · ' || coalesce(cl, 'ללא לקוח') || ' · ' || to_char(p_date, 'DD/MM') || ' · ' || hrs,
          label || E'\n' || left(coalesce(p_text, ''), 400), current_date, null, '/admin/staff/' || p_staff);
  begin
    select decrypted_secret into k from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
    if k is not null then
      perform net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object('Authorization', 'Bearer ' || k, 'Content-Type', 'application/json'),
        body := jsonb_build_object(
          'from', 'Family Care <notifications@myfamilycareclub.com>',
          'to', jsonb_build_array('office@myfamilycareclub.com'),
          'subject', 'דיווח שעות: ' || coalesce(who, 'מלווה') || ' · ' || to_char(p_date, 'DD/MM'),
          'html', '<div dir="rtl" style="font-family:Arial,sans-serif;font-size:16px"><p>' || public._html(label) || '. נא לבדוק שהדיווח תקין.</p><table cellpadding="6">'
            || '<tr><td><b>מלווה</b></td><td>' || public._html(who) || '</td></tr>'
            || '<tr><td><b>לקוח/ה</b></td><td>' || public._html(coalesce(cl, '-')) || '</td></tr>'
            || '<tr><td><b>תאריך</b></td><td>' || to_char(p_date, 'DD/MM/YYYY') || '</td></tr>'
            || '<tr><td><b>שעות</b></td><td dir="ltr" style="text-align:right">' || hrs || '</td></tr>'
            || '<tr><td><b>תיאור</b></td><td>' || public._html(left(p_text, 600)) || '</td></tr></table>'
            || '<p><a href="https://myfamilycareclub.com/admin/staff/' || p_staff || '">לדוח של המלווה/ת</a></p></div>'
        )
      );
    end if;
  exception when others then null;  -- an email problem must never block the report
  end;
exception when others then null;
end $$;
revoke all on function public.notify_hours(uuid, uuid, date, text, text, text, text) from public, anon, authenticated;
