import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";

type RideRequestProps = {
  user: any;
  setPage: (page: string) => void;
};

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

// Default center: Lagos, Nigeria
const defaultCenter = {
  lat: 6.57854,
  lng: 3.29746,
};

// Rate: $0.10 per 10 meters = $10 per km
const RATE_PER_KM = 10; // USD

// Reverse geocode: coordinates → address
const reverseGeocode = (
  latLng: google.maps.LatLngLiteral,
  callback: (address: string) => void
) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === "OK" && results && results.length > 0) {
      callback(results[0].formatted_address);
    } else {
      callback(`${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`);
    }
  });
};

// Geocode: address → coordinates
const geocodeAddress = (
  address: string,
  callback: (coords: google.maps.LatLngLiteral | null) => void
) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address }, (results, status) => {
    if (status === "OK" && results && results.length > 0) {
      callback({
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng(),
      });
    } else {
      callback(null);
    }
  });
};

export default function RideRequest({ user, setPage }: RideRequestProps) {
  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    pickupTime: new Date().toISOString().slice(0, 16),
  });

  const [pickupCoords, setPickupCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [fare, setFare] = useState<number | null>(null); // Estimated fare
  const [isMapClicked, setIsMapClicked] = useState<"pickup" | "dropoff" | null>(null);

  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCoords || !dropoffCoords) {
      alert("Please set both pickup and dropoff locations.");
      return;
    }
    if (fare === null) return;

    alert(`Finding a driver for your ride...\nEstimated Fare: $${fare.toFixed(2)}`);
    setTimeout(() => {
      setPage("tracking");
    }, 1500);
  };

  // Handle Places Autocomplete
  const handlePlaceSelect = (
    inputElement: HTMLInputElement,
    setCoords: (coords: google.maps.LatLngLiteral) => void,
    setAddress: (addr: string) => void
  ) => {
    if (!inputElement) return;

    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      types: ["address"],
      componentRestrictions: { country: "ng" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setCoords(coords);
        setAddress(place.formatted_address || inputElement.value);
      }
    });
  };

  // Handle map click to fix location
  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !isMapClicked) return;

    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    if (isMapClicked === "pickup") {
      setPickupCoords(latLng);
      reverseGeocode(latLng, (address) => {
        setFormData((prev) => ({ ...prev, pickup: address }));
        if (pickupRef.current) pickupRef.current.value = address;
      });
    } else if (isMapClicked === "dropoff") {
      setDropoffCoords(latLng);
      reverseGeocode(latLng, (address) => {
        setFormData((prev) => ({ ...prev, dropoff: address }));
        if (dropoffRef.current) dropoffRef.current.value = address;
      });
    }
  };

  // Manual "Set Location" from typed address
  const handleManualLocation = (field: "pickup" | "dropoff") => {
    const address = field === "pickup" ? formData.pickup : formData.dropoff;
    if (!address) {
      alert(`Please enter a ${field} address.`);
      return;
    }

    geocodeAddress(address, (coords) => {
      if (coords) {
        if (field === "pickup") {
          setPickupCoords(coords);
        } else {
          setDropoffCoords(coords);
        }
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} location set manually.`);
      } else {
        alert("Could not find location. Try a more specific address or use the map.");
      }
    });
  };

  // Calculate route and fare
  const calculateRoute = useCallback((origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const distanceInMeters = result.routes[0].legs[0].distance?.value || 0;
          const distanceInKm = distanceInMeters / 1000;
          const calculatedFare = distanceInKm * RATE_PER_KM;
          setFare(calculatedFare);
        } else {
          console.error("Error fetching directions:", status);
          setFare(0);
        }
      }
    );
  }, []);

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateRoute(pickupCoords, dropoffCoords);
    } else {
      setFare(null);
    }
  }, [pickupCoords, dropoffCoords, calculateRoute]);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to request a ride.</p>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Request a Ride</h2>

      {/* 🗺️ MAP */}
      <div className="rounded-lg shadow-md mb-6 overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={pickupCoords || dropoffCoords || defaultCenter}
            zoom={pickupCoords || dropoffCoords ? 14 : 10}
            onClick={onMapClick}
          >
            {pickupCoords && <Marker position={pickupCoords} label="P" />}
            {dropoffCoords && <Marker position={dropoffCoords} label="D" />}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        )}
      </div>

      {/* 📝 FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* Pickup */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pickup Location</label>
          <div className="flex gap-2">
            <input
              ref={pickupRef}
              type="text"
              name="pickup"
              value={formData.pickup}
              onChange={handleChange}
              className="flex-1 p-2 border rounded-md"
              placeholder="Enter pickup address"
              required
              onFocus={() => {
                if (pickupRef.current) {
                  handlePlaceSelect(pickupRef.current, setPickupCoords, (addr) =>
                    setFormData((prev) => ({ ...prev, pickup: addr }))
                  );
                }
              }}
            />
            <button
              type="button"
              onClick={() => setIsMapClicked("pickup")}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              title="Click map to set"
            >
              🗺️
            </button>
            <button
              type="button"
              onClick={() => handleManualLocation("pickup")}
              className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
              title="Set from text"
            >
              ✅
            </button>
          </div>
        </div>

        {/* Dropoff */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Dropoff Location</label>
          <div className="flex gap-2">
            <input
              ref={dropoffRef}
              type="text"
              name="dropoff"
              value={formData.dropoff}
              onChange={handleChange}
              className="flex-1 p-2 border rounded-md"
              placeholder="Enter dropoff address"
              required
              onFocus={() => {
                if (dropoffRef.current) {
                  handlePlaceSelect(dropoffRef.current, setDropoffCoords, (addr) =>
                    setFormData((prev) => ({ ...prev, dropoff: addr }))
                  );
                }
              }}
            />
            <button
              type="button"
              onClick={() => setIsMapClicked("dropoff")}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              title="Click map to set"
            >
              🗺️
            </button>
            <button
              type="button"
              onClick={() => handleManualLocation("dropoff")}
              className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
              title="Set from text"
            >
              ✅
            </button>
          </div>
        </div>

        {/* Pickup Time */}
        <div className="mb-6">
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

        {/* Request Ride Button with Fare */}
        <button
          type="submit"
          disabled={!fare}
          className={`w-full py-2 rounded-md transition flex items-center justify-center gap-2 ${
            fare
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-400 cursor-not-allowed text-white"
          }`}
        >
          {fare ? (
            <>
              Request Ride • <span className="font-bold">${fare.toFixed(2)}</span>
            </>
          ) : (
            "Calculating Fare..."
          )}
        </button>
      </form>

      {/* Instructions */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        Tip: Click 🗺️ to set location by clicking the map, or ✅ to use typed address.
      </p>
    </section>
  );
}