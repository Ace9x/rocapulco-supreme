-- Metered fares: the rider books without a fare; the dispatcher sets it when
-- assigning a driver. Flat-rate destinations (JFK/LGA) still insert with a
-- quoted fare_cents.
alter table public.rides alter column fare_cents drop not null;

-- A rider must keep visibility on their assigned driver even if the driver's
-- status changes (e.g. driver momentarily goes offline while en route). The
-- existing policy only exposed online/on_ride drivers; add a join-based policy
-- that also exposes whichever driver is on one of the rider's rides.
create policy drivers_rider_assigned on public.drivers
  for select using (
    exists (
      select 1 from public.rides r
      where r.driver_id = drivers.id and r.rider_id = auth.uid()
    )
  );

-- A driver needs to see and update their OWN driver row (toggle online,
-- push GPS, etc.). Link them via profile_id = auth.uid().
create policy drivers_self_select on public.drivers
  for select using (profile_id = auth.uid());

create policy drivers_self_update on public.drivers
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- A driver needs to see and progress rides assigned to them.
create policy rides_driver_select on public.rides
  for select using (
    exists (
      select 1 from public.drivers d
      where d.id = rides.driver_id and d.profile_id = auth.uid()
    )
  );

create policy rides_driver_update on public.rides
  for update using (
    exists (
      select 1 from public.drivers d
      where d.id = rides.driver_id and d.profile_id = auth.uid()
    )
  );
