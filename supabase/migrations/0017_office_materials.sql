-- 0017: office staff can also be given the "materials" tab (the files themselves are public site assets; this only opens the admin tab).
-- Safe to run more than once.

create or replace function public.set_office_access(p_email text, p_name text, p_sections text[]) returns void
language plpgsql security definer set search_path = ''
as $$
declare u uuid; existing text;
begin
  if not public.is_admin() then
    raise exception 'Not allowed' using errcode = 'insufficient_privilege';
  end if;
  if exists (select 1 from unnest(coalesce(p_sections, '{}')) s where s <> all (array['leads','materials'])) then
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
