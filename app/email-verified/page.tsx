'use client';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (status === "success") {
      setTitle("Email Verified Successfully! 🎉");
      setMessage("You can now use all features of Tsiyo RideShare.");
    } else if (status === "already") {
      setTitle("Email Already Verified");
      setMessage("Your email was already confirmed. You can now request rides or drive.");
    } else {
      setTitle("Verification Failed");
      setMessage("The verification link is invalid or expired. Please request a new one.");
    }
  }, [status]);

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-gray-600 mb-6">{message}</p>

      <a
        href="/"
        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Go Home
      </a>
    </div>
  );
}