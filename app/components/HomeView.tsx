type HomeViewProps = {
  setPage: (page: string) => void;
};

export default function HomeView({ setPage }: HomeViewProps) {
  return (
    <section className="max-w-4xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Tsiyo RideShare</h1>
      <p className="text-lg text-gray-600 mb-8">
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
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
        >
          Log In
        </button>
      </div>
    </section>
  );
}