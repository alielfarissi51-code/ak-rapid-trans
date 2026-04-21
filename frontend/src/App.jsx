
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const Commandes = lazy(() => import("./pages/Commandes"));
const UsersManagement = lazy(() => import("./pages/UsersManagement"));
const CamionsManagement = lazy(() => import("./pages/CamionsManagement"));
const CommandesManagement = lazy(() => import("./pages/CommandesManagement"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-[#050814] text-slate-100 flex items-center justify-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-admin" element={<Dashboard />} />
            <Route path="/dashboard-client" element={<ClientDashboard />} />
            <Route path="/commandes" element={<Commandes />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/camions" element={<CamionsManagement />} />
            <Route path="/admin/commandes" element={<CommandesManagement />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;