-- Gulf Coast + Panhandle expansion, hourly feature log, and alert delivery log.
-- Safe to re-run: every statement is idempotent.

-- 1. Station metadata for both coasts. The code catalog (src/lib/beaches.ts)
--    is the source of truth; these rows mirror it so sightings, sighting
--    checks, and cached conditions can reference every station.
alter table public.mw_beaches
  add column if not exists coast text not null default 'atlantic',
  add column if not exists region text,
  add column if not exists station_type text not null default 'beach',
  add column if not exists temp_buoy_station text,
  add column if not exists usgs_site text;

alter table public.mw_beaches
  drop constraint if exists mw_beaches_coast_check,
  add constraint mw_beaches_coast_check check (coast in ('atlantic', 'gulf')),
  drop constraint if exists mw_beaches_station_type_check,
  add constraint mw_beaches_station_type_check check (station_type in ('beach', 'pass', 'river'));

insert into public.mw_beaches
  (id, name, lat, lon, priority, tide_station, buoy_station, nws_note, coast, region, station_type, temp_buoy_station, usgs_site)
values
  ('micklers', 'Mickler''s Landing', 30.2016, -81.3702, 100, '8720218', '41117', 'Ponte Vedra Beach; tide via Mayport station', 'atlantic', 'northeast-florida', 'beach', null, null),
  ('jax-beach', 'Jacksonville Beach', 30.2775, -81.3933, 60, '8720218', '41117', 'Tide via Mayport station', 'atlantic', 'northeast-florida', 'beach', null, null),
  ('st-augustine', 'St. Augustine Beach', 29.8497, -81.2653, 55, '8720587', '41117', 'St. Augustine Beach station', 'atlantic', 'northeast-florida', 'beach', null, null),
  ('mayport', 'Mayport', 30.3936, -81.4137, 50, '8720218', '41112', 'Mayport / St. Johns River entrance', 'atlantic', 'northeast-florida', 'pass', null, null),
  ('ponce-inlet', 'Ponce Inlet', 29.0808, -80.925, 45, '8721147', '41009', 'Ponce de Leon Inlet; offshore conditions via Canaveral buoy', 'atlantic', 'space-coast', 'pass', null, null),
  ('cocoa-beach', 'Cocoa Beach', 28.3206, -80.6076, 40, '8721604', '41009', 'Space Coast; tide via Trident Pier', 'atlantic', 'space-coast', 'beach', null, null),
  ('sebastian-inlet', 'Sebastian Inlet', 27.8609, -80.4483, 35, '8722004', '41114', 'Sebastian Inlet; nearshore conditions via Fort Pierce buoy', 'atlantic', 'space-coast', 'pass', null, null),
  ('fort-pierce', 'Fort Pierce', 27.4467, -80.3256, 30, '8722212', '41114', 'Fort Pierce Inlet', 'atlantic', 'treasure-coast', 'pass', null, null),
  ('jupiter-inlet', 'Jupiter Inlet', 26.9434, -80.073, 25, '8722495', '41122', 'Jupiter Inlet; nearshore conditions via Hollywood buoy', 'atlantic', 'treasure-coast', 'pass', null, null),
  ('fort-lauderdale', 'Fort Lauderdale', 26.1224, -80.104, 20, '8722956', '41122', 'South Florida; tide via South Port Everglades', 'atlantic', 'southeast-florida', 'beach', null, null),
  ('miami-beach', 'Miami Beach', 25.7907, -80.13, 15, '8723170', '41122', 'Miami Beach; tide via Miami Beach Government Cut', 'atlantic', 'southeast-florida', 'beach', null, null),
  ('pensacola-pass', 'Pensacola Pass', 30.3233, -87.294, 90, '8729840', 'pclf1', 'Pensacola Pass off Fort Pickens; wind/pressure via Pensacola NOS station (wind falls back to forecast models)', 'gulf', 'panhandle', 'pass', null, '02376033'),
  ('navarre-beach', 'Navarre Beach', 30.379, -86.865, 89, '8729678', 'pclf1', 'Navarre Beach pier and surf; met via Pensacola NOS station', 'gulf', 'panhandle', 'beach', null, null),
  ('destin-east-pass', 'Destin East Pass', 30.3935, -86.5135, 88, '8729511', 'pcbf1', 'East Pass, Destin — Choctawhatchee Bay outflow; met via Panama City Beach', 'gulf', 'panhandle', 'pass', null, '02366500'),
  ('st-andrew-pass', 'St. Andrew Pass', 30.125, -85.733, 87, '8729136', 'pcbf1', 'St. Andrew Bay entrance at St. Andrews State Park', 'gulf', 'panhandle', 'pass', null, null),
  ('cape-san-blas', 'Cape San Blas', 29.764, -85.402, 86, '8728978', 'apcf1', 'St. Joseph Peninsula and Cape San Blas surf; met via Apalachicola', 'gulf', 'panhandle', 'beach', null, null),
  ('st-george-island', 'St. George Island (Sikes Cut)', 29.613, -84.958, 85, '8728669', 'apcf1', 'Bob Sikes Cut — Apalachicola Bay outflow', 'gulf', 'panhandle', 'pass', null, '02358700'),
  ('st-marks', 'St. Marks River Mouth', 30.078, -84.178, 84, '8728130', 'apcf1', 'St. Marks River entrance on Apalachee Bay; met via Apalachicola', 'gulf', 'big-bend', 'river', null, '02326900'),
  ('steinhatchee', 'Steinhatchee River', 29.672, -83.39, 83, '8727695', 'ktnf1', 'Steinhatchee River entrance at Deadman Bay; wind via Keaton Beach, water temp via Cedar Key', 'gulf', 'big-bend', 'river', 'ckyf1', '02324170'),
  ('cedar-key-suwannee', 'Cedar Key & Suwannee River', 29.137, -83.035, 82, '8727520', 'ckyf1', 'Cedar Key and the Suwannee River mouth', 'gulf', 'big-bend', 'river', null, '02323500'),
  ('crystal-river', 'Crystal River', 28.905, -82.72, 81, '8727333', 'ckyf1', 'Crystal River mouth and Crystal Bay; met via Cedar Key', 'gulf', 'big-bend', 'river', null, '02310750'),
  ('homosassa', 'Homosassa River', 28.772, -82.695, 80, '8727277', 'ckyf1', 'Homosassa River mouth; met via Cedar Key', 'gulf', 'big-bend', 'river', null, '02310700'),
  ('egmont-fort-desoto', 'Egmont Key & Fort De Soto', 27.615, -82.735, 79, '8726347', 'sapf1', 'Egmont Key and Fort De Soto at the Tampa Bay mouth', 'gulf', 'tampa-bay', 'pass', null, null),
  ('anna-maria', 'Anna Maria Island', 27.533, -82.73, 78, '8726282', 'sapf1', 'Passage Key Inlet and the Anna Maria Island beaches', 'gulf', 'tampa-bay', 'pass', null, null),
  ('longboat-pass', 'Longboat Pass', 27.44, -82.69, 77, '8726089', 'sapf1', 'Longboat Pass between Anna Maria Island and Longboat Key', 'gulf', 'sarasota-charlotte', 'pass', null, null),
  ('venice-inlet', 'Venice Inlet', 27.112, -82.465, 76, '8725889', 'venf1', 'Venice Inlet jetties; wind via Venice station, water temp via WFS buoy C10', 'gulf', 'sarasota-charlotte', 'pass', '42013', null),
  ('stump-pass', 'Stump Pass', 26.9, -82.345, 75, '8725685', 'venf1', 'Stump Pass, Englewood; tide via Don Pedro Island', 'gulf', 'sarasota-charlotte', 'pass', '42013', null),
  ('boca-grande-pass', 'Boca Grande Pass', 26.717, -82.26, 74, '8725577', 'fmrf1', 'Boca Grande Pass — Charlotte Harbor outflow; met via Fort Myers', 'gulf', 'sarasota-charlotte', 'pass', null, '02296750'),
  ('redfish-pass', 'Redfish Pass', 26.55, -82.197, 73, '8725441', 'fmrf1', 'Redfish Pass between Captiva and North Captiva', 'gulf', 'southwest-florida', 'pass', null, null),
  ('sanibel', 'Sanibel (Blind Pass)', 26.483, -82.183, 72, '8725383', 'fmrf1', 'Blind Pass and the Sanibel/Captiva beaches', 'gulf', 'southwest-florida', 'beach', null, null),
  ('wiggins-pass', 'Wiggins Pass', 26.29, -81.818, 71, '8725235', 'fmrf1', 'Wiggins Pass at Delnor-Wiggins State Park', 'gulf', 'southwest-florida', 'pass', null, null),
  ('naples', 'Naples', 26.132, -81.808, 70, '8725110', 'fmrf1', 'Naples Pier and beaches', 'gulf', 'southwest-florida', 'beach', null, null),
  ('marco-island', 'Marco Island (Caxambas Pass)', 25.908, -81.728, 69, '8724967', 'fmrf1', 'Caxambas Pass, Marco Island', 'gulf', 'southwest-florida', 'pass', null, null)
on conflict (id) do update set
  name = excluded.name,
  lat = excluded.lat,
  lon = excluded.lon,
  priority = excluded.priority,
  tide_station = excluded.tide_station,
  buoy_station = excluded.buoy_station,
  nws_note = excluded.nws_note,
  coast = excluded.coast,
  region = excluded.region,
  station_type = excluded.station_type,
  temp_buoy_station = excluded.temp_buoy_station,
  usgs_site = excluded.usgs_site;

create index if not exists mw_beaches_coast_idx on public.mw_beaches(coast);

-- 2. Hourly feature log: every station's inputs and score, once per hour.
--    This is the training set for a future model once outcomes accumulate.
create table if not exists public.mw_feature_log (
  id             bigint generated always as identity primary key,
  beach_id       text not null references public.mw_beaches(id) on delete cascade,
  observed_hour  timestamptz not null,
  coast          text not null,
  model          text,
  score          integer not null,
  rating         text not null,
  features       jsonb not null,
  created_at     timestamptz not null default now(),
  unique (beach_id, observed_hour)
);
create index if not exists mw_feature_log_hour_idx on public.mw_feature_log(observed_hour desc);

-- Server-only (the service role bypasses RLS); no public policies.
alter table public.mw_feature_log enable row level security;

-- 3. Alert delivery log: one row per rule, station, and Eastern calendar day,
--    so the hourly job never emails the same alert twice in a day.
create table if not exists public.mw_alert_log (
  id           uuid primary key default gen_random_uuid(),
  rule_id      uuid not null references public.mw_alert_rules(id) on delete cascade,
  beach_id     text not null references public.mw_beaches(id) on delete cascade,
  window_key   text not null,
  score        integer,
  status       text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_id  text,
  sent_at      timestamptz,
  created_at   timestamptz not null default now(),
  unique (rule_id, beach_id, window_key)
);
alter table public.mw_alert_log enable row level security;
