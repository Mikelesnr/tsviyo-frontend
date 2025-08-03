"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Target,
  Clock,
  User,
  X,
  DollarSign,
  Calendar,
} from "lucide-react";

// Use the Pusher credentials from your .env file
const PUSHER_APP_KEY = "eb78cbc00e2e7bbffb94";
const PUSHER_APP_CLUSTER = "us3";

const App = () => {
  const [rideRequests, setRideRequests] = useState([]);
  const [pusherReady, setPusherReady] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Custom modal component to replace the native alert() function
  const AlertModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative text-center">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Notification</h3>
        <p className="text-slate-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    // Dynamically load the Pusher script from a CDN to fix the compilation error
    const script = document.createElement("script");
    script.src = `https://js.pusher.com/8.0.1/pusher.min.js`;
    script.async = true;
    script.onload = () => {
      console.log("Pusher script loaded.");
      setPusherReady(true);
    };
    script.onerror = () => {
      console.error("Failed to load Pusher script.");
      setPusherReady(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup the script tag on component unmount
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Only proceed if the Pusher script is loaded and the key is set
    if (!pusherReady || !window.Pusher || !PUSHER_APP_KEY) {
      if (pusherReady) {
        console.error("Pusher App Key is missing or invalid.");
      }
      return;
    }

    try {
      window.Pusher.logToConsole = true;

      const pusher = new window.Pusher(PUSHER_APP_KEY, {
        cluster: PUSHER_APP_CLUSTER,
        // Using a public channel, no need for auth
      });

      // Subscribe to the 'rides.nearby' channel from your backend's RideRequested event
      const channel = pusher.subscribe("rides.nearby");

      // Bind to the 'RideRequested' event, which matches the event in your console log
      channel.bind("RideRequested", (data) => {
        // Log the raw data so the developer can see the structure
        console.log("Raw Pusher data:", data);

        // Correctly access the nested ride object from the data payload
        const rideData = data.ride;

        console.log("Parsed ride data:", rideData);

        // Create a new ride object with all the details for display
        const newRide = {
          id: rideData.id,
          rider_id: rideData.rider_id, // Now using a real rider ID from the payload
          pickup_lat: rideData.pickup_lat,
          pickup_lng: rideData.pickup_lng,
          dropoff_lat: rideData.dropoff_lat,
          dropoff_lng: rideData.dropoff_lng,
          pickup_address: rideData.pickup_add,
          dropoff_address: rideData.dropoff_add,
          pickup_time: rideData.pickup_time,
          fare: rideData.fare,
          status: rideData.status,
          timestamp: new Date().toISOString(),
        };

        setRideRequests((prevRequests) => [newRide, ...prevRequests]);
      });

      return () => {
        if (channel) {
          pusher.unsubscribe("rides.nearby");
          pusher.disconnect();
        }
      };
    } catch (error) {
      console.error("Failed to initialize Pusher:", error);
    }
  }, [pusherReady]); // Re-run this effect when the pusher script is loaded

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleAcceptRide = (requestId) => {
    console.log(`Accepted ride request with ID: ${requestId}`);
    setAlertMessage("You have accepted the ride request.");
    setIsAlertModalOpen(true);
    setRideRequests(rideRequests.filter((req) => req.id !== requestId));
    setIsDetailsModalOpen(false);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequest(null);
  };

  const closeAlertModal = () => {
    setIsAlertModalOpen(false);
    setAlertMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12 text-slate-800">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-200">
          <h1 className="text-4xl font-extrabold text-blue-700 flex items-center">
            <Truck className="h-10 w-10 mr-3 text-blue-600" />
            Driver Dashboard
          </h1>
          <span className="text-sm text-slate-500 font-medium">
            Status:{" "}
            {pusherReady ? (
              <span className="text-green-600">Online</span>
            ) : (
              <span className="text-red-600">Offline</span>
            )}
          </span>
        </header>

        <main>
          {rideRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg border border-slate-200">
              <Clock className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-xl font-medium text-slate-500">
                {pusherReady
                  ? "Waiting for new ride requests..."
                  : "Connecting to real-time service..."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-700">
                New Requests ({rideRequests.length})
              </h2>
              {rideRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-700">
                      Ride Request
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-500" />
                      {/* Now showing the Rider ID from the payload */}
                      <span>Rider ID: {request.rider_id}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      {/* Now using pickup_address from the payload */}
                      <span>Pickup: {request.pickup_address}</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-blue-500" />
                      {/* Now using dropoff_address from the payload */}
                      <span>Dropoff: {request.dropoff_address}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isDetailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              Ride Details
            </h3>
            <div className="space-y-4 text-slate-700">
              {/* Updated to show Rider ID from payload */}
              <p className="flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                <strong>Rider ID:</strong> {selectedRequest.rider_id}
              </p>
              {/* Updated to show addresses from payload */}
              {selectedRequest.pickup_address && (
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  <strong>Pickup Address:</strong>{" "}
                  {selectedRequest.pickup_address}
                </p>
              )}
              {selectedRequest.dropoff_address && (
                <p className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-500" />
                  <strong>Dropoff Address:</strong>{" "}
                  {selectedRequest.dropoff_address}
                </p>
              )}
              {/* Displaying lat/lng for context as well */}
              <p className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                <strong>Pickup Coords:</strong> {selectedRequest.pickup_lat},{" "}
                {selectedRequest.pickup_lng}
              </p>
              <p className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-500" />
                <strong>Dropoff Coords:</strong> {selectedRequest.dropoff_lat},{" "}
                {selectedRequest.dropoff_lng}
              </p>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <strong>Time:</strong>{" "}
                {new Date(selectedRequest.timestamp).toLocaleString()}
              </p>
              {selectedRequest.fare && (
                <p className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                  <strong>Fare:</strong> ${selectedRequest.fare}
                </p>
              )}
              {selectedRequest.pickup_time && (
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <strong>Pickup Time:</strong>{" "}
                  {new Date(selectedRequest.pickup_time).toLocaleString()}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAcceptRide(selectedRequest.id)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors"
              >
                Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {isAlertModalOpen && (
        <AlertModal message={alertMessage} onClose={closeAlertModal} />
      )}
    </div>
  );
};

export default App;
