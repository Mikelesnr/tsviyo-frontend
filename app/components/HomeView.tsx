import PastRides from "./PastRides";
import { User } from '@/types';

type HomeViewProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function HomeView({ user, setPage }: HomeViewProps) {
  return (
    <section className="max-w-4xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold text-black-800 mb-6">Welcome to Tsviyo RideShare</h1>

      {!user ? (
        <>
          <p className="text-lg text-black-600 mb-8">
            Your one-stop solution for ride-hailing services. Sign up or log in to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setPage("signup")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
            <button
              onClick={() => setPage("login")}
              className="px-6 py-3 bg-gray-200 text-black-800 rounded-lg hover:bg-gray-300 transition"
            >
              Log In
            </button>
          </div>
        </>
      ) : (
        <div>
          <p className="text-lg text-green-600 mb-4">
            Welcome back, <span className="font-semibold">{user.name}</span>!
          </p>
          <p className="text-black-600 mb-6">
            You're logged in as a <strong>{user.role === "driver" ? "Driver" : "Rider"}</strong>.
          </p>
          <button
            onClick={() =>
              setPage(user.role === "driver" ? "driver-onboarding" : "ride-request")
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {user.role === "driver"
              ? "Go to Driver Onboarding Page"
              : "Request Your Ride"}
          </button>
          {/* {user.role === "rider" && <PastRides user={user} />} */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setPage('admin')}
              className="mt-4 mx-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Admin Dashboard
            </button>
          )}
        </div>
      )}
    </section>
  );
}