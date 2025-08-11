// app/components/PusherClient.tsx
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
  setPage: (page: string) => void;
};

export default function PusherClient({ user, setPage }: PusherClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) return;

    // Avoid duplicate script
    if (document.getElementById('pusher-script')) return;

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

      // Subscribe to public channel
      const channel = pusher.subscribe('rides.nearby');

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Subscribed to "rides.nearby"');
      });

      channel.bind('pusher:subscription_error', (err: any) => {
        console.error('❌ Subscription error:', err);
      });

      // 🚗 DRIVER: Listen for new ride requests
      if (user.role === 'driver') {
        channel.bind('RideRequested', (data: any) => {
          console.log('🚨 Driver: Ride requested:', data);
          const rideData = data.ride;

          const newRide: Ride = {
            id: rideData.id,
            rider_id: rideData.rider_id,
            pickup_address: rideData.pickup_add || 'Unknown Pickup',
            dropoff_address: rideData.dropoff_add || 'Unknown Dropoff',
            pickup_lat: parseFloat(rideData.pickup_lat),
            pickup_lng: parseFloat(rideData.pickup_lng),
            dropoff_lat: parseFloat(rideData.dropoff_lat),
            dropoff_lng: parseFloat(rideData.dropoff_lng),
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

      // 👤 RIDER: Listen for ride acceptance and cancellation
      if (user.role === 'rider') {
        channel.bind('RideAccepted', (eventData: any) => {
          const ride = eventData.ride;
          if (ride.rider_id === user.id) {
            console.log('🎉 Your ride has been accepted!', ride);
            setAlertMessage('🎉 Your ride has been accepted! A driver is on the way.');
            setIsModalOpen(true);

            // Update localStorage
            localStorage.setItem('currentRide', JSON.stringify({ ...ride, status: 'accepted' }));
          }
        });

        channel.bind('RideCancelled', (data: any) => {
          const ride = data.ride;
          if (ride.rider_id === user.id) {
            console.log('🚫 Your ride was cancelled:', ride);
            setAlertMessage('🚫 Your ride was cancelled. Please request a new one.');
            setIsModalOpen(true);
          }
        });
      }

      // Cleanup
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
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
  }, [user, setPage]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
    setAlertMessage('');
  };

  const handleAcceptRide = async () => {
    if (!selectedRide || !user) return;

    try {
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rides/${selectedRide.id}/accept`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${user.token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Failed to accept ride');
      // }

      // ✅ Store accepted ride
      localStorage.setItem('currentRide', JSON.stringify({
        ...selectedRide,
        status: 'accepted',
        driver_id: user.id,
      }));

      // ✅ Go to tracking
      setPage('tracking');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      closeModal();
    }
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
                    <Clock className="h-4 w-4 text-gray-600" />
                    <strong>Time:</strong> {new Date(selectedRide.timestamp).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p>{alertMessage}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {user?.role === 'driver' && selectedRide ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={handleAcceptRide}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Accept Ride
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}