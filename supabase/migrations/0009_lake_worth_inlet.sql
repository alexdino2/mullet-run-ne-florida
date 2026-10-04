-- Lake Worth Inlet (Palm Beach Inlet) station, between Jupiter Inlet and
-- Fort Lauderdale. Mirrors the code catalog in src/lib/beaches.ts so
-- sightings, sighting checks, and cached conditions can reference it.
-- Idempotent: safe to re-run.

insert into public.mw_beaches
  (id, name, lat, lon, priority, tide_station, buoy_station, nws_note, coast, region, station_type, temp_buoy_station, usgs_site)
values
  ('lake-worth-inlet', 'Lake Worth Inlet', 26.7725, -80.0365, 22, '8722588', '41122', 'Palm Beach Inlet at Singer Island; tide via Port of West Palm Beach', 'atlantic', 'southeast-florida', 'pass', null, null)
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
