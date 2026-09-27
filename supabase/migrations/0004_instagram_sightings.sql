-- Attach curated public Instagram posts and Reels to beach sightings.
-- The original permalink is stored; Instagram media is never copied.

alter table public.mw_sightings
  add column if not exists source_type text not null default 'eyewitness',
  add column if not exists source_url text,
  add column if not exists source_handle text,
  add column if not exists verification_status text not null default 'unverified';

alter table public.mw_sightings
  drop constraint if exists mw_sightings_source_type_check,
  add constraint mw_sightings_source_type_check
    check (source_type in ('eyewitness', 'instagram')),
  drop constraint if exists mw_sightings_verification_status_check,
  add constraint mw_sightings_verification_status_check
    check (verification_status in ('unverified', 'verified')),
  drop constraint if exists mw_sightings_instagram_source_check,
  add constraint mw_sightings_instagram_source_check
    check (
      (source_type = 'eyewitness' and source_url is null)
      or
      (
        source_type = 'instagram'
        and source_url ~ '^https://www\.instagram\.com/(p|reel)/[A-Za-z0-9_-]+/$'
      )
    ),
  drop constraint if exists mw_sightings_source_handle_check,
  add constraint mw_sightings_source_handle_check
    check (
      source_handle is null
      or source_handle ~ '^[a-z0-9._]{1,30}$'
    );

create unique index if not exists mw_sightings_source_url_unique_idx
  on public.mw_sightings(source_url)
  where source_url is not null;
