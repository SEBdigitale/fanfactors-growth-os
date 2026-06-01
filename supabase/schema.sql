create extension if not exists pgcrypto;

do $$ begin
  create type lead_status as enum ('new', 'qualified', 'nurture', 'suppressed');
exception
  when duplicate_object then null;
end $$;

create table if not exists campaigns (
  slug text primary key,
  path text not null unique,
  audience text not null,
  title text not null,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign_slug text not null,
  campaign_path text not null,
  name text not null,
  email text not null,
  role text not null,
  goal text not null,
  source text not null default '',
  score integer not null default 0 check (score >= 0 and score <= 100),
  status lead_status not null default 'new',
  tags text[] not null default '{}',
  utm jsonb not null default '{}'::jsonb,
  next_url text not null,
  consent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_campaign_slug_idx on leads (campaign_slug);
create index if not exists leads_email_idx on leads (email);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_score_idx on leads (score desc);
create index if not exists leads_tags_idx on leads using gin (tags);
create index if not exists leads_utm_idx on leads using gin (utm);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads (id) on delete set null,
  event text not null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists lead_events_created_at_idx on lead_events (created_at desc);
create index if not exists lead_events_lead_id_idx on lead_events (lead_id);
create index if not exists lead_events_event_idx on lead_events (event);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads (id) on delete set null,
  agent_name text not null,
  status text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error text
);

create index if not exists agent_runs_lead_id_idx on agent_runs (lead_id);
create index if not exists agent_runs_status_idx on agent_runs (status);

create table if not exists message_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads (id) on delete cascade,
  channel text not null default 'email',
  subject text,
  body text not null,
  status text not null default 'draft',
  approved_at timestamptz,
  sent_at timestamptz
);

create index if not exists message_drafts_lead_id_idx on message_drafts (lead_id);
create index if not exists message_drafts_status_idx on message_drafts (status);

create table if not exists suppression_list (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  reason text not null default 'unsubscribe',
  metadata jsonb not null default '{}'::jsonb
);

alter table campaigns enable row level security;
alter table leads enable row level security;
alter table lead_events enable row level security;
alter table agent_runs enable row level security;
alter table message_drafts enable row level security;
alter table suppression_list enable row level security;

insert into campaigns (slug, path, audience, title, description)
values
  (
    'artist-lead-magnet',
    '/artist-lead-magnet',
    'Artists',
    'Turn your music into a repeat revenue engine.',
    'Artist-side lead magnet for music rights, repeat revenue, and FanFactors Alpha.'
  ),
  (
    'fan-lead-magnet',
    '/fan-lead-magnet',
    'Fans',
    'See where fans fit in the next music economy.',
    'Fan-side lead magnet for access rights, direct artist support, and FanFactors Alpha.'
  ),
  (
    'fan-waitlist',
    '/fan-waitlist',
    'Fans',
    'Join the fan layer for the new music economy.',
    'Fan waitlist campaign.'
  ),
  (
    'alpha',
    '/alpha',
    'Early access',
    'Apply for early access to FanFactors Alpha.',
    'Alpha access campaign.'
  ),
  (
    'new-music-economy',
    '/new-music-economy',
    'Market education',
    'The new music economy needs better fan ownership.',
    'Education-first market thesis campaign.'
  )
on conflict (slug) do update set
  path = excluded.path,
  audience = excluded.audience,
  title = excluded.title,
  description = excluded.description;
