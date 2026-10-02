-- Review queue for public Instagram posts found by the hashtag job
-- (worker/run.ts instagram-hashtags). Each row is one post, with the location
-- the job inferred from its caption/photo. Approving a row on /admin/instagram
-- publishes it to mw_sightings; nothing reaches the public site before that.
-- Safe to re-run: every statement is idempotent.

create table if not exists public.mw_instagram_candidates (
  id                   uuid primary key default gen_random_uuid(),
  -- Instagram media id; the job skips ids it has already stored.
  media_id             text not null unique,
  permalink            text not null,
  media_type           text,
  -- Instagram CDN URL; expires after a few days, so the review page embeds
  -- the permalink instead and only uses this as a fallback.
  media_url            text,
  caption              text,
  hashtags             text[] not null default '{}',
  posted_at            timestamptz not null,
  -- Hashtag search never returns the author; the reviewer fills it in.
  source_handle        text,

  -- Inferred location. method: 'caption' (known place named in the caption or
  -- hashtags), 'ai' (Claude read the caption and photo), or 'none'.
  location_method      text not null default 'none',
  location_name        text,
  lat                  double precision,
  lon                  double precision,
  location_confidence  text not null default 'none',
  location_evidence    text,
  -- Nearest tracked station to the inferred point.
  beach_id             text references public.mw_beaches(id) on delete set null,
  station_distance_km  double precision,

  -- Claude's read of whether this is a real mullet-run report (null when the
  -- AI step is not configured), plus suggested sighting fields.
  ai_is_report         boolean,
  ai_reason            text,
  ai_summary           text,
  ai_school_size       text,
  ai_error             text,

  status               text not null default 'pending',
  sighting_id          uuid references public.mw_sightings(id) on delete set null,
  reviewed_at          timestamptz,
  reviewed_by          text,
  created_at           timestamptz not null default now(),

  constraint mw_instagram_candidates_status_check
    check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  constraint mw_instagram_candidates_method_check
    check (location_method in ('caption', 'ai', 'none')),
  constraint mw_instagram_candidates_confidence_check
    check (location_confidence in ('high', 'medium', 'low', 'none')),
  constraint mw_instagram_candidates_school_size_check
    check (ai_school_size is null or ai_school_size in ('small', 'medium', 'large', 'huge')),
  constraint mw_instagram_candidates_location_pair
    check ((lat is null) = (lon is null))
);

create index if not exists mw_instagram_candidates_queue_idx
  on public.mw_instagram_candidates(status, posted_at desc);

-- Server-only: the job and the admin page use the service role key, which
-- bypasses RLS. No public policies, so captions under review stay private.
alter table public.mw_instagram_candidates enable row level security;
