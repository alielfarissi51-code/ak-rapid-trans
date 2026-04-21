import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT, setStoredPreferences } from "../utils/preferences";

const navigationItems = [
  { labelKey: "dashboard", path: "/dashboard", icon: DashboardIcon },
  { labelKey: "orders", path: "/admin/commandes", icon: OrdersIcon },
  { labelKey: "users", path: "/admin/users", icon: ClientsIcon },
  { labelKey: "trucks", path: "/admin/camions", icon: VehiclesIcon },
  { labelKey: "settings", path: "/settings", icon: SettingsIcon },
];

const sidebarTranslations = {
  en: {
    dashboard: "Dashboard",
    orders: "Orders",
    users: "Users",
    trucks: "Trucks",
    settings: "Settings",
    title: "AK Rapid Trans",
    subtitle: "Logistics control center",
    roleAdmin: "Administrator",
    roleClient: "Client",
    roleManager: "Operations Manager",
    guestUser: "Guest User",
    logout: "Logout",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    language: "Language",
    english: "English",
    french: "Francais",
    closeSidebar: "Close sidebar",
  },
  fr: {
    dashboard: "Tableau de bord",
    orders: "Commandes",
    users: "Utilisateurs",
    trucks: "Camions",
    settings: "Parametres",
    title: "AK Rapid Trans",
    subtitle: "Centre de controle logistique",
    roleAdmin: "Administrateur",
    roleClient: "Client",
    roleManager: "Responsable operations",
    guestUser: "Utilisateur invite",
    logout: "Deconnexion",
    theme: "Theme",
    dark: "Sombre",
    light: "Clair",
    language: "Langue",
    english: "Anglais",
    french: "Francais",
    closeSidebar: "Fermer la barre laterale",
  },
};

function Sidebar({
  mobileOpen = false,
  onClose = () => {},
  user,
  isAdmin = false,
  onLogout = () => {},
  preferences,
  onPreferencesChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalPreferences, setInternalPreferences] = useState(() => getStoredPreferences());
  const controlled = typeof onPreferencesChange === "function" && Boolean(preferences);
  const effectivePreferences = controlled ? preferences : internalPreferences;
  const lang = effectivePreferences?.lang === "fr" ? "fr" : "en";
  const theme = effectivePreferences?.theme === "light" ? "light" : "dark";
  const t = useMemo(() => sidebarTranslations[lang] || sidebarTranslations.en, [lang]);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handlePreferencesChanged = (event) => {
      if (controlled) {
        return;
      }

      if (event?.detail) {
        setInternalPreferences(event.detail);
      } else {
        setInternalPreferences(getStoredPreferences());
      }
    };

    window.addEventListener(PREFERENCES_EVENT, handlePreferencesChanged);

    return () => {
      window.removeEventListener(PREFERENCES_EVENT, handlePreferencesChanged);
    };
  }, [controlled]);

  const updatePreferences = (next) => {
    setStoredPreferences(next);
    applyDocumentTheme(next.theme);

    if (controlled) {
      onPreferencesChange(next);
      return;
    }

    setInternalPreferences(next);
  };

  const toggleTheme = () => {
    updatePreferences({ ...effectivePreferences, theme: theme === "dark" ? "light" : "dark" });
  };

  const toggleLanguage = () => {
    updatePreferences({ ...effectivePreferences, lang: lang === "fr" ? "en" : "fr" });
  };

  return (
    <>
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 w-[260px] border-r transition-transform duration-300 lg:translate-x-0 ${
          theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col px-5 py-6">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500">
                <span className="text-sm font-black tracking-[0.2em] text-white">AR</span>
              </div>
              <div className="mt-4">
                <h1 className={`text-lg font-semibold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                  {t.title}
                </h1>
                <p className={`text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{t.subtitle}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border p-2 transition lg:hidden ${
                theme === "light"
                  ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-300/40 hover:bg-sky-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white"
              }`}
              aria-label={t.closeSidebar}
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
                  const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.labelKey}
                  type="button"
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                      ? theme === "light"
                            ? "bg-slate-100 text-slate-900"
                        : "bg-slate-900 text-slate-100"
                      : theme === "light"
                            ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-md transition ${
                          isActive
                        ? theme === "light"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-slate-800 text-cyan-300"
                        : theme === "light"
                          ? "bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-900"
                          : "bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-left">{t[item.labelKey]}</span>
                      {isActive && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`mt-6 rounded-xl border p-4 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-sm font-semibold text-white">
                {(user?.name || "AK").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                  {user?.name || t.guestUser}
                </p>
                <p className={`truncate text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                  {isAdmin ? t.roleAdmin : user?.role_name || user?.role ? t.roleClient : t.roleManager}
                </p>
              </div>
            </div>

            <div className={`mt-4 rounded-lg border p-3 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-medium ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{t.theme}</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    theme === "light"
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {theme === "dark" ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
                    {theme === "dark" ? t.light : t.dark}
                  </span>
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className={`text-xs font-medium ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{t.language}</span>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    theme === "light"
                      ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <LanguageIcon className="h-3.5 w-3.5" />
                    {lang === "fr" ? t.english : t.french}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                theme === "light"
                  ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <LogoutIcon className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 13.5V20h6v-6.5H4Zm10 0V20h6v-6.5h-6ZM4 4v6.5h6V4H4Zm10 0v6.5h6V4h-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function OrdersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClientsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 19c0-1.7-1.1-3.1-2.7-3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DeliveriesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 7h11v10H3V7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 10h4l3 3v4h-7v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function VehiclesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 13h18l-2-5H5l-2 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 13v4h12v-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7.5 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
    </svg>
  );
}

function InvoicesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 11h5M9.5 14h5M9.5 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 13.5a7.8 7.8 0 0 0 .1-1.5 7.8 7.8 0 0 0-.1-1.5l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 2.6a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5A7.8 7.8 0 0 0 4.6 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5L10 22h4l.4-2.6a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 12H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 14.2a8 8 0 1 1-10.2-10A7 7 0 0 0 20 14.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function LanguageIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 6h10M9 4v2m-5 14h10M9 20v-2M6 12h6M12 8l-2.2 8M16 6h4m-2 0v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default Sidebar;