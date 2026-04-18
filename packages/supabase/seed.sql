-- Roberto's fleet. These drivers are standalone rows (no linked profile yet);
-- dispatchers can assign them to rides manually. Once a driver app exists,
-- claim them by setting profile_id to the driver's auth user.

insert into public.drivers (name, phone, vehicle, plate, rating, status, lat, lng) values
  ('Jason M.',    '+19175550101', '2024 Cadillac Escalade',      'NYC-7100', 4.9, 'online',  40.5920, -73.7654),
  ('Carlos R.',   '+19175550102', '2023 Cadillac XT5',           'NYC-4444', 4.8, 'online',  40.5985, -73.7510),
  ('Mike T.',     '+19175550103', '2024 Lincoln Navigator',      'NYC-3274', 5.0, 'online',  40.5870, -73.7800),
  ('David L.',    '+19175550104', '2023 Cadillac CT5',           'NYC-1167', 4.7, 'online',  40.6010, -73.7420),
  ('Roberto Jr.', '+19175550105', '2024 Cadillac Escalade ESV',  'NYC-0001', 5.0, 'online',  40.5950, -73.7560),
  ('Anthony P.',  '+19175550106', '2023 Chrysler 300',           'NYC-8822', 4.9, 'offline', 40.5890, -73.7700);
