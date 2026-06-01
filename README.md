# FanFactors Growth OS

A separate lead generation and campaign engine for FanFactors.

## Routes

- `/artist-lead-magnet`
- `/fan-waitlist`
- `/alpha`
- `/new-music-economy`
- `/thank-you/artist`
- `/thank-you/fan`
- `/admin/leads`

## Development

```bash
npm install
npm run dev
```

Lead submissions are stored locally in `data/leads.json` until a production database is connected.

## Supabase

Run `supabase/schema.sql` in your Supabase SQL editor, then add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Server-side lead and event storage will use Supabase when `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` is present with `SUPABASE_SERVICE_ROLE_KEY`. Local JSON remains the fallback for development.

The publishable key is safe for browser clients, but it is not enough for these API routes because the Supabase tables have Row Level Security enabled. Use the service role/secret key only on the server and never expose it as `NEXT_PUBLIC_*`.
