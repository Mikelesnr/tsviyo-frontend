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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) return;

    const script = document.createElement('script');
    script.id = 'pusher-script';
    script.src = 'https://js.pusher.com/8.3.0/pusher.min.js';
    script.async = true;

    script.onload = () => {
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
        console.error('Pusher key is missing');
        return;
      }

      const pusher = new window.Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: 'us3',
      });

      // Debug connection
      pusher.connection.bind('state_change', (states: any) => {
        console.log(`[Pusher] ${states.previous} → ${states.current}`);
      });

      // Subscribe to public channel for new ride requests
      if (user.role === 'driver') {
        const channel = pusher.subscribe('rides.nearby');

        channel.bind('pusher:subscription_succeeded', () => {
          console.log('✅ Subscribed to "rides.nearby"');
        });

        channel.bind('RideRequested', (data: any) => {
          console.log('🚨 Driver: Ride requested:', data);
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
            fare: typeof rideData.fare === 'string' ? parseFloat(rideData.fare) : rideData.fare,
            pickup_time: rideData.pickup_time,
            status: rideData.status,
            timestamp: new Date().toISOString(),
          };

          setSelectedRide(newRide);
          setAlertMessage('New ride request!');
          setIsModalOpen(true);
        });
      }

      // Subscribe to private channel for ride updates
      if (user.role === 'rider') {
        const channel = pusher.subscribe(`ride.updates.${user.id}`);

        channel.bind('pusher:subscription_succeeded', () => {
          console.log(`✅ Subscribed to "ride.updates.${user.id}"`);
        });

        channel.bind('RideAccepted', (data: any) => {
          console.log('🎉 Rider: Ride accepted:', data);
          const ride = data.ride;
          if (ride.rider_id === user.id) {
            setAlertMessage('🎉 Your ride has been accepted! A driver is on the way.');
            setIsModalOpen(true);
          }
        });

        channel.bind('RideCancelled', (data: any) => {
          console.log('🚫 Rider: Ride cancelled:', data);
          const ride = data.ride;
          if (ride.rider_id === user.id) {
            setAlertMessage('🚫 Your ride was cancelled. Please request a new one.');
            setIsModalOpen(true);
          }
        });
      }

      return () => {
        pusher.disconnect();
      };
    };

    script.onerror = () => {
      console.error('Failed to load Pusher SDK');
    };

    document.head.appendChild(script);

    return () => {
      const scriptTag = document.getElementById('pusher-script');
      if (scriptTag) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [user]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
    setAlertMessage('');
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {user?.role === 'driver' ? 'New Ride Request' : 'Ride Update'}
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              {user?.role === 'driver' && selectedRide ? (
                <>
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
                    <strong>Fare:</strong> ${(typeof selectedRide.fare === 'number' ? selectedRide.fare : 0).toFixed(2)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-black-600" />
                    <strong>Time:</strong>{" "}
                    {new Date(new Date(selectedRide.timestamp).getTime() - 60 * 60 * 1000).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p>{alertMessage}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}