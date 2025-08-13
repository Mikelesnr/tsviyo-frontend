'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';

type RatingViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function RatingView({ user, setPage }: RatingViewProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

const [ride, setRide] = useState<any>(null);
const [revieweeId, setRevieweeId] = useState<number | null>(null);

useEffect(() => {
  const savedRide = localStorage.getItem('acceptedRide');
  if (savedRide) {
    const parsedRide = JSON.parse(savedRide);
    setRide(parsedRide);

    // ✅ Extract driver_id from accepted ride
    if (user?.role === 'rider' && parsedRide.driver_id) {
      setRevieweeId(parsedRide.driver_id);
    } else {
      setRevieweeId(null);
    }
  }
}, [user]);

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.token) {
      setError('Authentication error. Please log in again.');
      return;
    }

    if (!revieweeId) {
      setError('No user to rate.');
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          'Accept': process.env.NEXT_PUBLIC_ACCEPT!,
        },
        body: JSON.stringify({
          ride_id: ride.id,
          reviewee_id: revieweeId,
          stars: rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit rating');
      }

      // Clear ride data
      localStorage.removeItem('acceptedRide');

      // Redirect
      alert(`Thank you for your rating of ${rating} stars!`);
      setPage('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to submit a rating.</p>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">No ride data found.</p>
      </div>
    );
  }

  if (!revieweeId) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-yellow-600">No one to rate for this ride.</p>
      </div>
    );
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Rate Your Ride</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <p className="text-center text-gray-700 mb-4">How was your experience?</p>
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                className={`text-2xl focus:outline-none ${star <= rating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-gray-600">
              You rated {rating} {rating === 1 ? 'star' : 'stars'}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Additional Comments (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Tell us about your experience..."
            ></textarea>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={rating === 0 || loading}
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </section>
  );
}