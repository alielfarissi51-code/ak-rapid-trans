import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, setToken } from "../services/api";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.errorMessage) {
      setError(location.state.errorMessage);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form);
      setToken(result.token);
      const roleName = result?.user?.role_name || result?.user?.role;
      const targetDashboard = roleName === "admin" ? "/dashboard-admin" : "/dashboard-client";

      navigate(targetDashboard, {
        state: { successMessage: "Logged in successfully.", user: result.user },
      });
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#05070b] text-white">
      <section className="grid h-full grid-cols-1 lg:grid-cols-2">

        {/* LEFT - FORM */}
        <div className="relative flex h-full items-center justify-center px-6 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(to_bottom,_#05070b,_#0b1120)]" />

          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100">
                AK Rapid Trans
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Sign in
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Access your transport dashboard and manage operations with speed,
                precision, and control.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm text-slate-200">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1220]/90 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-200">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1220]/90 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/15"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-400">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 font-semibold hover:brightness-110"
                >
                  {loading ? "Loading..." : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-300">
                Don’t have an account?{" "}
                <Link to="/register" className="text-sky-300 hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT - IMAGE */}
        <div className="relative hidden h-full lg:block">
          <img
            src={logo}
            alt="AK Rapid Trans"
            className="h-full w-full object-cover"
          />

          {/* overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent" />
        </div>

      </section>
    </main>
  );
}

export default Login;