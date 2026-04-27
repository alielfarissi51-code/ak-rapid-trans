import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, login, setCachedUser, setToken } from "../services/api";
import logo from "../assets/logo.png";
import { useToast } from "../components/ToastProvider";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const translations = {
  en: {
    sessionExpired: "Session expired",
    signInFailed: "Sign in failed",
    signIn: "Sign in",
    subtitle:
      "Welcome back. Access your workspace and continue managing fleet, routes, and deliveries in one secure platform.",
    email: "Email",
    emailPlaceholder: "you@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    signingIn: "Signing in...",
    noAccount: "Do not have an account?",
    createOne: "Create one",
    opsSnapshot: "Operations Snapshot",
    controlRealTime: "Control in Real Time",
    panelText:
      "Monitor vehicle status, client requests, and delivery activity from a single control center.",
    support: "Support",
    tracking: "Tracking",
    access: "Access",
  },
  fr: {
    sessionExpired: "Session expirée",
    signInFailed: "Connexion échouée",
    signIn: "Se connecter",
    subtitle:
      "Bon retour. Accédez à votre espace et continuez à gérer flotte, trajets et livraisons sur une plateforme sécurisée.",
    email: "Email",
    emailPlaceholder: "vous@entreprise.com",
    password: "Mot de passe",
    passwordPlaceholder: "Saisissez votre mot de passe",
    signingIn: "Connexion...",
    noAccount: "Vous n'avez pas de compte ?",
    createOne: "Créer un compte",
    opsSnapshot: "Vue d'ensemble",
    controlRealTime: "Contrôle en temps réel",
    panelText:
      "Suivez les statuts des véhicules, les demandes clients et l'activité des livraisons depuis un seul centre.",
    support: "Support",
    tracking: "Suivi",
    access: "Accès",
  },
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(() => (getStoredPreferences().lang === "fr" ? "fr" : "en"));
  const { addToast } = useToast();
  const t = translations[lang];

  useEffect(() => {
    const handler = (event) => {
      const nextLang = event?.detail?.lang || getStoredPreferences().lang;
      setLang(nextLang === "fr" ? "fr" : "en");
    };

    window.addEventListener(PREFERENCES_EVENT, handler);
    return () => window.removeEventListener(PREFERENCES_EVENT, handler);
  }, []);

  useEffect(() => {
    if (location.state?.errorMessage) {
      addToast({
        type: "error",
        title: t.sessionExpired,
        description: location.state.errorMessage,
      });
    }
  }, [location.state, addToast, t.sessionExpired]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    clearToken();

    try {
      const result = await login(form);
      setToken(result.token);
      setCachedUser(result.user);
      const roleName = result?.user?.role_name || result?.user?.role;
      const targetDashboard = roleName === "admin" ? "/dashboard-admin" : "/dashboard-client";

      navigate(targetDashboard, {
        state: { successMessage: "Logged in successfully.", user: result.user },
      });
    } catch (err) {
      addToast({
        type: "error",
        title: t.signInFailed,
        description: err.message || "Erreur de connexion",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,_rgba(14,165,233,0.2),_transparent_40%),radial-gradient(circle_at_85%_20%,_rgba(56,189,248,0.14),_transparent_36%),linear-gradient(170deg,_#04060c,_#0b1324)]" />
          <div className="absolute -left-28 top-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-7">
              <span className="inline-flex items-center rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100">
                AK Rapid Trans
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{t.signIn}</h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                {t.subtitle}
              </p>
            </div>

            <div className="rounded-[30px] border border-white/12 bg-white/[0.06] p-7 shadow-[0_28px_90px_rgba(2,12,32,0.65)] backdrop-blur-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">{t.email}</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/15 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">{t.password}</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/15 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                    placeholder={t.passwordPlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(14,165,233,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? t.signingIn : t.signIn}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-300">
                {t.noAccount}{" "}
                <Link to="/register" className="font-medium text-sky-300 transition hover:text-sky-200 hover:underline">
                  {t.createOne}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <img src={logo} alt="AK Rapid Trans" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/90 via-[#020617]/55 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_rgba(56,189,248,0.28),_transparent_35%)]" />

          <div className="absolute bottom-10 left-10 right-10 rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/90">{t.opsSnapshot}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{t.controlRealTime}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">
              {t.panelText}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3">
                <p className="text-lg font-bold text-white">24/7</p>
                <p className="text-xs text-slate-200">{t.support}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3">
                <p className="text-lg font-bold text-white">Live</p>
                <p className="text-xs text-slate-200">{t.tracking}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3">
                <p className="text-lg font-bold text-white">Secure</p>
                <p className="text-xs text-slate-200">{t.access}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;