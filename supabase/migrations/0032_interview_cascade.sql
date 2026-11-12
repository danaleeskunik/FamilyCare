-- 0032: deleting a companion also deletes the interview that created it (it holds personal details). Safe to run more than once.
alter table public.staff_interviews drop constraint if exists staff_interviews_staff_id_fkey;
alter table public.staff_interviews add constraint staff_interviews_staff_id_fkey
  foreign key (staff_id) references public.staff_members (id) on delete cascade;
