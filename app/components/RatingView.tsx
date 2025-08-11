import { useState } from "react";
import { User } from '@/types';

type RatingViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function RatingView({ user, setPage }: RatingViewProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for your rating of ${rating} stars!`);
    setPage("ride-request");
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to submit a rating.</p>
      </div>
    );
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-black-800 mb-6 text-center">Rate Your Ride</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <p className="text-center text-black-700 mb-4">How was your experience?</p>
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                className={`text-2xl focus:outline-none ${
                  star <= rating ? "text-yellow-500" : "text-black-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-black-600">
              You rated {rating} {rating === 1 ? "star" : "stars"}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black-700 mb-2">Additional Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Tell us about your experience..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={rating === 0}
          >
            Submit Rating
          </button>
        </form>
      </div>
    </section>
  );
}