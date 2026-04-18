# Live test setup

Step-by-step to go from zero to a real rider hailing a real ride. Should take
~30–45 minutes. Do the steps in order.

## 1. Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Name: `rocapulco-prod`. Region: `us-east-1`. Set a DB password and save it.
3. When it's provisioned, open **Project Settings → API** and copy:
   - `Project URL`
   - `anon` `public` key
4. Paste those into both `.env` files:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   cp apps/dispatch/.env.example apps/dispatch/.env
   # fill in SUPABASE_URL and SUPABASE_ANON_KEY in both
   ```

## 2. Apply the schema (2 min)

In the Supabase dashboard → **SQL Editor → New query**, paste the contents of:

1. `packages/supabase/migrations/0001_initial.sql` — run
2. `packages/supabase/migrations/0002_metered_fares_and_driver_visibility.sql` — run

Leave `packages/supabase/seed.sql` alone — it's intentionally empty so no fake
drivers ship.

## 3. Twilio account for SMS OTP (10–15 min)

You need Twilio to send the login codes. Supabase won't send them for you.

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio). Add
   payment (you'll use ~$0.01/SMS).
2. On the Twilio console home, copy:
   - **Account SID**
   - **Auth Token**
3. Go to **Messaging → Services → Create Messaging Service**.
   - Name: `Rocapulco OTP`
   - Use case: `Verify users`
4. In the service, **Add Senders → Phone number**. Buy a US local number
   (~$1.15/mo) or use the trial number for first tests.
5. Copy the **Messaging Service SID** (starts with `MG...`).

## 4. Wire Twilio into Supabase phone auth (3 min)

In the Supabase dashboard → **Authentication → Providers → Phone**:

1. Toggle **Enable phone provider** on.
2. **SMS provider**: Twilio
3. Paste **Twilio Account SID**, **Auth Token**, **Messaging Service SID**.
4. Set **OTP expiry**: `600` seconds (10 min).
5. Set **OTP length**: `6`.
6. **Save**.

Smoke test: in the same page there's a **Send test SMS** option. Use your own
number. If you don't get the code, fix Twilio before moving on.

## 5. Promote yourself to dispatcher (3 min)

1. In one terminal: `pnpm mobile start`
2. Install [Expo Go](https://expo.dev/go) on your phone, scan the QR code.
3. Enter your phone number, get the OTP, verify, enter your name.
4. Back in the Supabase SQL editor, paste `packages/supabase/scripts/promote_dispatcher.sql`,
   change `'+1XXXXXXXXXX'` to your actual phone, run.
5. Sign out of Expo Go (you'll sign back in on the dispatch dashboard).

## 6. Onboard your first driver (5 min)

1. Hand Expo Go to the driver. They enter their phone, OTP, name.
2. Sign out.
3. In the SQL editor, paste `packages/supabase/scripts/onboard_driver.sql`,
   fill in phone + name + vehicle + plate, run.
4. Driver signs back in — they should now land on the driver home screen with
   the online toggle.

## 7. Deploy the dispatch dashboard (10 min)

**Option A — Vercel (recommended):**

1. `vercel.json` at the repo root already targets the dispatch app.
2. Go to [vercel.com/new](https://vercel.com/new), import the
   `Ace9x/rocapulco-supreme` repo.
3. **Leave Root Directory at the default** (repo root). Vercel will pick up
   `vercel.json` and install via pnpm workspaces automatically.
4. **Environment variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   (same values as your mobile `.env`).
5. Deploy. Bookmark the URL.

**Option B — run locally on your laptop:**

```bash
pnpm dispatch dev
# visit http://localhost:5173
```

## 8. Run the first real test

1. Dispatch dashboard: sign in (your phone number → OTP).
2. Driver's phone (Expo Go): they flip the **Online** switch.
3. Rider's phone (Expo Go, separate account): OTP in, type a name, tap
   **Use my location**, type `JFK Terminal 4` as dropoff, tap **Request ride**.
4. Dispatcher sees the pending ride, picks the driver, hits **Assign**.
5. Driver's phone: the ride shows up. Tap **Start driving** → **I've arrived**
   → **Start trip** → **Complete trip**.

Rider's screen tracks every state change live, including the driver's GPS
coordinates.

## Known limitations on first test

- **Cash on completion** — Stripe isn't wired yet. Driver collects cash when
  they hit Complete.
- **No map view** — the rider sees the driver's coordinates as numbers, not a
  moving dot. A MapView comes in the next cut.
- **App icon** — default Expo placeholder. Branding comes with the EAS build.
- **Expo Go only** — for a polished install on the App Store / Play Store, we
  need `eas build` + store submissions. That's a separate ~2-day process.

## Costs for a first week of testing

- Supabase free tier: $0
- Twilio SMS: ~$0.01/OTP × maybe 50 OTPs = $0.50
- Twilio phone number: $1.15
- Vercel hobby tier: $0
- **Total: ~$2**
