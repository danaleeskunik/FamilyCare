-- 0042: every time a companion reports hours (an unplanned activity, or the start/end of a visit) the manager is alerted:
-- 1) a task in "משימות לטיפול" (always), 2) an email to the office through Resend (needs the resend_api_key secret in Vault; without it only the task is created).
-- Safe to run more than once.

create extension if not exists pg_net;

create or replace function public._html(t text) returns text language sql immutable set search_path = '' as $$
  select replace(replace(replace(coalesce(t, '-'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;')
$$;

create or replace function public.notify_hours(p_staff uuid, p_client uuid, p_date date, p_start text, p_end text, p_text text, p_kind text) returns void
language plpgsql security definer set search_path = public, vault, net as $$
declare
  who text; cl text; k text; label text; hrs text;
begin
  select full_name into who from public.staff_members where id = p_staff;
  select full_name into cl from public.clients where id = p_client;
  label := case p_kind when 'activity' then 'פעילות שלא תוכננה, לאישור' else 'שעות ביקור' end;
  hrs := left(p_start, 5) || '–' || left(p_end, 5);
  insert into public.admin_todos (title, details, due_on, created_by)
  values ('דיווח שעות: ' || coalesce(who, 'מלווה') || ' · ' || coalesce(cl, 'ללא לקוח') || ' · ' || to_char(p_date, 'DD/MM') || ' · ' || hrs,
          label || E'\n' || left(coalesce(p_text, ''), 400), current_date, null);
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

create or replace function public.trg_activity_alert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_hours(new.staff_id, new.client_id, new.work_date, new.start_time::text, new.end_time::text, new.description, 'activity');
  return new;
end $$;
revoke all on function public.trg_activity_alert() from public, anon, authenticated;
drop trigger if exists staff_activities_alert on public.staff_activities;
create trigger staff_activities_alert after insert on public.staff_activities for each row execute function public.trg_activity_alert();

-- Visit reports: same alert whenever the companion saves the start and end of a visit.
create or replace function public.submit_visit_report(p_task uuid, p_body text, p_details jsonb, p_start text, p_end text) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare me uuid := public.my_staff_id(); t public.tasks; s timestamptz; e timestamptz;
begin
  select * into t from public.tasks where id = p_task and staff_id = me;
  if me is null or not found then return false; end if;
  if length(btrim(coalesce(p_body, ''))) = 0 then return false; end if;
  s := (t.scheduled_date + p_start::time) at time zone 'Asia/Jerusalem';
  e := (t.scheduled_date + p_end::time) at time zone 'Asia/Jerusalem';
  if e <= s then return false; end if;
  update public.tasks set checked_in_at = s, checked_out_at = e, status = 'completed' where id = p_task;
  insert into public.visit_summaries (task_id, author_id, body, details, status, approved_at, sent_at)
  values (p_task, me, p_body, coalesce(p_details, '{}'::jsonb), 'sent', now(), now())
  on conflict (task_id) do update set body = excluded.body, details = excluded.details, status = 'sent',
    approved_at = now(), sent_at = now(), updated_at = now()
  where public.visit_summaries.author_id = me;
  perform public.notify_hours(me, t.client_id, t.scheduled_date, p_start, p_end, p_body, 'visit');
  return true;
end;
$$;
revoke execute on function public.submit_visit_report(uuid, text, jsonb, text, text) from public, anon;
grant execute on function public.submit_visit_report(uuid, text, jsonb, text, text) to authenticated;
