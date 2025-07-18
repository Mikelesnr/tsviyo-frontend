import { useState } from "react";

type LoginProps = {
  setUser: (user: any) => void;
  setPage: (page: string) => void;
};

export default function Login({ setUser, setPage }: LoginProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      name: "John Doe",
      email: formData.email,
      role: "user",
    };
    setUser(newUser);
    setPage("ride-request");
  };

  return (
    <section className="max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log In</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Log In
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setPage("signup")}
            className="text-blue-600 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </form>
    </section>
  );
}