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

Phone OTP → (full-name capture) → rider GPS pickup → book → dispatcher assigns
(and confirms metered fare) → driver accepts, progresses status en_route →
arrived → on_trip → completed → rider sees every state live with driver's GPS.

Payments are "cash on completion" for the first live test. Everything on the
rider/dispatcher/driver screens is live against real Supabase rows — no mock
data is seeded. Roberto onboards real drivers by inserting real rows and
linking them via `profile_id` (dispatch UI for that comes next).

## Prereqs

- Node 20.11+
- pnpm 9
- A Supabase project with phone auth enabled (Twilio wired in via the dashboard)
- Expo Go on a physical device (or a simulator)

## Setup

Full step-by-step for a live test is in **[docs/SETUP.md](docs/SETUP.md)**
(Supabase + Twilio + dispatcher/driver onboarding + Vercel deploy).

Short form:

```bash
pnpm install

cp apps/mobile/.env.example apps/mobile/.env
cp apps/dispatch/.env.example apps/dispatch/.env
# fill in SUPABASE_URL / SUPABASE_ANON_KEY in both

# apply packages/supabase/migrations/0001_initial.sql then 0002_*.sql
# wire Twilio into Supabase phone auth
# run packages/supabase/scripts/promote_dispatcher.sql and onboard_driver.sql
```

Promote your dispatcher account:

```sql
update public.profiles set role = 'dispatcher' where phone = '+1XXXXXXXXXX';
```

Onboard a driver — create the driver row AND link it to their auth profile so
the driver app can see their own rides:

```sql
-- Driver signs in with phone OTP first (auto-creates a profiles row with role='rider').
-- Then:
update public.profiles set role = 'driver' where phone = '+1XXXXXXXXXX';

insert into public.drivers (profile_id, name, phone, vehicle, plate, status)
values ((select id from public.profiles where phone = '+1XXXXXXXXXX'),
        'Driver Name', '+1XXXXXXXXXX', '2024 Cadillac Escalade', 'NYC-XXXX', 'offline');
```

## Run

```bash
pnpm mobile start       # Expo dev server; scan QR in Expo Go
pnpm dispatch dev       # Vite dev server on :5173
```

## Reference prototype

The original single-file visual prototype lives at `RocapulcoSupreme.jsx`. Kept
as a UI reference while the production screens catch up.
