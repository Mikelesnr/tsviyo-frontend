'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from '@/types';

type LoginProps = {
  setUser: (user: User | null) => void;
  setPage: (page: string) => void;
};

export default function Login({ setUser, setPage }: LoginProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  // ✅ Function to create rider profile
  const createRiderProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rider`, {
        method: "POST",
        headers: {
          "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          Accept: process.env.NEXT_PUBLIC_ACCEPT!,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          home_address: "Default Home Address",
          image_url: "https://placehold.co/200x200/cccccc/999999?text=Rider",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Rider profile created:", data);
      } else {
        console.warn("Rider profile may already exist or failed:", data.message);
      }
    } catch (err) {
      console.error("Error creating rider profile:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
            Accept: process.env.NEXT_PUBLIC_ACCEPT!,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      const { user: userData, access_token: token, token_type } = data;

      const role = userData.role;

      const newUser = {
        id: userData.id,
        name: userData.name,
        email_verified_at: userData.email_verified_at,
        email: formData.email,
        role,
        token: `${token_type} ${token}`,
      };

      setUser(newUser);

      if (newUser.role === "rider") {
        createRiderProfile(newUser.token);
      }

      // Redirect based on verification status
      if (newUser.email_verified_at) {
        if (newUser.role === "driver") {
          setPage("home");
        } else {
          setPage("ride-request");
        }
      } else {
        setPage("verify-email");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-black-800 mb-6 text-center">Log In</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-black-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-black-700 mb-2">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Show Password Checkbox */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-black-700">Show password</span>
          </label>
        </div>

        <p className="mt-4 text-center text-sm text-black-600">
          Forgot your password?{" "}
          <button
            type="button"
            onClick={() => setPage("forgot-password")}
            className="text-blue-600 hover:underline font-medium"
          >
            Reset it here
          </button>
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 flex justify-center"
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </span>
          ) : (
            "Log In"
          )}
        </button>

        {/* Switch to Sign Up */}
        <p className="mt-4 text-center text-sm text-black-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setPage("signup")}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </button>
        </p>
      </form>
    </section>
  );
}