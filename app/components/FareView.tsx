import { User } from '@/types';

type FareViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function FareView({ user, setPage }: FareViewProps) {
  const fare = 24.5;
  const distance = 8.5;
  const duration = 22;

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-red-600">Please log in to view fare details.</p>
      </div>
    );
  }

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-black-800 mb-6 text-center">Fare Details</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <div className="flex justify-between border-b pb-2 mb-2">
            <span>Distance</span>
            <span>{distance} km</span>
          </div>
          <div className="flex justify-between border-b pb-2 mb-2">
            <span>Duration</span>
            <span>{duration} min</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${fare.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => setPage("rating")}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Pay & Rate Ride
        </button>
      </div>
    </section>
  );
}