import { useState, useEffect } from "react";
import { User } from '@/types';

type TrackingViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function TrackingView({ user, setPage }: TrackingViewProps) {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(5);
  const [driver] = useState({
    name: "Alex Johnson",
    vehicle: "Toyota Camry 2022",
    licensePlate: "ABC-123",
    rating: 4.7,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPage("fare"), 1000);
          return 100;
        }
        return prev + 5;
      });
      setEta((prev) => (prev > 0 ? prev - 0.5 : 0));
    }, 500);

    return () => clearInterval(interval);
  }, [setPage]);

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to track your ride.</p>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ride in Progress</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Pickup: Downtown</span>
            <span className="text-gray-700">Dropoff: Airport</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-gray-600">Progress: {progress}%</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Driver Info</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{driver.name}</p>
            <p className="text-gray-600">{driver.vehicle}</p>
            <p className="text-gray-600">License Plate: {driver.licensePlate}</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-500 mr-1">★</span>
              <span>{driver.rating}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Estimated Time of Arrival</h3>
          <p className="text-center text-2xl font-bold text-blue-600">{eta.toFixed(1)} min</p>
        </div>

        <button
          onClick={() => setPage("rating")}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        >
          Cancel Ride
        </button>
      </div>
    </section>
  );
}