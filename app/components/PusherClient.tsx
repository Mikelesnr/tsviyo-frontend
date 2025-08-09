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
  setUser: (user: User | null) => void; 
};

export default function PusherClient({ user, setUser }: PusherClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isOnline, setIsOnline] = useState(true); 

  // Toggle driver online/offline status
  const toggleDriverStatus = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/driver/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          'Accept': process.env.NEXT_PUBLIC_ACCEPT!,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user status
        const updatedUser = { ...user, status: data.status };
        setUser(updatedUser);
        setIsOnline(data.status === 'active'); 
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error('Error toggling driver status:', err);
      alert('Network error. Could not update status.');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user || user.role !== 'driver' || !isOnline) return;

    if (document.getElementById('pusher-script')) return;

    const script = document.createElement('script');
    script.id = 'pusher-script';
    script.src = 'https://js.pusher.com/8.3.0/pusher.min.js';
    script.async = true;

    script.onload = () => {
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
        console.error('Pusher key is missing in environment');
        return;
      }

      const pusher = new window.Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: 'us3',
      });

      pusher.connection.bind('state_change', (states: any) => {
        console.log(`[Pusher] Connection state: ${states.previous} → ${states.current}`);
      });

      const channel = pusher.subscribe('rides.nearby');

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to "rides.nearby"');
      });

      channel.bind('RideRequested', (eventData: any) => {
        console.log('🚨 RideRequested event received:', eventData);

        const rideData = eventData.ride || eventData;

        const newRide: Ride = {
          id: rideData.id,
          rider_id: rideData.rider_id,
          pickup_address: rideData.pickup_add || rideData.pickup_address || 'Unknown Pickup',
          dropoff_address: rideData.dropoff_add || rideData.dropoff_address || 'Unknown Dropoff',
          pickup_lat: rideData.pickup_lat,
          pickup_lng: rideData.pickup_lng,
          dropoff_lat: rideData.dropoff_lat,
          dropoff_lng: rideData.dropoff_lng,
          fare: typeof rideData.fare === 'string' ? parseFloat(rideData.fare) : rideData.fare,
          pickup_time: rideData.pickup_time,
          status: rideData.status || 'requested',
          timestamp: new Date().toISOString(),
        };

        setSelectedRide(newRide);
        setIsModalOpen(true);
      });

      channel.bind('pusher:subscription_error', (status: any) => {
        console.error('❌ Subscription error:', status);
      });

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
  }, [user, isOnline, setUser]);

  const handleAcceptRide = async (rideId: number) => {
    alert(`You have accepted ride #${rideId}`);

    setIsModalOpen(false);
    setSelectedRide(null);
    setIsOnline(false); 
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
  };

  return (
    <>
      {/* Only show modal if a ride is selected and driver is online */}
      {isModalOpen && selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative">
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
                <strong>Fare:</strong> ${(typeof selectedRide.fare === 'number' ? selectedRide.fare : 0).toFixed(2)}
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