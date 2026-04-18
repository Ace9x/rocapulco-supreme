export type RideStatus =
  | "pending"
  | "dispatched"
  | "en_route"
  | "arrived"
  | "on_trip"
  | "completed"
  | "canceled";

export type DriverStatus = "online" | "offline" | "on_ride";

export type PaymentMethod = "card" | "cash" | "zelle" | "venmo";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  status: DriverStatus;
  lat: number | null;
  lng: number | null;
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string | null;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  fare_cents: number;
  payment_method: PaymentMethod;
  status: RideStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  role: "rider" | "driver" | "dispatcher";
}
