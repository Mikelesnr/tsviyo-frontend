'use client';
import { useRouter } from "next/navigation";
import { User } from "@/types";

type VerifyEmailPageProps = {
  user: User | null;
  setUser: (user: User | null) => void;
  setPage: (page: string) => void;
};

export default function ResendVerificationPage({ user, setUser, setPage }: VerifyEmailPageProps) {
  const router = useRouter();

  // If not logged in, redirect
  if (!user) {
    router.push("/login");
    return null;
  }

  console.log("Sending token:", user.token);

  // If already verified
  if (user.email_verified_at !== null) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Email Already Verified</h1>
        <p className="text-black-600 mb-6">
          Your email has already been verified. You can now request rides or drive.
        </p>
        <button
          onClick={() => {
            if (user.role === "driver") {
              setPage("driver-onboarding");
            } else {
              setPage("ride-request");
            }
          }}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Continue to App
        </button>
      </div>
    );
  }

  const handleResend = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_RESEND_VERIFICATION_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
            Accept: process.env.NEXT_PUBLIC_ACCEPT!,
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Verification email sent.");
      } else {
        alert(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-black-800 mb-6">Verify Your Email</h1>

      <p className="text-black-600 mb-6">
        We’ve sent a verification link to <strong>{user.email}</strong>. Please check your inbox.
      </p>

      <button
        type="button"
        onClick={handleResend}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-4"
      >
        Resend Verification Email
      </button>
    </div>
  );
}