-- Office staff: a login that sees only the sections an admin gives it (today: "leads").
-- Admins keep everything. Access is enforced here in the database, not only by hiding tabs in the app.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'companion', 'family', 'office'));
alter table public.profiles add column if not exists sections text[] not null default '{}';

-- True when the signed-in user is office staff who was given this section.
create function public.has_section(p_section text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select p.role = 'office' and p_section = any (p.sections) from public.profiles p where p.id = (select auth.uid())),
    false);
$$;
revoke execute on function public.has_section(text) from public, anon;
grant execute on function public.has_section(text) to authenticated;

-- Leads: admins and office staff with the "leads" section.
drop policy if exists "admin all" on public.leads;
create policy "leads access" on public.leads for all to authenticated
  using (public.is_admin() or public.has_section('leads'))
  with check (public.is_admin() or public.has_section('leads'));

-- Admin tool: give an existing login (created in Supabase Authentication) office access to some sections.
create function public.set_office_access(p_email text, p_name text, p_sections text[]) returns void
language plpgsql security definer set search_path = ''
as $$
declare u uuid; existing text;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from unnest(coalesce(p_sections, '{}')) s where s <> all (array['leads'])) then
    raise exception 'Unknown section' using errcode = 'invalid_parameter_value';
  end if;
  select id into u from auth.users where lower(email) = lower(btrim(p_email));
  if u is null then
    raise exception 'No user with that email' using errcode = 'no_data_found';
  end if;
  select role into existing from public.profiles where id = u;
  if existing is not null and existing <> 'office' then
    raise exception 'That account already has another role' using errcode = 'invalid_parameter_value';
  end if;
  insert into public.profiles (id, role, full_name, email, sections)
  values (u, 'office', btrim(coalesce(p_name, '')), lower(btrim(p_email)), coalesce(p_sections, '{}'))
  on conflict (id) do update
    set sections = excluded.sections,
        full_name = case when btrim(excluded.full_name) = '' then public.profiles.full_name else excluded.full_name end;
end;
$$;

create function public.remove_office_access(p_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  delete from public.profiles where id = p_id and role = 'office';
end;
$$;

revoke execute on function public.set_office_access(text, text, text[]), public.remove_office_access(uuid) from public, anon;
grant execute on function public.set_office_access(text, text, text[]), public.remove_office_access(uuid) to authenticated;
