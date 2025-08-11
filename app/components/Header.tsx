import { useRouter } from "next/navigation";
import { User, Ride, Vehicle } from '@/types';

type HeaderProps = {
  user: User | null;
  setUser: (user: User | null) => void;
  setPage: (page: string) => void;
};

export default function Header({ user, setUser, setPage }: HeaderProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    setPage("home");
  };

  const handleLogout = async () => {
    try {
      if (user?.token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_LOGOUT_ENDPOINT}`, {
          method: "POST",
          headers: {
            "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
            Accept: process.env.NEXT_PUBLIC_ACCEPT!,
            Authorization: `Bearer ${user.token}`, 
          },
          body: JSON.stringify({ token: user.token }),
        });
      }
    } catch (error) {
      console.warn("Failed to reach logout endpoint, continuing logout locally.");
    }

    setUser(null);

    setPage("home");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="text-2xl font-bold text-blue-600 focus:outline-none"
        >
          Tsviyo RideShare
        </button>

        <div className="flex items-center space-x-6">
          {/* User Info: Role and Name */}
          {user && (
            <span className="text-sm text-black-600 font-medium">
              {user.role === "driver" ? "Driver" : "Rider"}: {user.name}
            </span>
          )}

          {/* Navigation */}
          <nav className="space-x-4">
            {user ? (
              <>
                {/* Show "Request Ride" only if user is NOT a driver */}
                {user.role !== "driver" && (
                  <button
                    onClick={() => setPage("ride-request")}
                    className="text-blue-600 hover:underline"
                  >
                    Request Ride
                  </button>
                )}

                {/* Show "Driver Onboard" only if user IS a driver */}
                {user.role === "driver" && (
                  <button
                    onClick={() => setPage("driver-onboarding")}
                    className="text-blue-600 hover:underline"
                  >
                    Driver Onboard
                  </button>
                )}

                {/* Always show Logout */}
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPage("login")}
                  className="text-blue-600 hover:underline"
                >
                  Login
                </button>
                <button
                  onClick={() => setPage("signup")}
                  className="text-blue-600 hover:underline"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}