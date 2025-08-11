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
import ResendVerificationPage from "./verify-email/index";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import RideDetails from "./components/RideDetails";
import PusherClient from "./components/PusherClient";
import InstallPrompt from "./components/InstallPrompt";
import AdminPage from "./admin";
import { useState } from "react";
import { User } from '@/types';

export default function RideHailingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>("home");

  if (user && user.email_verified_at === null && page !== "verify-email") {
    setPage("verify-email");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PusherClient user={user} />
      <Header user={user} setUser={setUser} setPage={setPage} />

      <main className="container mx-auto px-4 py-8">
        {page === "home" && <HomeView user={user} setPage={setPage} />}
        {page === "signup" && <SignUp setUser={setUser} setPage={setPage} />}
        {page === "login" && <Login setUser={setUser} setPage={setPage} />}
        {page === "verify-email" && (
          <ResendVerificationPage
            user={user}
            setUser={setUser as (user: User | null) => void}
            setPage={setPage}
          />
        )}
        {page === "driver-onboarding" && <DriverOnboarding user={user} setPage={setPage} />}
        {page === "ride-request" && <RideRequest user={user} setPage={setPage} />}
        {page === "tracking" && <TrackingView user={user} setPage={setPage} />}
        {page === "fare" && <FareView user={user} setPage={setPage} />}
        {page === "rating" && <RatingView user={user} setPage={setPage} />}
        {page === "forgot-password" && <ForgotPasswordForm setPage={setPage} />}
        {page === "ride-details" && <RideDetails setPage={setPage} user={user} />}
        {page === "admin" && <AdminPage user={user} setPage={setPage} />}
      </main>
    </div>
  );
}