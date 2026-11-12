-- 0030: remember which staff member an interview was turned into. Safe to run more than once.
alter table public.staff_interviews
  add column if not exists staff_id uuid references public.staff_members (id) on delete set null;
