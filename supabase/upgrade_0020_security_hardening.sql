-- 0020: security hardening (defense in depth). Safe to run more than once.
-- The anonymous (not signed-in) role never needs any table, view or function in the public schema.
-- Row-level security already blocks it; this removes the grants as well, so a missing policy can never expose data.

do $$
declare r record;
begin
  for r in select tablename as n from pg_tables where schemaname = 'public'
           union all select viewname from pg_views where schemaname = 'public' loop
    execute format('revoke all on public.%I from anon', r.n);
  end loop;
end $$;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from anon;
