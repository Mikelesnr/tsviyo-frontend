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
import { useState } from "react";

export default function RideHailingPage() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState<string>("home");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} setUser={setUser} setPage={setPage} />

      <main className="container mx-auto px-4 py-8">
        {page === "home" && <HomeView user={user} setPage={setPage} />}

        {page === "signup" && <SignUp setUser={setUser} setPage={setPage} />}
        {page === "login" && <Login setUser={setUser} setPage={setPage} />}
        {page === "driver-onboarding" && <DriverOnboarding user={user} />}
        {page === "ride-request" && <RideRequest user={user} setPage={setPage} />}
        {page === "tracking" && <TrackingView user={user} setPage={setPage} />}
        {page === "fare" && <FareView user={user} setPage={setPage} />}
        {page === "rating" && <RatingView user={user} setPage={setPage} />}
      </main>
    </div>
  );
}