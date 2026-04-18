-- Promote a signed-up user to dispatcher.
-- 1. They sign in via the mobile app (phone OTP + name).
-- 2. Replace the phone number below with theirs.
-- 3. Run this in the Supabase SQL editor.

update public.profiles
set role = 'dispatcher'
where phone = '+1XXXXXXXXXX';

-- Verify:
select id, phone, full_name, role from public.profiles where phone = '+1XXXXXXXXXX';
