-- 0031: companion status: before_interview / suitable / unsuitable. Existing companions are "suitable".
-- Only suitable companions are offered when assigning visits. Safe to run more than once.
alter table public.staff_members
  add column if not exists status text not null default 'suitable';
alter table public.staff_members drop constraint if exists staff_members_status_check;
alter table public.staff_members add constraint staff_members_status_check check (status in ('before_interview', 'suitable', 'unsuitable'));
