-- onboard_driver.sql
-- Run this in Supabase SQL Editor to verify a driver is properly onboarded
-- and optionally backfill their profile if the trigger didn't fire.
--
-- USAGE:
--   1. Have the driver OTP in via Expo Go first (creates their auth.users row)
--   2. Replace +1XXXXXXXXXX with the driver's full E.164 phone number
--   3. Run Step 1 to check if their profile exists
--   4. If profile is missing, run Step 2 to backfill it
--   5. Optionally run Step 3 to set their display name

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 1: Check if the driver's profile exists
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  p.id,
  p.phone,
  p.role,
  p.display_name,
  p.created_at,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.phone = '+1XXXXXXXXXX';   -- ← replace with driver's phone number

-- If this returns 1 row with role = 'driver', the driver is correctly onboarded.
-- If it returns 0 rows, the auto-trigger didn't fire — run Step 2 below.

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2: Backfill profile if missing (only if Step 1 returned 0 rows)
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT INTO public.profiles (id, phone, role)
-- SELECT id, phone, 'driver'
-- FROM auth.users
-- WHERE phone = '+1XXXXXXXXXX'    -- ← replace with driver's phone number
-- ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 3: Set driver display name (optional but nice for the dispatcher UI)
-- ─────────────────────────────────────────────────────────────────────────────

-- UPDATE public.profiles
-- SET display_name = 'Driver Name Here'   -- ← replace with driver's name
-- WHERE phone = '+1XXXXXXXXXX';           -- ← replace with driver's phone number

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 4: List all drivers (useful sanity check)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  p.phone,
  p.display_name,
  p.role,
  p.created_at,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'driver'
ORDER BY p.created_at DESC;
