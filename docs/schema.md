# Growth OS Data Model

The app starts with JSON-backed local stores so the product surface can be tested before connecting Supabase.

When `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` is present with `SUPABASE_SERVICE_ROLE_KEY`, lead and event reads/writes use Supabase instead. Without the server-side service role key, the app falls back to `data/*.json`.

Run the schema in `supabase/schema.sql` from the Supabase SQL editor before enabling the environment variables.

## Tables

### campaigns

Currently defined in `lib/campaigns.ts`.

- `slug`
- `path`
- `audience`
- `title`
- `description`
- `thank_you_path`
- `next_url`

### leads

Stored in `data/leads.json`.

- `id`
- `created_at`
- `campaign_slug`
- `campaign_path`
- `name`
- `email`
- `role`
- `goal`
- `source`
- `score`
- `status`
- `tags`
- `utm`
- `next_url`

### lead_events

Stored in `data/lead_events.json`.

- `id`
- `created_at`
- `lead_id`
- `event`
- `metadata`

### agent_runs

Reserved in `data/agent_runs.json` for AI scoring, tagging, draft generation, and recommendations.

### message_drafts

Reserved in `data/message_drafts.json` for human-approved follow-up drafts.

### suppression_list

Reserved in `data/suppression_list.json` for unsubscribes, blocked emails, and no-contact records.

## FanFactors Handoff

Lead capture creates a tracked URL like:

```text
https://fanfaktors.com/signup?persona=artist&lead_id=...&utm_campaign=artist-lead-magnet&utm_source=growth_os
```

FanFactors can later POST activation events back to:

```text
POST /api/events
{
  "lead_id": "...",
  "event": "artist_profile_created"
}
```
