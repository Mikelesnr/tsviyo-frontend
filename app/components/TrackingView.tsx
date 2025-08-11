'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type TrackingViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

// Mapbox default view
const initialViewState = {
  latitude: -17.8292,
  longitude: 31.0522,
  zoom: 14,
  bearing: 0,
  pitch: 0,
};

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_MAPS_TOKEN || '';

// Simulate route line
const generateRouteLine = (pickup: [number, number], dropoff: [number, number]) => {
  const steps = 20;
  const route: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    route.push([
      pickup[0] + (dropoff[0] - pickup[0]) * t,
      pickup[1] + (dropoff[1] - pickup[1]) * t,
    ]);
  }
  return route;
};

export default function TrackingView({ user, setPage }: TrackingViewProps) {
  const [ride, setRide] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(5); // minutes
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const mapRef = useRef<any>(null);

  // Load ride from localStorage
  useEffect(() => {
    const savedRide = localStorage.getItem('currentRide');
    if (savedRide) {
      const parsed = JSON.parse(savedRide);
      setRide(parsed);

      // Simulate driver location
      const pickup: [number, number] = [parsed.pickup_lng, parsed.pickup_lat];
      const dropoff: [number, number] = [parsed.dropoff_lng, parsed.dropoff_lat];

      setDriverLocation([
        (pickup[1] + dropoff[1]) / 2,
        (pickup[0] + dropoff[0]) / 2,
      ]);

      // Generate route line
      setRoute(generateRouteLine(pickup, dropoff));

      // Simulate ETA (in real app, use Mapbox Directions API)
      setEta(5);
    }
  }, []);

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPage('fare'), 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [setPage]);

  // Handle ride start/end (driver only)
  const handleStartRide = () => {
    alert('Ride started');
  };

  const handleEndRide = () => {
    alert('Ride ended');
    localStorage.removeItem('currentRide');
    setPage('fare');
  };

  if (!user || !ride) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in and request a ride.</p>
      </div>
    );
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    return <div className="text-center">Mapbox token not found</div>;
  }

  return (
    <section className="max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tracking Your Ride</h2>

      {/* Map */}
      <div className="rounded-lg shadow-md mb-6 overflow-hidden">
        <Map
          ref={mapRef}
          initialViewState={initialViewState}
          style={{ width: '100%', height: '400px' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          reuseMaps
        >
          {/* Pickup Marker */}
          <Marker longitude={ride.pickup_lng} latitude={ride.pickup_lat} anchor="bottom">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
          </Marker>

          {/* Dropoff Marker */}
          <Marker longitude={ride.dropoff_lng} latitude={ride.dropoff_lat} anchor="bottom">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
          </Marker>

          {/* Driver Marker */}
          {driverLocation && (
            <Marker longitude={driverLocation[1]} latitude={driverLocation[0]} anchor="bottom">
              <div className="text-2xl">🚗</div>
            </Marker>
          )}

          {/* Route Line */}
          {route && (
            <div>
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="blue" />
                    <stop offset="100%" stopColor="cyan" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <path
                  d={`M ${route.map(([lng, lat]) => `${((lng - initialViewState.longitude) * 100000)} ${(lat - initialViewState.latitude) * -100000}`).join(' L ')}`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="4"
                />
              </svg>
            </div>
          )}

          {/* Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-left" />
          <FullscreenControl position="top-left" />
          <ScaleControl />
        </Map>
      </div>

      {/* Progress */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between mb-2 text-sm text-gray-600">
          <span>Pickup: {ride.pickup_address}</span>
          <span>Dropoff: {ride.dropoff_address}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center text-gray-600">Progress: {progress}%</p>
      </div>

      {/* Driver Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Driver Info</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">Alex Johnson</p>
          <p className="text-gray-600">Toyota Camry 2022</p>
          <p className="text-gray-600">License Plate: ABC-123</p>
          <div className="flex items-center mt-2">
            <span className="text-yellow-500 mr-1">★</span>
            <span>4.7</span>
          </div>
        </div>
      </div>

      {/* ETA */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ETA</h3>
        <p className="text-2xl font-bold text-blue-600">{eta.toFixed(1)} min</p>
      </div>

      {/* Driver Controls */}
      {user.role === 'driver' && (
        <div className="space-y-4 mb-6">
          <button
            onClick={handleStartRide}
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition"
          >
            🚘 Start Ride
          </button>
          <button
            onClick={handleEndRide}
            className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition"
          >
            ⏹️ End Ride
          </button>
        </div>
      )}

      {/* Rider Cancel */}
      {user.role === 'rider' && (
        <button
          onClick={() => {
            if (window.confirm('Cancel this ride?')) {
              localStorage.removeItem('currentRide');
              setPage('home');
            }
          }}
          className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition"
        >
          Cancel Ride
        </button>
      )}
    </section>
  );
}