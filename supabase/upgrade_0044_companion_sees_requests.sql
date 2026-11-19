-- 0044: the companion who is linked to a client (the client's regular companion) can read that client's service requests,
-- so a new request shows up in the companion's app. Read only. Safe to run more than once.

create or replace function public.is_regular_companion(c uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.my_staff_id() is not null
     and exists (select 1 from public.clients where id = c and regular_companion_id = public.my_staff_id())
$$;
revoke execute on function public.is_regular_companion(uuid) from public, anon;
grant execute on function public.is_regular_companion(uuid) to authenticated;

drop policy if exists "regular companion requests read" on public.service_requests;
create policy "regular companion requests read" on public.service_requests for select to authenticated
  using (public.is_regular_companion(client_id));
