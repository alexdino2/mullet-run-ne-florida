-- Captain requests to be listed in the charter directory (/charters).
-- Contains contact details, so the public roles may insert but never read.
-- Review new leads in the Supabase dashboard (or via the service role).

create table if not exists public.mw_charter_leads (
  id              uuid primary key default gen_random_uuid(),
  region_id       text not null,
  captain_name    text not null,
  business_name   text,
  email           text not null,
  phone           text,
  website         text,
  uscg_license    text,
  notes           text,
  status          text not null default 'new'
                    check (status in ('new', 'contacted', 'verified', 'listed', 'rejected')),
  created_at      timestamptz not null default now()
);

create index if not exists mw_charter_leads_created_idx
  on public.mw_charter_leads(created_at desc);

alter table public.mw_charter_leads enable row level security;

create policy "mw_charter_leads_insert"
  on public.mw_charter_leads
  for insert
  to anon, authenticated
  with check (status = 'new');
