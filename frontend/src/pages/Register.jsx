import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, register, setCachedUser, setToken } from "../services/api";
import logo from "../assets/logo.png";
import { useToast } from "../components/ToastProvider";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const translations = {
  en: {
    createAccount: "Create account",
    subtitle:
      "Join the platform to access your dashboard and manage transport operations with clarity and speed.",
    fullName: "Full name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "you@company.com",
    phone: "Phone Number",
    phonePlaceholder: "+212 ...",
    password: "Password",
    passwordPlaceholder: "Create a strong password",
    confirmPassword: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    creating: "Creating account...",
    alreadyHave: "Already have an account?",
    signIn: "Sign in",
    mismatchTitle: "Password mismatch",
    mismatchDesc: "Password confirmation does not match.",
    failedTitle: "Registration failed",
    panelKicker: "New Account Benefits",
    panelTitle: "Start Operating Faster",
    panelBody:
      "Access your orders, track shipment updates, and communicate with the operations team in one place.",
    benefit1: "Real-time order visibility",
    benefit2: "Simplified communication",
    benefit3: "Secure role-based access",
  },
  fr: {
    createAccount: "Créer un compte",
    subtitle:
      "Rejoignez la plateforme pour accéder à votre tableau de bord et gérer les opérations de transport avec clarté.",
    fullName: "Nom complet",
    fullNamePlaceholder: "Saisissez votre nom complet",
    email: "Email",
    emailPlaceholder: "vous@entreprise.com",
    phone: "Numéro de téléphone",
    phonePlaceholder: "+212 ...",
    password: "Mot de passe",
    passwordPlaceholder: "Créez un mot de passe fort",
    confirmPassword: "Confirmer le mot de passe",
    confirmPasswordPlaceholder: "Répétez votre mot de passe",
    creating: "Création du compte...",
    alreadyHave: "Vous avez déjà un compte ?",
    signIn: "Se connecter",
    mismatchTitle: "Mots de passe différents",
    mismatchDesc: "La confirmation du mot de passe ne correspond pas.",
    failedTitle: "Inscription échouée",
    panelKicker: "Avantages du compte",
    panelTitle: "Démarrez plus vite",
    panelBody:
      "Accédez à vos commandes, suivez les expéditions et communiquez avec l'équipe depuis un seul espace.",
    benefit1: "Visibilité des commandes en temps réel",
    benefit2: "Communication simplifiée",
    benefit3: "Accès sécurisé selon le rôle",
  },
};

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    telephone : "",
  });
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (form.password !== form.password_confirmation) {
      addToast({
        type: "warning",
        title: t.mismatchTitle,
        description: t.mismatchDesc,
      });
      setLoading(false);
      return;
    }

    try {
      const result = await register(form);
      setToken(result.token);

      const profile = await getMe();
      setCachedUser(profile);
      const roleName = (profile?.role_name || profile?.role || "").toLowerCase();
      const targetDashboard = roleName === "admin" ? "/dashboard" : "/client/dashboard";

      navigate(targetDashboard, { replace: true, state: { user: profile } });
    } catch (err) {
      addToast({
        type: "error",
        title: t.failedTitle,
        description: err.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,_rgba(14,165,233,0.18),_transparent_42%),radial-gradient(circle_at_80%_20%,_rgba(99,102,241,0.16),_transparent_36%),linear-gradient(170deg,_#04060c,_#0b1324)]" />
          <div className="absolute -right-28 bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-7">
              <span className="inline-flex items-center rounded-full border border-sky-300/25 bg-sky-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100">
                AK Rapid Trans
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{t.createAccount}</h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                {t.subtitle}
              </p>
            </div>

            <div className="rounded-[30px] border border-white/12 bg-white/[0.06] p-7 shadow-[0_28px_90px_rgba(2,12,32,0.65)] backdrop-blur-2xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">{t.fullName}</label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/15 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                    placeholder={t.fullNamePlaceholder}
                  />
                </div>

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
                  <label className="mb-2 block text-sm font-medium text-slate-200">{t.phone}</label>
                  <input
                    name="telephone"
                    type="text"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/15 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                    placeholder={t.phonePlaceholder}
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">{t.confirmPassword}</label>
                  <input
                    name="password_confirmation"
                    type="password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/15 bg-[#0a1222] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                    placeholder={t.confirmPasswordPlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(14,165,233,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? t.creating : t.createAccount}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-300">
                {t.alreadyHave}{" "}
                <Link to="/" className="font-medium text-sky-300 transition hover:text-sky-200 hover:underline">
                  {t.signIn}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <img src={logo} alt="AK Rapid Trans" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#020617]/90 via-[#020617]/55 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_rgba(99,102,241,0.3),_transparent_35%)]" />

          <div className="absolute bottom-10 left-10 right-10 rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/90">{t.panelKicker}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{t.panelTitle}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">
              {t.panelBody}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-100">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> {t.benefit1}</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> {t.benefit2}</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> {t.benefit3}</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;