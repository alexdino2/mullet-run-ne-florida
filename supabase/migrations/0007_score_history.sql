-- Public score history for the beach pages.
--
-- mw_feature_log stays server-only (no public policies). This function
-- exposes a narrow slice of it — one station's hourly score, rating, and a
-- few headline readings for at most the last 31 days — so the site can
-- server-render each beach's season history with only the anon key.
-- Idempotent: safe to re-run.

create or replace function public.mw_score_history(
  p_beach_id text,
  p_days     integer default 14
)
returns table (
  observed_hour timestamptz,
  score         integer,
  rating        text,
  wind_kt       numeric,
  wind_dir_deg  numeric,
  water_temp_f  numeric,
  tide_stage    text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.observed_hour,
    f.score,
    f.rating,
    (f.features ->> 'wind_kt')::numeric,
    (f.features ->> 'wind_dir_deg')::numeric,
    (f.features ->> 'water_temp_f')::numeric,
    f.features ->> 'tide_stage'
  from public.mw_feature_log f
  where f.beach_id = p_beach_id
    and f.observed_hour >= now() - make_interval(days => least(greatest(coalesce(p_days, 14), 1), 31))
  order by f.observed_hour;
$$;

revoke all on function public.mw_score_history(text, integer) from public;
grant execute on function public.mw_score_history(text, integer) to anon, authenticated, service_role;

-- Lookups use the (beach_id, observed_hour) unique index from 0005.
