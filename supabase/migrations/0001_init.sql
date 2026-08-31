-- Mullet Watch NEFL schema (namespaced with mw_ to coexist with other apps).
-- Apply via the Supabase SQL Editor or `supabase db push`.

create table if not exists public.mw_beaches (
  id            text primary key,
  name          text not null,
  lat           double precision not null,
  lon           double precision not null,
  priority      integer not null default 0,
  tide_station  text,
  buoy_station  text,
  nws_note      text,
  created_at    timestamptz not null default now()
);

create table if not exists public.mw_sightings (
  id            uuid primary key default gen_random_uuid(),
  beach_id      text not null references public.mw_beaches(id) on delete cascade,
  observed_at   timestamptz not null default now(),
  school_size   text not null check (school_size in ('small','medium','large','huge')),
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists mw_sightings_beach_idx on public.mw_sightings(beach_id);
create index if not exists mw_sightings_observed_idx on public.mw_sightings(observed_at desc);

create table if not exists public.mw_alert_rules (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  beach_id      text references public.mw_beaches(id) on delete cascade,
  min_score     integer not null default 70 check (min_score between 0 and 100),
  wind_dir_min  integer check (wind_dir_min between 0 and 360),
  wind_dir_max  integer check (wind_dir_max between 0 and 360),
  max_wind_kt   integer,
  channel       text not null default 'none' check (channel in ('none','email','sms','push')),
  enabled       boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.mw_conditions_cache (
  beach_id      text primary key references public.mw_beaches(id) on delete cascade,
  fetched_at    timestamptz not null default now(),
  score         integer,
  payload       jsonb not null
);

-- Row Level Security: public read everywhere; anon may log sightings; other
-- writes go through the service role key (which bypasses RLS) on the server.
alter table public.mw_beaches enable row level security;
alter table public.mw_sightings enable row level security;
alter table public.mw_alert_rules enable row level security;
alter table public.mw_conditions_cache enable row level security;

create policy "mw_beaches_read"          on public.mw_beaches          for select to anon, authenticated using (true);
create policy "mw_sightings_read"        on public.mw_sightings        for select to anon, authenticated using (true);
create policy "mw_sightings_insert"      on public.mw_sightings        for insert to anon, authenticated with check (true);
create policy "mw_alert_rules_read"      on public.mw_alert_rules      for select to anon, authenticated using (true);
create policy "mw_conditions_cache_read" on public.mw_conditions_cache for select to anon, authenticated using (true);

-- Seed target beaches (Mickler's Landing prioritized highest).
insert into public.mw_beaches (id, name, lat, lon, priority, tide_station, buoy_station, nws_note) values
  ('micklers',     'Mickler''s Landing',  30.2016, -81.3702, 100, '8720218', '41117', 'Ponte Vedra Beach; tide via Mayport station'),
  ('st-augustine', 'St. Augustine Beach', 29.8497, -81.2653,  55, '8720587', '41117', 'St. Augustine Beach station'),
  ('jax-beach',    'Jacksonville Beach',  30.2775, -81.3933,  60, '8720218', '41117', 'Tide via Mayport station'),
  ('mayport',      'Mayport',             30.3936, -81.4137,  50, '8720218', '41112', 'Mayport / St. Johns River entrance')
on conflict (id) do nothing;

-- Seed example alert rules (display + future notification wiring).
insert into public.mw_alert_rules (name, beach_id, min_score, wind_dir_min, wind_dir_max, max_wind_kt, channel, enabled) values
  ('Mickler''s prime NE window', 'micklers',     75, 20, 70, 20, 'email', true),
  ('Any beach firing',            null,          85, null, null, null, 'push',  true),
  ('St. Augustine moderate',      'st-augustine', 65, 0,  90,  18, 'sms',   false)
on conflict do nothing;
