-- 0040: what the family pays on top of the membership in a month: billed extra hours, and approved expenses the companion
-- reported for this client (café, outings, purchases). Family of the client or an admin only. Safe to run more than once.

create or replace function public.portal_month_extras(p_client uuid, p_month date) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare m0 date := date_trunc('month', p_month)::date; m1 date := (date_trunc('month', p_month) + interval '1 month')::date;
begin
  if not (public.is_admin() or public.is_family_of(p_client)) then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  return jsonb_build_object(
    'hours', coalesce((select jsonb_agg(jsonb_build_object('date', t.scheduled_date, 'minutes', vo.overtime_minutes, 'charge', vo.client_charge) order by t.scheduled_date)
                       from public.visit_overtime vo join public.tasks t on t.id = vo.task_id
                       where t.client_id = p_client and vo.decision = 'billed' and t.scheduled_date >= m0 and t.scheduled_date < m1), '[]'::jsonb),
    'expenses', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'date', e.expense_date, 'text', e.description, 'amount', e.amount) order by e.expense_date)
                          from public.staff_expenses e
                          where e.client_id = p_client and e.status = 'approved' and e.expense_date >= m0 and e.expense_date < m1), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.portal_month_extras(uuid, date) from public, anon;
grant execute on function public.portal_month_extras(uuid, date) to authenticated;
