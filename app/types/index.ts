export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  token: string;
};

export type Ride = {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  pickup_time: string;
  status: string;
};

export type Vehicle = {
  id: number;
  make: string;
  model: string;
  plate_number: string;
  driver_id: number | null;
};