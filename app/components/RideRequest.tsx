'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User } from '@/types';

// Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_MAPS_TOKEN!;

type RideRequestProps = {
  user: User | null;
  setPage: (page: string) => void;
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default center: Harare, Zimbabwe
const defaultCenter = { lat: -17.8292, lng: 31.0522 };

// Rate: $1 per km
const RATE_PER_KM = 1;

// Reverse geocode: coordinates → address
const reverseGeocode = (lngLat: { lng: number; lat: number }, callback: (address: string) => void) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        callback(data.features[0].place_name);
      } else {
        callback(`${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`);
      }
    })
    .catch(() => {
      callback(`${lngLat.lat.toFixed(6)}, ${lngLat.lng.toFixed(6)}`);
    });
};

// Geocode: address → coordinates
const geocodeAddress = (address: string, callback: (coords: { lng: number; lat: number } | null) => void) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&country=ZW`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        callback({ lng, lat });
      } else {
        callback(null);
      }
    })
    .catch(() => {
      callback(null);
    });
};

export default function RideRequest({ user, setPage }: RideRequestProps) {
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    pickupTime: new Date().toISOString().slice(0, 16),
  });

  const [pickupCoords, setPickupCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [isMapClicked, setIsMapClicked] = useState<'pickup' | 'dropoff' | null>(null);
  const [loading, setLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const dropoffMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: 10,
    });

    mapRef.current = map;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Handle map click
    map.on('click', (e) => {
      if (!isMapClicked) return;
      const { lng, lat } = e.lngLat;

      if (isMapClicked === 'pickup') {
        setPickupCoords({ lng, lat });
        reverseGeocode({ lng, lat }, (address) => {
          setFormData((prev) => ({ ...prev, pickup: address }));
          if (pickupRef.current) pickupRef.current.value = address;
        });
      } else if (isMapClicked === 'dropoff') {
        setDropoffCoords({ lng, lat });
        reverseGeocode({ lng, lat }, (address) => {
          setFormData((prev) => ({ ...prev, dropoff: address }));
          if (dropoffRef.current) dropoffRef.current.value = address;
        });
      }

      setIsMapClicked(null);
    });

    return () => {
      map.remove();
    };
  }, [isMapClicked]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    pickupMarkerRef.current?.remove();
    dropoffMarkerRef.current?.remove();

    // Add pickup marker
    if (pickupCoords) {
      pickupMarkerRef.current = new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([pickupCoords.lng, pickupCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup</strong><br>${formData.pickup}`))
        .addTo(mapRef.current);
    }

    // Add dropoff marker
    if (dropoffCoords) {
      dropoffMarkerRef.current = new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([dropoffCoords.lng, dropoffCoords.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Dropoff</strong><br>${formData.dropoff}`))
        .addTo(mapRef.current);
    }

    // Fit bounds
    if (pickupCoords && dropoffCoords) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend([pickupCoords.lng, pickupCoords.lat])
        .extend([dropoffCoords.lng, dropoffCoords.lat]);
      mapRef.current.fitBounds(bounds, { padding: 50 });
    } else if (pickupCoords) {
      mapRef.current.flyTo({ center: [pickupCoords.lng, pickupCoords.lat], zoom: 14 });
    } else if (dropoffCoords) {
      mapRef.current.flyTo({ center: [dropoffCoords.lng, dropoffCoords.lat], zoom: 14 });
    }
  }, [pickupCoords, dropoffCoords, formData.pickup, formData.dropoff]);

  // ✅ Calculate route and fare
  const calculateRoute = useCallback(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDirections(null);
      setFare(null);
      return;
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setDirections(route);

          // ✅ Draw the route line
          if (mapRef.current) {
            if (mapRef.current.getSource('route')) {
              mapRef.current.removeLayer('route').removeSource('route');
            }

            mapRef.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: route.geometry,
              },
            });

            mapRef.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3B82F6',
                'line-width': 5,
                'line-opacity': 0.8,
              },
            });
          }

          // ✅ Calculate fare
          const distanceInKm = route.distance / 1000;
          const calculatedFare = distanceInKm * RATE_PER_KM;
          setFare(calculatedFare);
        } else {
          setFare(0);
        }
      })
      .catch(() => {
        setFare(0);
        setDirections(null);
      });
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualLocation = (field: 'pickup' | 'dropoff') => {
    const address = field === 'pickup' ? formData.pickup : formData.dropoff;
    if (!address) {
      alert(`Please enter a ${field} address.`);
      return;
    }

    geocodeAddress(address, (coords) => {
      if (coords) {
        if (field === 'pickup') {
          setPickupCoords(coords);
        } else {
          setDropoffCoords(coords);
        }
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} location set manually.`);
      } else {
        alert('Could not find location. Try a more specific address.');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCoords || !dropoffCoords) {
      alert('Please set both pickup and dropoff locations.');
      return;
    }
    if (!user || !user.token) {
      alert('Authentication error. Please log in again.');
      setPage('login');
      return;
    }

    setLoading(true);

    try {
      const rideData = {
        rider_id: user.id,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        dropoff_lat: dropoffCoords.lat,
        dropoff_lng: dropoffCoords.lng,
        pickup_address: formData.pickup,
        dropoff_address: formData.dropoff,
        fare: fare,
        pickup_time: formData.pickupTime,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(rideData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create ride');
      }

      const realRideId = result.data?.id || result.id;
      if (!realRideId) {
        throw new Error('No ride ID returned from server');
      }

      localStorage.setItem(
        'currentRide',
        JSON.stringify({
          id: realRideId,
          status: 'requested',
          ...rideData,
        })
      );

      setPage('ride-details');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Request a Ride</h2>

      {/* 🗺️ MAPBOX MAP */}
      <div className="rounded-lg shadow-md mb-6 overflow-hidden" style={mapContainerStyle}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 📝 FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pickup Location</label>
          <input
            ref={pickupRef}
            type="text"
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter pickup address"
            required
          />
          <div className="mt-2 space-x-2">
            <button
              type="button"
              onClick={() => setIsMapClicked('pickup')}
              className="text-sm text-blue-600 hover:underline"
            >
              Set from map
            </button>
            <button
              type="button"
              onClick={() => handleManualLocation('pickup')}
              className="text-sm text-green-600 hover:underline"
            >
              Use address
            </button>
          </div>
          {pickupCoords && (
            <p className="text-xs text-gray-500 mt-1">
              Set: {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Dropoff Location</label>
          <input
            ref={dropoffRef}
            type="text"
            name="dropoff"
            value={formData.dropoff}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter dropoff address"
            required
          />
          <div className="mt-2 space-x-2">
            <button
              type="button"
              onClick={() => setIsMapClicked('dropoff')}
              className="text-sm text-blue-600 hover:underline"
            >
              Set from map
            </button>
            <button
              type="button"
              onClick={() => handleManualLocation('dropoff')}
              className="text-sm text-green-600 hover:underline"
            >
              Use address
            </button>
          </div>
          {dropoffCoords && (
            <p className="text-xs text-gray-500 mt-1">
              Set: {dropoffCoords.lat.toFixed(6)}, {dropoffCoords.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pickup Time</label>
          <input
            type="datetime-local"
            name="pickupTime"
            value={formData.pickupTime}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {fare !== null && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-lg font-semibold text-green-800">
              Estimated Fare: <span className="text-xl">${fare.toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* ✅ Disable button until both locations are set */}
        <button
          type="submit"
          disabled={!pickupCoords || !dropoffCoords || loading}
          className={`w-full py-3 rounded-md transition flex items-center justify-center gap-2 ${
            !pickupCoords || !dropoffCoords
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : loading
              ? 'bg-blue-400 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            'Requesting...'
          ) : !pickupCoords || !dropoffCoords ? (
            'Set Pickup and Dropoff'
          ) : fare ? (
            <>
              Request Ride • <span className="font-bold">${fare.toFixed(2)}</span>
            </>
          ) : (
            'Calculating Fare...'
          )}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Tip: Click 🗺️ to set location by clicking the map, or ✅ to use typed address.
      </p>
    </section>
  );
}