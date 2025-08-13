'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

type Ride = {
  id: number;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  status: string;
  driver_id?: number | null;
  rider_id: number;
  pickup_time: string;
};

type FareViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function FareView({ user, setPage }: FareViewProps) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const savedRide = localStorage.getItem('currentRide');
    if (savedRide) {
      const parsedRide = JSON.parse(savedRide);
      setRide(parsedRide);

      // Simulate distance and duration
      const lat1 = parsedRide.pickup_lat;
      const lon1 = parsedRide.pickup_lng;
      const lat2 = parsedRide.dropoff_lat;
      const lon2 = parsedRide.dropoff_lng;

      // Haversine distance formula in km
      const toRad = (x: number) => x * Math.PI / 180;
      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;

      setDistance(parseFloat(distanceKm.toFixed(2)));
      setDuration(parseFloat((distanceKm * 2.5).toFixed(1))); // ~2.5 min per km
    }
  }, []);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to view fare details.</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">No active ride found.</p>
      </div>
    );
  }

  const handleContinue = () => {
    localStorage.removeItem('currentRide');
    
    // If driver, go home. If rider, go to rating.
    if (ride.driver_id) {
      setPage('home');
    } else {
      setPage('rating');
    }
  };

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Fare Details</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Distance</span>
            <span className="font-medium">{distance} km</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium">{duration} min</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>${ride.fare.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            ride.driver_id
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {ride.driver_id ? '✅ Collect Pay & Go to Homepage' : '💳 Pay & Rate Ride'}
        </button>
      </div>
    </section>
  );
}