-- Record the result of each beach's daily public-web sighting scan.
-- These are unverified online signals and intentionally remain separate from
-- crowdsourced eyewitness reports in mw_sightings.

create table if not exists public.mw_sighting_checks (
  id          uuid primary key default gen_random_uuid(),
  beach_id    text not null references public.mw_beaches(id) on delete cascade,
  checked_at  timestamptz not null default now(),
  check_date  date not null default current_date,
  status      text not null check (status in ('checked', 'unavailable')),
  reports     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  unique (beach_id, check_date)
);

create index if not exists mw_sighting_checks_latest_idx
  on public.mw_sighting_checks(beach_id, checked_at desc);

alter table public.mw_sighting_checks enable row level security;

create policy "mw_sighting_checks_read"
  on public.mw_sighting_checks
  for select
  to anon, authenticated
  using (true);
