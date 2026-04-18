# Rocapulco Supreme — Setup Guide (30–45 min)

This guide gets you from zero to a working dispatch app with Supabase phone auth and Twilio SMS OTP.

---

## Prerequisites

- Node.js 18+ and pnpm installed locally
- A smartphone with Expo Go installed
- A credit card (Twilio requires one even for trial)

---

## Step 1 — Create a Supabase Project (~5 min)

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `rocapulco`), pick a region close to you, set a strong DB password
3. Wait ~2 min for provisioning
4. In the left sidebar → **Project Settings → API**
   - Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Save both values — you'll need them for Vercel and your `.env.local`

---

## Step 2 — Run the Database Migrations (~5 min)

In the Supabase dashboard → **SQL Editor** → **New query**

Paste and run each migration in order:

### Migration 1 — Core schema (profiles + trigger)

```sql
-- profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  role text not null default 'driver' check (role in ('driver', 'dispatcher', 'admin')),
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Migration 2 — Jobs / dispatch schema

```sql
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  status text not null default 'pending'
    check (status in ('pending','assigned','in_progress','completed','cancelled')),
  pickup_address text not null,
  dropoff_address text not null,
  driver_id uuid references public.profiles(id),
  dispatcher_id uuid references public.profiles(id),
  notes text
);

alter table public.jobs enable row level security;

-- Dispatchers and admins see and manage all jobs
create policy "Dispatchers manage all jobs"
  on public.jobs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('dispatcher','admin')
    )
  );

-- Drivers see only their own assigned jobs
create policy "Drivers see own jobs"
  on public.jobs for select
  using (driver_id = auth.uid());
```

---

## Step 3 — Create Twilio Account and Wire Phone Auth (~10 min)

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio) → sign up (free trial ~$15 credit)
2. Verify your own phone number during signup
3. Console → **Get a phone number** → pick any US number
4. Note your:
   - **Account SID** (starts with `AC…`)
   - **Auth Token** (click to reveal)
   - **Phone number** (e.g. `+15005550006` for Twilio test, or your real number)

> **Trial account limitation:** You can only SMS to Verified Caller IDs. Go to
> **Console → Phone Numbers → Verified Caller IDs** and add each driver/dispatcher
> phone before they log in. Upgrade to a paid account to lift this restriction.

### Wire Twilio into Supabase Auth

1. Supabase dashboard → **Authentication → Providers → Phone**
2. Toggle **Enable Phone provider** ON
3. Set **SMS provider** → **Twilio**
4. Paste **Account SID**, **Auth Token**, and your **Twilio phone number**
5. Set **OTP expiry** → `600` (10 minutes)
6. **Save**

---

## Step 4 — OTP In as Yourself and Promote to Dispatcher (~5 min)

1. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env.local
   # Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. Install dependencies and start Expo:
   ```bash
   pnpm install
   pnpm --filter expo-app dev   # or: npx expo start
   ```

3. Scan the QR code in Expo Go on your phone
4. Enter your phone number → receive SMS OTP → enter it → you're in as `driver` (default)

5. Open Supabase SQL Editor and run **promote_dispatcher.sql** (see `packages/supabase/scripts/`):
   ```sql
   -- substitute YOUR actual phone number
   update public.profiles
   set role = 'dispatcher'
   where phone = '+1XXXXXXXXXX';
   ```

6. Verify: in the Supabase **Table Editor → profiles** — your row should show `role = dispatcher`

---

## Step 5 — Onboard a Driver (~2 min)

Have the driver:
1. Open Expo Go and OTP in with their own phone number

Then (optional) confirm their profile exists:
```sql
-- run onboard_driver.sql — substitute driver's phone
select * from public.profiles where phone = '+1XXXXXXXXXX';
```

If the row is missing (trigger didn't fire), insert manually:
```sql
insert into public.profiles (id, phone)
select id, phone from auth.users where phone = '+1XXXXXXXXXX'
on conflict do nothing;
```

---

## Step 6 — Deploy Dispatch App to Vercel (~5 min)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import this GitHub repo
2. Vercel auto-detects `vercel.json` at the repo root — **no extra dashboard config needed**
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy** (takes ~90 sec)
5. Share the production URL with dispatchers — done!

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Twilio error 21608 | Trial accounts can only SMS verified numbers. Add phone in Console → Verified Caller IDs |
| RLS policy denied on jobs | Confirm `promote_dispatcher.sql` ran. Check profiles table — role must be `dispatcher` |
| OTP never arrives | Check Twilio Console → Monitor → Logs → Messaging for errors |
| Vercel build fails | Confirm both `NEXT_PUBLIC_` env vars are set in Vercel project settings |
| `pnpm install` fails | Ensure Node 18+ and pnpm 8+. Run `corepack enable && corepack prepare pnpm@latest --activate` |
| Expo app white screen | Check Metro bundler console for missing env vars or import errors |

---

## First-Test Checklist

Run through these after setup to confirm everything works end-to-end:

- [ ] SMS OTP received and login succeeds in Expo Go
- [ ] Row appears in `profiles` table immediately after first login
- [ ] After promote SQL, your profile shows `role = dispatcher`
- [ ] Dispatch web app loads at Vercel production URL
- [ ] Dispatcher can create a job in the dispatch UI
- [ ] Driver can see their assigned job in Expo Go
- [ ] Job status updates propagate in real time (Supabase Realtime)
