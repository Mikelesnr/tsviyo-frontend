'use client';
import Header from "./components/Header";
import HomeView from "./components/HomeView";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import DriverOnboarding from "./components/DriverOnboarding";
import RideRequest from "./components/RideRequest";
import TrackingView from "./components/TrackingView";
import FareView from "./components/FareView";
import RatingView from "./components/RatingView";
import ResendVerificationPage from "./verify-email/page";
import { useState } from "react";

export default function RideHailingPage() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState<string>("home");

  // If user exists but email is not verified, show verification prompt
  if (user && user.email_verified_at === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Email Verification Required</h2>
          <p className="text-gray-600 mb-6">
            We sent a verification link to <strong>{user.email}</strong>. Please check your inbox.
          </p>
          <button
            onClick={() => setPage("verify-email")}
            className="text-blue-600 hover:underline font-medium"
          >
            Go to Verification Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} setPage={setPage} />

      <main className="container mx-auto px-4 py-8">
        {page === "home" && <HomeView user={user} setPage={setPage} />}
        {page === "signup" && <SignUp setUser={setUser} setPage={setPage} />}
        {page === "login" && <Login setUser={setUser} setPage={setPage} />}
        {page === "verify-email" && <ResendVerificationPage user={user} setUser={setUser} setPage={setPage} />}
        {page === "driver-onboarding" && <DriverOnboarding user={user} />}
        {page === "ride-request" && <RideRequest user={user} setPage={setPage} />}
        {page === "tracking" && <TrackingView user={user} setPage={setPage} />}
        {page === "fare" && <FareView user={user} setPage={setPage} />}
        {page === "rating" && <RatingView user={user} setPage={setPage} />}
      </main>
    </div>
  );
}