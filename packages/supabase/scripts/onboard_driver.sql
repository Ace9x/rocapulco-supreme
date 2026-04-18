-- Onboard a real driver.
-- 1. Driver signs in via the mobile app first (phone OTP + name) — this
--    creates their auth.users row + profiles row with role='rider'.
-- 2. Fill in the placeholders below and run in the Supabase SQL editor.

-- ── INPUTS ──────────────────────────────────────────────
-- Replace these before running:
--   :phone    Driver's phone in E.164 format, e.g. '+19175550123'
--   :name     Full legal name, e.g. 'Jason Morales'
--   :vehicle  Year + make + model, e.g. '2024 Cadillac Escalade'
--   :plate    License plate, e.g. 'NYC-7100'

update public.profiles
set role = 'driver'
where phone = '+1XXXXXXXXXX';  -- ← driver's phone

insert into public.drivers (profile_id, name, phone, vehicle, plate, status)
select id,
       'Driver Full Name',             -- ← driver's name
       phone,
       '2024 Cadillac Escalade',       -- ← vehicle
       'NYC-0000',                     -- ← plate
       'offline'
from public.profiles
where phone = '+1XXXXXXXXXX';          -- ← driver's phone (same as above)

-- Verify — this should return exactly 1 row with the profile linked:
select d.id, d.name, d.vehicle, d.plate, d.status, p.role
from public.drivers d
join public.profiles p on p.id = d.profile_id
where d.phone = '+1XXXXXXXXXX';        -- ← driver's phone
