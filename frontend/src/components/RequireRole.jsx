import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearToken, getMe, getToken } from "../services/api";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function RequireRole({ allow, children }) {
  const location = useLocation();
  const [status, setStatus] = useState({ loading: true, allowed: false, redirectTo: "/" });
  const [theme, setTheme] = useState(() => getStoredPreferences().theme === "light" ? "light" : "dark");

  useEffect(() => {
    const handler = (event) => {
      const nextTheme = event?.detail?.theme || getStoredPreferences().theme;
      setTheme(nextTheme === "light" ? "light" : "dark");
    };

    window.addEventListener(PREFERENCES_EVENT, handler);
    return () => window.removeEventListener(PREFERENCES_EVENT, handler);
  }, []);

  useEffect(() => {
    let active = true;

    setStatus((prev) => ({ ...prev, loading: true }));

    const verify = async () => {
      const token = getToken();

      if (!token) {
        if (active) {
          setStatus({ loading: false, allowed: false, redirectTo: "/" });
        }
        return;
      }

      try {
        const me = await getMe();
        const role = (me.role_name || me.role || "").toLowerCase();
        const allowedRoles = (allow || []).map((item) => String(item).toLowerCase());

        if (allowedRoles.includes(role)) {
          if (active) {
            setStatus({ loading: false, allowed: true, redirectTo: "/" });
          }
          return;
        }

        if (active) {
          setStatus({
            loading: false,
            allowed: false,
            redirectTo: role === "admin" ? "/dashboard" : "/client/dashboard",
          });
        }
      } catch {
        clearToken();
        if (active) {
          setStatus({ loading: false, allowed: false, redirectTo: "/" });
        }
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [allow]);

  if (status.loading) {
    return (
      <div className={theme === "light" ? "min-h-screen bg-slate-50 text-slate-700 flex items-center justify-center" : "min-h-screen bg-[#050814] text-slate-100 flex items-center justify-center"}>
        Checking access...
      </div>
    );
  }

  if (!status.allowed) {
    return <Navigate to={status.redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}
