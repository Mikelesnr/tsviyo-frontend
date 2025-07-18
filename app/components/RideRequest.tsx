import { useState } from "react";

type RideRequestProps = {
  user: any;
  setPage: (page: string) => void;
};

export default function RideRequest({ user, setPage }: RideRequestProps) {
  const [formData, setFormData] = useState({
    pickup: "",
    dropoff: "",
    pickupTime: new Date().toISOString().slice(0, 16),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Finding a driver for your ride...");
    setTimeout(() => {
      setPage("tracking");
    }, 1500);
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to request a ride.</p>
      </div>
    );
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Request a Ride</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pickup Location</label>
          <input
            type="text"
            name="pickup"
            value={formData.pickup}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter pickup address"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Dropoff Location</label>
          <input
            type="text"
            name="dropoff"
            value={formData.dropoff}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter dropoff address"
            required
          />
        </div>
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Request Ride
        </button>
      </form>
    </section>
  );
}