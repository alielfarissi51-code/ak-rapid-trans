import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Commandes from "./pages/Commandes";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;