import Link from "next/link";
import { useRouter } from "next/navigation";

type HeaderProps = {
  user: any;
  setPage: (page: string) => void;
};

export default function Header({ user, setPage }: HeaderProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    setPage("home");

  };
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={handleLogoClick}
          className="text-2xl font-bold text-blue-600 focus:outline-none"
        >
          Tsiyo RideShare
        </button>
        <nav className="space-x-4">
          {user ? (
            <>
              <button
                onClick={() => setPage("ride-request")}
                className="text-blue-600 hover:underline"
              >
                Request Ride
              </button>
              <button
                onClick={() => setPage("driver-onboarding")}
                className="text-blue-600 hover:underline"
              >
                Driver Onboard
              </button>
              <button
                onClick={() => setPage("home")}
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
    </header>
  );
}