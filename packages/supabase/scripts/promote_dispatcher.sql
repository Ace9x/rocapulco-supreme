-- promote_dispatcher.sql
-- Run this in Supabase SQL Editor after the user has OTP'd in at least once.
--
-- USAGE:
--   1. Replace +1XXXXXXXXXX with the full E.164 phone number of the person
--      you want to promote (e.g. +14155552671)
--   2. Run the UPDATE statement
--   3. Verify with the SELECT statement
--
-- NOTE: The phone number must already exist in auth.users (the person must
--       have completed OTP login at least once before you run this).

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 1: Promote the user to dispatcher role
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles
SET role = 'dispatcher'
WHERE phone = '+1XXXXXXXXXX';   -- ← replace with real phone number

-- ─────────────────────────────────────────────────────────────────────────────
-- Step 2: Verify the change
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  p.id,
  p.phone,
  p.role,
  p.display_name,
  p.created_at,
  u.email,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.phone = '+1XXXXXXXXXX';   -- ← same phone number as above

-- Expected output: role = 'dispatcher'
-- If the query returns 0 rows, the user has not OTP'd in yet.
-- Have them log in first, then re-run this script.

-- ─────────────────────────────────────────────────────────────────────────────
-- Optional: Promote to admin (full access, no RLS restrictions)
-- ─────────────────────────────────────────────────────────────────────────────

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE phone = '+1XXXXXXXXXX';
