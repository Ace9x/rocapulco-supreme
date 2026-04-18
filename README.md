# Rocapulco Supreme

Premium ride-hailing monorepo for Far Rockaway.

```
apps/
  mobile/      Expo rider app (React Native + expo-router)
  dispatch/    Dispatch dashboard (React + Vite)
packages/
  shared/      Types + fare calc shared across apps
  supabase/    SQL schema + seed data
```

## End-to-end flow wired in this cut

Phone OTP → book ride → dispatch assigns driver → rider sees driver live.

Everything else from the prototype (driver app, payments, navigation deep links,
push notifications, SMS templates) is deliberately not here yet.

## Prereqs

- Node 20.11+
- pnpm 9
- A Supabase project with phone auth enabled (Twilio wired in via the dashboard)
- Expo Go on a physical device (or a simulator)

## Setup

```bash
pnpm install

cp apps/mobile/.env.example apps/mobile/.env
cp apps/dispatch/.env.example apps/dispatch/.env
# fill in SUPABASE_URL / SUPABASE_ANON_KEY in both

# apply schema + seed to your Supabase project (see packages/supabase/README.md)
```

Promote your dispatcher account:

```sql
update public.profiles set role = 'dispatcher' where phone = '+1XXXXXXXXXX';
```

## Run

```bash
pnpm mobile start       # Expo dev server; scan QR in Expo Go
pnpm dispatch dev       # Vite dev server on :5173
```

## Reference prototype

The original single-file visual prototype lives at `RocapulcoSupreme.jsx`. Kept
as a UI reference while the production screens catch up.
