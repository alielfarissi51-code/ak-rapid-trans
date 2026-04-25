import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearToken, getMe, getToken } from "../services/api";

export default function RequireRole({ allow, children }) {
  const location = useLocation();
  const [status, setStatus] = useState({ loading: true, allowed: false, redirectTo: "/" });

  useEffect(() => {
    let active = true;

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
            redirectTo: role === "admin" ? "/dashboard-admin" : "/dashboard-client",
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
    return <div className="min-h-screen bg-[#050814] text-slate-100 flex items-center justify-center">Checking access...</div>;
  }

  if (!status.allowed) {
    return <Navigate to={status.redirectTo} replace state={{ from: location.pathname }} />;
  }

  return children;
}
