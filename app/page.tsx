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
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import RideDetails from "./components/RideDetails";
import PusherClient from "./components/PusherClient";
import AdminPage from "./admin/page";
import { useState } from "react";

export default function RideHailingPage() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState<string>("home");

  // If user exists but email is not verified, set page to verify-email
  if (user && user.email_verified_at === null && page !== "verify-email") {
    setPage("verify-email");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PusherClient />
      <Header user={user} setUser={setUser} setPage={setPage} />

      <main className="container mx-auto px-4 py-8">
        {page === "home" && <HomeView user={user} setPage={setPage} />}
        {page === "signup" && <SignUp setUser={setUser} setPage={setPage} />}
        {page === "login" && <Login setUser={setUser} setPage={setPage} />}
        {page === "verify-email" && <ResendVerificationPage user={user} setUser={setUser} setPage={setPage} />}
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