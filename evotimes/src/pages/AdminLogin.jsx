
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin, getCurrentAdmin } from "../services/adminService";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminLogin(email.trim(), password);
      await getCurrentAdmin();
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-5 py-12 text-[#171717]">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="font-serif text-3xl font-bold tracking-tight"
        >
          Evo<span className="text-red-700">Times</span>
        </Link>

        <div className="mt-10 border-t-4 border-red-700 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">
            Editorial access
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold">
            Admin login
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Sign in to manage articles and publications.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 outline-none transition focus:border-red-700"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-neutral-300 px-4 py-3 outline-none transition focus:border-red-700"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 px-5 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-neutral-500">
          EvoTimes content management system
        </p>
      </div>
    </main>
  );
}
