'use client';

import { useState } from 'react';

export default function ForgotPasswordForm({ setPage }: { setPage: (page: string) => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
       const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_FORGOT_PASSWORD_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
            Accept: process.env.NEXT_PUBLIC_ACCEPT!,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.status || 'Password reset link sent to your email.');
      } else {
        setError(data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-black-800 mb-6 text-center">Forgot Password?</h2>
      <p className="text-black-600 mb-6 text-center">Enter your email to receive a password reset link.</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-black-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        <button
          type="button"
          onClick={() => setPage("login")}
          className="mt-4 text-blue-600 hover:underline font-medium"
        >
          Back to Login
        </button>
      </form>
    </section>
  );
}