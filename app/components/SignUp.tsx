import { useState } from "react";
import { User } from '@/types';

type SignUpProps = {
  setUser: (user: User | null) => void;
  setPage: (page: string) => void;
};

export default function SignUp({ setUser, setPage }: SignUpProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const validateForm = () => {
    const { name, email, password, password_confirmation, phone, role } = formData;

    if (!name || !email || !password || !password_confirmation || !phone || !role) {
      setError("All fields are required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password !== password_confirmation) {
      setError("Passwords do not match.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_REGISTER_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          "Accept": process.env.NEXT_PUBLIC_ACCEPT!,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      const newUser = {
        id: data.user?.id || Date.now(),
        name: data.user?.name,
        email: data.user?.email,
        phone: data.user?.phone,
        role: data.user?.role || formData.role,
        token: data.token,
        email_verified_at: data.user?.email_verified_at || null,
      };

      setUser(newUser);
      if (newUser.email_verified_at) {

        if (newUser.role === "driver") {
          setPage("driver-onboarding");
        } else {
          setPage("ride-request");
        }
      } else {

        setPage("verify-email");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
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

        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
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

        {/* Password Confirmation */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Show Password Checkbox */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show password</span>
          </label>
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">I am a</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select your role</option>
            <option value="rider">Rider (Passenger)</option>
            <option value="driver">Driver</option>
          </select>
        </div>

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
              Creating account...
            </span>
          ) : (
            "Sign Up"
          )}
        </button>

        {/* Switch to Login */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setPage("login")}
            className="text-blue-600 hover:underline font-medium"
          >
            Log In
          </button>
        </p>
      </form>
    </section>
  );
}