'use client';

import { useEffect, useState } from 'react';
import { DollarSign, MapPin, Target, Clock, X } from 'lucide-react';
import { User } from '@/types';

declare global {
  interface Window {
    Pusher?: any;
  }
}

type Ride = {
  id: number;
  rider_id: number;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  fare: number;
  pickup_time: string;
  status: string;
  timestamp: string;
};

type PusherClientProps = {
  user: User | null;
};

export default function PusherClient({ user }: PusherClientProps) {
  const [rideRequests, setRideRequests] = useState<Ride[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user || user.role !== 'driver') return;

    const script = document.createElement('script');
    script.src = 'https://js.pusher.com/8.3.0/pusher.min.js';
    script.async = true;

    script.onload = () => {
      const pusher = new (window as any).Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: 'us3',
      });

      const channel = pusher.subscribe('rides.nearby');

      channel.bind('RideRequested', (data: any) => {
        console.log('Ride requested:', data);
        const rideData = data.ride;

        const newRide: Ride = {
          id: rideData.id,
          rider_id: rideData.rider_id,
          pickup_address: rideData.pickup_add || 'Unknown Pickup',
          dropoff_address: rideData.dropoff_add || 'Unknown Dropoff',
          pickup_lat: rideData.pickup_lat,
          pickup_lng: rideData.pickup_lng,
          dropoff_lat: rideData.dropoff_lat,
          dropoff_lng: rideData.dropoff_lng,
          fare: rideData.fare,
          pickup_time: rideData.pickup_time,
          status: rideData.status,
          timestamp: new Date().toISOString(),
        };

        setRideRequests((prev) => [newRide, ...prev]);
        setSelectedRide(newRide);
        setIsModalOpen(true);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [user]);

  const handleAcceptRide = (rideId: number) => {
    // Here you would call your backend to accept the ride
    // Example: PATCH /api/rides/${rideId}/accept

    alert(`You have accepted ride #${rideId}`);
    setIsModalOpen(false);
    setSelectedRide(null);
    setRideRequests((prev) => prev.filter((r) => r.id !== rideId));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  return (
    <>
      {/* Ride Request Modal */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-4">New Ride Request</h3>

            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <strong>Pickup:</strong> {selectedRide.pickup_address}
              </p>

              <p className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <strong>Dropoff:</strong> {selectedRide.dropoff_address}
              </p>

              <p className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <strong>Fare:</strong> ${selectedRide.fare?.toFixed(2)}
              </p>

              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <strong>Time:</strong> {new Date(selectedRide.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Ignore
              </button>
              <button
                onClick={() => handleAcceptRide(selectedRide.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}