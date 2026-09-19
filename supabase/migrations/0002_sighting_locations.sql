-- Add optional browser-geolocation coordinates for the live migration map.
-- Existing reports remain valid and are plotted at their selected beach.

alter table public.mw_sightings
  add column if not exists lat double precision,
  add column if not exists lon double precision,
  add column if not exists location_accuracy_m double precision;

alter table public.mw_sightings
  drop constraint if exists mw_sightings_lat_range,
  add constraint mw_sightings_lat_range
    check (lat is null or lat between 24.0 and 31.2),
  drop constraint if exists mw_sightings_lon_range,
  add constraint mw_sightings_lon_range
    check (lon is null or lon between -88.0 and -79.5),
  drop constraint if exists mw_sightings_location_pair,
  add constraint mw_sightings_location_pair
    check ((lat is null) = (lon is null)),
  drop constraint if exists mw_sightings_accuracy_positive,
  add constraint mw_sightings_accuracy_positive
    check (location_accuracy_m is null or location_accuracy_m >= 0);

create index if not exists mw_sightings_location_idx
  on public.mw_sightings(lat, lon)
  where lat is not null and lon is not null;

-- Expand the original Northeast Florida stations down the Atlantic migration
-- corridor. These locations power both the condition scores and report form.
insert into public.mw_beaches
  (id, name, lat, lon, priority, tide_station, buoy_station, nws_note)
values
  ('ponce-inlet',      'Ponce Inlet',      29.0808, -80.9250, 45, '8721147', '41009', 'Ponce de Leon Inlet; offshore conditions via Canaveral buoy'),
  ('cocoa-beach',      'Cocoa Beach',      28.3206, -80.6076, 40, '8721604', '41009', 'Space Coast; tide via Trident Pier'),
  ('sebastian-inlet',  'Sebastian Inlet',  27.8609, -80.4483, 35, '8722004', '41114', 'Sebastian Inlet; nearshore conditions via Fort Pierce buoy'),
  ('fort-pierce',      'Fort Pierce',       27.4467, -80.3256, 30, '8722212', '41114', 'Fort Pierce Inlet'),
  ('jupiter-inlet',    'Jupiter Inlet',     26.9434, -80.0730, 25, '8722495', '41122', 'Jupiter Inlet; nearshore conditions via Hollywood buoy'),
  ('fort-lauderdale',  'Fort Lauderdale',  26.1224, -80.1040, 20, '8722956', '41122', 'South Florida; tide via South Port Everglades'),
  ('miami-beach',      'Miami Beach',       25.7907, -80.1300, 15, '8723170', '41122', 'Miami Beach; tide via Miami Beach Government Cut')
on conflict (id) do update set
  name = excluded.name,
  lat = excluded.lat,
  lon = excluded.lon,
  priority = excluded.priority,
  tide_station = excluded.tide_station,
  buoy_station = excluded.buoy_station,
  nws_note = excluded.nws_note;
