"use client";

import { useState } from "react";

export default function ResendVerificationButton({ onResendSuccess }: { onResendSuccess: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken"); // Adjust based on how you store token

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/email/verify/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        onResendSuccess(data.message);
      } else {
        onResendSuccess(data.message || "Failed to resend email.");
      }
    } catch (error) {
      onResendSuccess("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
    >
      {loading ? "Sending..." : "Resend Verification Email"}
    </button>
  );
}