
import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider";
import RequireRole from "./components/RequireRole";
import { getStoredPreferences, PREFERENCES_EVENT } from "./utils/preferences";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ClientOrders = lazy(() => import("./pages/ClientOrders"));
const ClientNotifications = lazy(() => import("./pages/ClientNotifications"));
const UsersManagement = lazy(() => import("./pages/UsersManagement"));
const ClientsManagement = lazy(() => import("./pages/ClientsManagement"));
const CamionsManagement = lazy(() => import("./pages/CamionsManagement"));
const CommandesManagement = lazy(() => import("./pages/CommandesManagement"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  const [theme, setTheme] = useState(() => getStoredPreferences().theme === "light" ? "light" : "dark");

  useEffect(() => {
    const handler = (event) => {
      const nextTheme = event?.detail?.theme || getStoredPreferences().theme;
      setTheme(nextTheme === "light" ? "light" : "dark");
    };

    window.addEventListener(PREFERENCES_EVENT, handler);
    return () => window.removeEventListener(PREFERENCES_EVENT, handler);
  }, []);

  const loadingClassName = theme === "light"
    ? "min-h-screen bg-slate-50 text-slate-700 flex items-center justify-center"
    : "min-h-screen bg-[#050814] text-slate-100 flex items-center justify-center";

  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className={loadingClassName}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<RequireRole allow={["admin"]}><Dashboard /></RequireRole>} />
            <Route path="/dashboard-admin" element={<RequireRole allow={["admin"]}><Dashboard /></RequireRole>} />
            <Route path="/client/dashboard" element={<RequireRole allow={["client"]}><ClientDashboard /></RequireRole>} />
            <Route path="/dashboard-client" element={<RequireRole allow={["client"]}><ClientDashboard /></RequireRole>} />
            <Route path="/client/orders" element={<RequireRole allow={["client"]}><ClientOrders /></RequireRole>} />
            <Route path="/client/notifications" element={<RequireRole allow={["client"]}><ClientNotifications /></RequireRole>} />
            <Route path="/commandes" element={<RequireRole allow={["admin"]}><CommandesManagement /></RequireRole>} />
            <Route path="/admin/users" element={<RequireRole allow={["admin"]}><UsersManagement /></RequireRole>} />
            <Route path="/admin/clients" element={<RequireRole allow={["admin"]}><ClientsManagement /></RequireRole>} />
            <Route path="/admin/camions" element={<RequireRole allow={["admin"]}><CamionsManagement /></RequireRole>} />
            <Route path="/admin/commandes" element={<RequireRole allow={["admin"]}><CommandesManagement /></RequireRole>} />
            <Route path="/settings" element={<RequireRole allow={["admin", "client"]}><Settings /></RequireRole>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;