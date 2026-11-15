-- 0034: marks invoices whose details were filled in automatically (cleared once someone reviews and saves them). Safe to run more than once.
alter table public.expense_docs add column if not exists auto_read boolean not null default false;
