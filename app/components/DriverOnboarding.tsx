'use client';

import { useState } from "react";
import { User } from "@/types";

type DriverOnboardingProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function DriverOnboarding({ user, setPage }: DriverOnboardingProps) {
  const [step, setStep] = useState<'profile' | 'vehicle'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Driver Profile
  const [profileData, setProfileData] = useState({
    licenseNumber: '',
    imageUrl: '',
  });

  // Step 2: Vehicle Info
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    licensePlate: '',
    year: '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Driver Profile
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user || !user.token) {
      setError("Authentication error: User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/driver/profile`, {
        method: 'POST',
        headers: {
          "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          Accept: process.env.NEXT_PUBLIC_ACCEPT!,
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          license_number: profileData.licenseNumber,
          image_url: profileData.imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create driver profile');
      }

      // ✅ Success: Move to vehicle step
      setStep('vehicle');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Vehicle
  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user || !user.token) {
      setError("Authentication error: User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/driver/vehicles`, {
        method: 'POST',
        headers: {
          "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          Accept: process.env.NEXT_PUBLIC_ACCEPT!,
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          make: vehicleData.make,
          model: vehicleData.model,
          plate_number: vehicleData.licensePlate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register vehicle');
      }

      // ✅ Success: Onboarding complete
      alert('Onboarding complete! Your account is under review.');
      setPage('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to access driver onboarding.</p>
      </div>
    );
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Driver Onboarding</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Driver Profile */}
      {step === 'profile' && (
        <form onSubmit={handleSubmitProfile} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Step 1: Driver Profile</h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={profileData.licenseNumber}
              onChange={handleProfileChange}
              className="w-full p-2 border rounded-md"
              placeholder="DLX-0071"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Profile Image URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              value={profileData.imageUrl}
              onChange={handleProfileChange}
              className="w-full p-2 border rounded-md"
              placeholder="https://example.com/images/avatar.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 flex justify-center"
          >
            {loading ? 'Saving...' : 'Continue to Vehicle Info'}
          </button>
        </form>
      )}

      {/* Step 2: Vehicle Info */}
      {step === 'vehicle' && (
        <form onSubmit={handleSubmitVehicle} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Step 2: Vehicle Information</h3>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Make</label>
            <input
              type="text"
              name="make"
              value={vehicleData.make}
              onChange={handleVehicleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Model</label>
            <input
              type="text"
              name="model"
              value={vehicleData.model}
              onChange={handleVehicleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">License Plate</label>
            <input
              type="text"
              name="licensePlate"
              value={vehicleData.licensePlate}
              onChange={handleVehicleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={vehicleData.year}
              onChange={handleVehicleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('profile')}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:bg-green-400"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}