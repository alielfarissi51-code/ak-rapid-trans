
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Commandes from "./pages/Commandes";
import UsersManagement from "./pages/UsersManagement";
import CamionsManagement from "./pages/CamionsManagement";
import CommandesManagement from "./pages/CommandesManagement";
import Settings from "./pages/Settings";
function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;