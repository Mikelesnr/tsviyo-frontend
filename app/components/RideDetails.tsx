'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

declare global {
  interface Window {
    Pusher?: any;
  }
}

type RideDetailsProps = {
  setPage: (page: string) => void;
  user: User | null;
};

export default function RideDetails({ setPage, user }: RideDetailsProps) {
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Load ride from localStorage
  useEffect(() => {
    const savedRide = localStorage.getItem('currentRide');
    if (savedRide) {
      const parsedRide = JSON.parse(savedRide);
      setRide(parsedRide);

      // // Show alert if ride was just accepted
      // if (parsedRide.status === 'accepted' && !sessionStorage.getItem('acceptance-alert-seen')) {
      //   setShowAlert(true);
      //   sessionStorage.setItem('acceptance-alert-seen', 'true');

        // ✅ Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
          setShowAlert(false);
          setPage('tracking');
        }, 5000);

        return () => clearTimeout(timer);
      // }

      // If already accepted, go to tracking immediately
      if (['accepted', 'en_route', 'arrived', 'in_progress'].includes(parsedRide.status?.toLowerCase())) {
        setPage('tracking');
      }
    }
  }, [setPage]);

  if (!ride) {
    return <p className="text-center py-8">Loading ride details...</p>;
  }

  const isRideAccepted = ['accepted', 'en_route', 'arrived', 'in_progress'].includes(ride.status?.toLowerCase());

  // Simple cancel
  const handleCancelRide = async () => {
    if (isRideAccepted) {
      setShowCancelModal(true);
      return;
    }

    setLoading(true);
    if (!user || !user.token) {
      setError("Auth error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rides/${ride.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to cancel');
      localStorage.removeItem('currentRide');
      setPage('ride-request');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLateCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setError('Provide reason');
      return;
    }

    setLoading(true);
    if (!user || !user.token) {
      setError("Authentication error: User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rides/${ride.id}/late-cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!res.ok) throw new Error('Failed to cancel');
      localStorage.removeItem('currentRide');
      setPage('ride-request');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Ride</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Status</label>
          {ride.status === 'requested' ? (
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-blue-600">Looking for driver</p>
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          ) : (
            <p className={`text-lg font-semibold ${isRideAccepted ? 'text-green-600' : 'text-blue-600'}`}>
              {ride.status
                ?.split('_')
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ') || 'Unknown'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Pickup</label>
          <p className="text-gray-800">{ride.pickup_address}</p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Dropoff</label>
          <p className="text-gray-800">{ride.dropoff_address}</p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Fare</label>
          <p className="text-xl font-bold text-green-600">${(typeof ride.fare === 'number' ? ride.fare : 0).toFixed(2)}</p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Pickup Time</label>
          <p className="text-gray-800">{new Date(ride.pickup_time).toLocaleString()}</p>
        </div>
      </div>

      {/* ✅ Show "Track Driver" when accepted */}
      {isRideAccepted && (
        <button
          onClick={() => setPage('tracking')}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
        >
          Track Driver
        </button>
      )}

      <button
        onClick={handleCancelRide}
        disabled={loading}
        className="w-full mt-3 text-red-600 hover:underline font-medium"
      >
        {loading ? 'Canceling...' : 'Cancel Ride'}
      </button>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Late Cancellation</h3>
            <p className="text-gray-600 mb-4">This ride has been accepted. Please provide a reason.</p>
            <form onSubmit={handleLateCancel}>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
                rows={3}
                placeholder="e.g. Emergency came up"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {loading ? 'Canceling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Acceptance Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Ride Accepted!</h3>
            <p className="text-gray-700 mb-4">A driver has accepted your ride. Redirecting to tracking...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-100" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <button
              onClick={() => {
                setShowAlert(false);
                setPage('tracking');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Tracking Now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}