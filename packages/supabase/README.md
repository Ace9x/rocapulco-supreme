# @rocapulco/supabase

Schema + seed for the Rocapulco Supreme Supabase project.

## Apply

Using the Supabase CLI against a linked project:

```bash
supabase db push                       # applies migrations/0001_initial.sql
psql "$SUPABASE_DB_URL" -f seed.sql    # loads driver fleet
```

Or paste `migrations/0001_initial.sql` then `seed.sql` into the SQL editor in the
Supabase dashboard.

## Phone auth

In the Supabase dashboard: **Authentication → Providers → Phone**, toggle on and
wire up a Twilio account. Set the "OTP length" to 6 and "OTP expiry" to 600s.

## Creating a dispatcher

Phone OTP signup defaults new users to `role='rider'`. To promote the first
dispatcher, sign them up via the mobile app (or create them in the dashboard),
then run:

```sql
update public.profiles set role = 'dispatcher' where phone = '+1XXXXXXXXXX';
```
