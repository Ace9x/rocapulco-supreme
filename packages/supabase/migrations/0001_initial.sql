-- Rocapulco Supreme — initial schema
-- Covers only the end-to-end flow: phone OTP → book ride → dispatch assigns driver.

create extension if not exists "pgcrypto";

-- ── profiles ──────────────────────────────────────────────
-- One row per auth.users. Role gates which app they can use.
create type public.user_role as enum ('rider', 'driver', 'dispatcher');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  full_name text,
  role public.user_role not null default 'rider',
  created_at timestamptz not null default now()
);

-- ── drivers ──────────────────────────────────────────────
create type public.driver_status as enum ('online', 'offline', 'on_ride');

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  vehicle text not null,
  plate text not null,
  rating numeric(3, 2) not null default 5.00,
  status public.driver_status not null default 'offline',
  lat double precision,
  lng double precision,
  updated_at timestamptz not null default now()
);

create index drivers_status_idx on public.drivers (status);

-- ── rides ────────────────────────────────────────────────
create type public.ride_status as enum (
  'pending', 'dispatched', 'en_route', 'arrived', 'on_trip', 'completed', 'canceled'
);

create type public.payment_method as enum ('card', 'cash', 'zelle', 'venmo');

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.profiles(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_address text not null,
  dropoff_lat double precision,
  dropoff_lng double precision,
  fare_cents integer not null,
  payment_method public.payment_method not null default 'card',
  status public.ride_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rides_status_idx on public.rides (status);
create index rides_rider_idx on public.rides (rider_id, created_at desc);
create index rides_driver_idx on public.rides (driver_id, created_at desc);

-- ── updated_at trigger ───────────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger rides_set_updated_at
  before update on public.rides
  for each row execute function public.tg_set_updated_at();

create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.tg_set_updated_at();

-- ── auto-provision a rider profile on signup ─────────────
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, phone, role)
  values (new.id, coalesce(new.phone, ''), 'rider')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- ── RLS ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.rides enable row level security;

-- profiles: each user sees their own row; dispatchers see all.
create policy profiles_self_select on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'dispatcher'
    )
  );

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- drivers: riders can read online drivers; dispatchers can read/write all.
create policy drivers_riders_read_online on public.drivers
  for select using (status = 'online' or status = 'on_ride');

create policy drivers_dispatch_all on public.drivers
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'dispatcher'
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'dispatcher'
    )
  );

-- rides: rider sees their own rides; dispatcher sees all; rider inserts own.
create policy rides_rider_select on public.rides
  for select using (
    rider_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('dispatcher', 'driver')
    )
  );

create policy rides_rider_insert on public.rides
  for insert with check (rider_id = auth.uid());

create policy rides_dispatch_update on public.rides
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'dispatcher'
    )
  );

-- Needed so Supabase Realtime emits row-level changes over the channel.
alter publication supabase_realtime add table public.rides;
alter publication supabase_realtime add table public.drivers;
