'use client';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Define user type
type User = {
  role: string;
};

export default function EmailVerifiedForm() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "success") {
      setTitle("Email Verified Successfully! 🎉");
      setMessage("You can now use all features of Tsviyo RideShare.");
    } else if (status === "already") {
      setTitle("Email Already Verified");
      setMessage("Your email was already confirmed. You can now request rides or drive.");
    } else {
      setTitle("Verification Failed");
      setMessage("The verification link is invalid or expired. Please request a new one.");
    }
  }, [status]);

  const handleContinue = () => {
    if (!user) {
      window.location.href = "/";
      return;
    }

    // ✅ Redirect based on role
    if (user.role === "driver") {
      setPage ? setPage("driver-onboarding") : (window.location.href = "/ride-hailing?view=driver-onboarding");
    } else {
      setPage ? setPage("ride-request") : (window.location.href = "/ride-hailing?view=ride-request");
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{message}</p>

      <button
        onClick={handleContinue}
        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Continue to App
      </button>
    </div>
  );
}