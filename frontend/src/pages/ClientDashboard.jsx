import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";
import {
  clearToken,
  createClientCommande,
  getClientCommandeById,
  getClientCommandes,
  getMe,
  logout as apiLogout,
} from "../services/api";

function ClientDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [requestForm, setRequestForm] = useState({
    lieu_depart: "",
    lieu_arrivee: "",
    date_transport: "",
    prix: "",
  });

  const roleName = (user?.role_name || user?.role || "").toLowerCase();

  const metrics = useMemo(() => {
    const pending = orders.filter((item) => item.statut === "en_attente").length;
    const verified = orders.filter((item) => item.verified).length;

    return {
      total: orders.length,
      pending,
      verified,
    };
  }, [orders]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const profile = await getMe();

        if (!active) {
          return;
        }

        const profileRole = (profile.role_name || profile.role || "").toLowerCase();

        if (profileRole === "admin") {
          navigate("/dashboard-admin", { replace: true });
          return;
        }

        setUser(profile);
      } catch (error) {
        if (active) {
          clearToken();
          navigate("/", { replace: true, state: { errorMessage: "Session expired. Please log in again." } });
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (roleName !== "client") {
      return;
    }

    loadOrders();
  }, [roleName]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getClientCommandes();
      setOrders(data);
    } catch (error) {
      addToast({
        type: "error",
        title: "Unable to load your orders",
        description: error.message || "Please try again shortly.",
      });
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Logout must always clear local auth state.
    } finally {
      clearToken();
      navigate("/", { replace: true });
    }
  };

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateRequest = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await createClientCommande({
        lieu_depart: requestForm.lieu_depart,
        lieu_arrivee: requestForm.lieu_arrivee,
        date_transport: requestForm.date_transport,
        prix: requestForm.prix === "" ? null : Number(requestForm.prix),
      });

      addToast({
        type: "success",
        title: "Order request submitted",
        description: "Your request is now pending and non-verified.",
      });

      setRequestForm({
        lieu_depart: "",
        lieu_arrivee: "",
        date_transport: "",
        prix: "",
      });
      setShowRequestForm(false);
      await loadOrders();
    } catch (error) {
      addToast({
        type: "error",
        title: "Request failed",
        description: error.message || "Unable to create your order request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const data = await getClientCommandeById(id);
      setSelectedOrder(data);
    } catch (error) {
      addToast({
        type: "error",
        title: "Unable to open order",
        description: error.message || "Please try again.",
      });
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#050814] text-slate-100">
      <div className="flex h-full">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          user={user}
          isAdmin={false}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
          <header className="border-b border-white/5 bg-[#050814]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-400">Client Portal</p>
                <h1 className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Client Dashboard
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setShowRequestForm((prev) => !prev)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/15 px-4 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
              >
                Request new order
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              {loadingUser && (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  Loading your account...
                </div>
              )}

              <section className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="My orders" value={metrics.total} />
                <MetricCard label="Pending" value={metrics.pending} />
                <MetricCard label="Verified" value={metrics.verified} />
              </section>

              {showRequestForm && (
                <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
                  <h2 className="text-lg font-semibold text-white">Create order request</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    New requests are always submitted as pending and non-verified.
                  </p>

                  <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateRequest}>
                    <InputField
                      label="Departure"
                      name="lieu_depart"
                      value={requestForm.lieu_depart}
                      onChange={handleRequestChange}
                      placeholder="City or address"
                    />
                    <InputField
                      label="Arrival"
                      name="lieu_arrivee"
                      value={requestForm.lieu_arrivee}
                      onChange={handleRequestChange}
                      placeholder="City or address"
                    />
                    <InputField
                      label="Transport date"
                      name="date_transport"
                      value={requestForm.date_transport}
                      onChange={handleRequestChange}
                      type="date"
                    />
                    <InputField
                      label="Estimated price (DHS, optional)"
                      name="prix"
                      value={requestForm.prix}
                      onChange={handleRequestChange}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />

                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex h-11 items-center rounded-xl border border-sky-400/20 bg-sky-500/15 px-4 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? "Submitting..." : "Submit request"}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
                <h2 className="text-lg font-semibold text-white">My orders</h2>
                <p className="mt-1 text-sm text-slate-400">You can only view orders that belong to your account.</p>

                {loadingOrders ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-300">
                    Loading orders...
                  </div>
                ) : (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/8 bg-[#0b1324]/70">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-white/8 text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">ID</th>
                          <th className="px-4 py-3 font-medium">Route</th>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Verification</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                              No orders yet.
                            </td>
                          </tr>
                        )}
                        {orders.map((order) => (
                          <tr key={order.id} className="border-t border-white/8 text-slate-200">
                            <td className="px-4 py-3 font-semibold">#{order.id}</td>
                            <td className="px-4 py-3">{order.lieu_depart} → {order.lieu_arrivee}</td>
                            <td className="px-4 py-3">{new Date(order.date_transport).toLocaleDateString()}</td>
                            <td className="px-4 py-3"><StatusBadge status={order.statut} /></td>
                            <td className="px-4 py-3"><VerificationBadge verified={Boolean(order.verified)} /></td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleViewDetails(order.id)}
                                className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:border-sky-300/40 hover:bg-sky-500/20"
                              >
                                View details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {selectedOrder && (
                <section className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">Order #{selectedOrder.id}</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <p><span className="text-slate-400">Client:</span> {selectedOrder.client?.nom || "N/A"}</p>
                    <p><span className="text-slate-400">Truck:</span> {selectedOrder.camion?.matricule || "Not assigned"}</p>
                    <p><span className="text-slate-400">Route:</span> {selectedOrder.lieu_depart} → {selectedOrder.lieu_arrivee}</p>
                    <p><span className="text-slate-400">Price:</span> {selectedOrder.prix ? `DHS ${Number(selectedOrder.prix).toLocaleString()}` : "N/A"}</p>
                    <p><span className="text-slate-400">Status:</span> {selectedOrder.statut}</p>
                    <p><span className="text-slate-400">Verification:</span> {selectedOrder.verified ? "verified" : "non_verified"}</p>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.26)]">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function InputField({ label, name, value, onChange, type = "text", ...rest }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none"
        required={type !== "number"}
        {...rest}
      />
    </label>
  );
}

function StatusBadge({ status }) {
  const styles = {
    en_attente: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    validee: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    en_cours: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    livree: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    annulee: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  };

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] || styles.en_attente}`}>{status}</span>;
}

function VerificationBadge({ verified }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        verified
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-slate-500/40 bg-slate-500/15 text-slate-300"
      }`}
    >
      {verified ? "verified" : "non_verified"}
    </span>
  );
}

export default ClientDashboard;
