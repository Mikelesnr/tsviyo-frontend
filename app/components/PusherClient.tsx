"use client";

import { useEffect, useState } from "react";
import { DollarSign, MapPin, Target, Clock, X } from "lucide-react";
import { User } from "@/types";

declare global {
  interface Window {
    Pusher?: any;
  }
}

type Ride = {
  id: number;
  rider_id: number;
  driver_id: number | null;
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
  const [alertMessage, setAlertMessage] = useState("");
  const [ride_id, setRideId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    const script = document.createElement("script");
    script.id = "pusher-script";
    script.src = "https://js.pusher.com/8.3.0/pusher.min.js";
    script.async = true;

    script.onload = () => {
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
        console.error("Pusher key is missing");
        return;
      }

      const pusher = new window.Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: "us3",
      });

      // Debug connection
      pusher.connection.bind("state_change", (states: any) => {
        console.log(`[Pusher] ${states.previous} → ${states.current}`);
      });

      // Subscribe to public channel for new ride requests
      if (user.role === "driver") {
        const channel = pusher.subscribe("rides.nearby");

        channel.bind("pusher:subscription_succeeded", () => {
          console.log('✅ Subscribed to "rides.nearby"');
        });

        channel.bind("RideRequested", (data: any) => {
          console.log("🚨 Driver: Ride requested:", data);
          const rideData = data.ride;
          setRideId(rideData.id);
          const newRide: Ride = {
            id: rideData.id,
            rider_id: rideData.rider_id,
            driver_id: null, // Driver ID will be assigned later
            pickup_address: rideData.pickup_add || "Unknown Pickup",
            dropoff_address: rideData.dropoff_add || "Unknown Dropoff",
            pickup_lat: rideData.pickup_lat,
            pickup_lng: rideData.pickup_lng,
            dropoff_lat: rideData.dropoff_lat,
            dropoff_lng: rideData.dropoff_lng,
            fare:
              typeof rideData.fare === "string"
                ? parseFloat(rideData.fare)
                : rideData.fare,
            pickup_time: rideData.pickup_time,
            status: rideData.status,
            timestamp: new Date().toISOString(),
          };

          setSelectedRide(newRide);
          setAlertMessage("New ride request!");
          setIsModalOpen(true);
        });
      }

      // Subscribe to private channel for ride updates
      if (user.role === "rider") {
        const channel = pusher.subscribe("rides.nearby");

        channel.bind("pusher:subscription_succeeded", () => {
          console.log("✅ Subscribed to 'rides.nearby'");
        });

        channel.bind("RideAccepted", (data: any) => {
          console.log("🎉 Rider: Ride accepted:", data);
          // Retrieve ride_id from localStorage once
          const storedRide = localStorage.getItem("currentRide");
          console.log("Stored Ride:", storedRide);
          const current_ride_id = storedRide ? JSON.parse(storedRide).id : null;
          console.log("Current Ride ID:", current_ride_id);

          const ride = data.ride;
          console.log("Ride ID:", ride.id, "Current Ride ID:", current_ride_id);
          if (ride.id === current_ride_id) {
            setAlertMessage(
              "🎉 Your ride has been accepted! A driver is on the way."
            );
            setIsModalOpen(true);
          }
        });

        channel.bind("RideCancelled", (data: any) => {
          console.log("🚫 Rider: Ride cancelled:", data);
          const ride = data.ride;
          const storedRide = localStorage.getItem("currentRide");
          console.log("Stored Ride:", storedRide);
          const current_ride_id = storedRide ? JSON.parse(storedRide).id : null;
          console.log("Current Ride ID:", current_ride_id);

          if (ride.id === current_ride_id) {
            setAlertMessage(
              "🚫 Your ride was cancelled. Please request a new one."
            );
            setIsModalOpen(true);
          }
        });
      }

      return () => {
        pusher.disconnect();
      };
    };

    script.onerror = () => {
      console.error("Failed to load Pusher SDK");
    };

    document.head.appendChild(script);

    return () => {
      const scriptTag = document.getElementById("pusher-script");
      if (scriptTag) {
        document.head.removeChild(scriptTag);
      }
    };
  }, [user]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRide(null);
    setAlertMessage("");
  };

  const handleAcceptRide = async () => {
    setLoading(true);
    setError(null);

    if (!user || !user.token) {
      setError("Authentication error: User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/driver/rides/${ride_id}/accept`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
            Accept: process.env.NEXT_PUBLIC_ACCEPT!,
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept ride");
      }

      // ✅ Success: You can update UI or redirect
      console.log("Ride accepted:", data);
      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              {user?.role === "driver" ? "New Ride Request" : "Ride Update"}
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              {user?.role === "driver" && selectedRide ? (
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
                    <strong>Fare:</strong> $
                    {(typeof selectedRide.fare === "number"
                      ? selectedRide.fare
                      : 0
                    ).toFixed(2)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-black-600" />
                    <strong>Time:</strong>{" "}
                    {new Date(
                      new Date(selectedRide.timestamp).getTime() -
                        60 * 60 * 1000
                    ).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p>{alertMessage}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={user?.role === "rider" ? closeModal : handleAcceptRide}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {user?.role === "rider" ? "Ok" : "Accept Ride"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
