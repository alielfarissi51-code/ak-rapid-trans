import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import OrderClientInfo from "../components/OrderClientInfo";
import { useToast } from "../components/ToastProvider";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";
import {
  clearToken,
  downloadCommandeFacture,
  getClientCommandeById,
  getClientCommandes,
  getClientNotifications,
  getMe,
  logout as apiLogout,
} from "../services/api";

export default function ClientOrders() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [factureLoadingId, setFactureLoadingId] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [preferences, setPreferences] = useState(() => getStoredPreferences());
  const theme = preferences.theme === "light" ? "light" : "dark";

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handlePreferencesChanged = (event) => {
      if (event?.detail) {
        setPreferences(event.detail);
        return;
      }

      setPreferences(getStoredPreferences());
    };

    window.addEventListener(PREFERENCES_EVENT, handlePreferencesChanged);

    return () => {
      window.removeEventListener(PREFERENCES_EVENT, handlePreferencesChanged);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const profile = await getMe();

        if (!active) {
          return;
        }

        const role = (profile.role_name || profile.role || "").toLowerCase();

        if (role !== "client") {
          navigate("/dashboard-admin", { replace: true });
          return;
        }

        setUser(profile);
      } catch {
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

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await getClientCommandes();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setOrders([]);
      addToast({
        type: "error",
        title: "Unable to load your orders",
        description: error.message || "Please try again shortly.",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const payload = await getClientNotifications();
      setUnreadNotifications(Number(payload?.unread_count || 0));
    } catch {
      setUnreadNotifications(0);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadOrders();
    loadNotificationCount();
  }, [user]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeOrderStatus(order.statut);
      const route = `${order.lieu_depart || ""} ${order.lieu_arrivee || ""}`.toLowerCase();
      const clientText = `${order.client?.nom || ""} ${order.client?.email || ""} ${order.client?.telephone || ""}`.toLowerCase();
      const idText = String(order.id || "");
      const matchesSearch = !term || route.includes(term) || clientText.includes(term) || idText.includes(term);
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Always clear local auth state.
    } finally {
      clearToken();
      navigate("/", { replace: true });
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const payload = await getClientCommandeById(id);
      setSelectedOrder(payload);
    } catch (error) {
      addToast({
        type: "error",
        title: "Unable to open order",
        description: error.message || "Please try again.",
      });
    }
  };

  const handleDownloadFacture = async (order) => {
    const factureExists = order?.facture_exists ?? Boolean(order?.facture_path);
    const factureOutdated = order?.facture_outdated ?? false;

    if (!factureExists || factureOutdated) {
      return;
    }

    try {
      setFactureLoadingId(order.id);
      await downloadCommandeFacture(order.id, `${order.facture_number || `facture-commande-${order.id}`}.pdf`);
      addToast({
        type: "success",
        title: "Facture download started",
        description: "The facture PDF is downloading.",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Facture unavailable",
        description: error.message || "Unable to download facture.",
      });
    } finally {
      setFactureLoadingId(null);
    }
  };

  return (
    <div className={`h-screen overflow-x-hidden overflow-y-hidden ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#050814] text-slate-100"}`}>
      <div className="flex h-full">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          user={user}
          isAdmin={false}
          onLogout={handleLogout}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          clientUnreadCount={unreadNotifications}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
          <header className={`border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 ${theme === "light" ? "border-slate-200 bg-white/90" : "border-white/5 bg-[#050814]/80"}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Client Space</p>
                <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>Orders</h1>
              </div>
              <button
                type="button"
                onClick={() => navigate("/client/notifications")}
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl border transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"}`}
                aria-label="Open notifications"
                title="Notifications"
              >
                <BellIcon className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
              {loadingUser && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-slate-300"}`}>
                  Loading account...
                </div>
              )}

              <section className={`rounded-[28px] border p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                <div className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between ${theme === "light" ? "border-slate-200" : "border-white/8"}`}>
                  <div>
                    <h2 className={`text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>My Orders</h2>
                    <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>Review your route, status, and client data for each order.</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadOrders}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                  >
                    Refresh
                  </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
                  <input
                    className={`h-11 w-full rounded-xl border px-3 text-sm outline-none placeholder:text-slate-500 focus:border-sky-400/40 ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by ID, route, or client"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className={`h-11 rounded-xl border px-3 text-sm outline-none focus:border-sky-400/40 ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-[#0b1324] text-slate-100"}`}
                    style={{ colorScheme: theme }}
                  >
                    <option value="all" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>All statuses</option>
                    <option value="en_attente" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>Pending</option>
                    <option value="en_cours" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>In progress</option>
                    <option value="livree" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>Delivered</option>
                    <option value="annulee" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>Cancelled</option>
                    <option value="validee" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>Validated</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className={`h-11 rounded-xl border px-4 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                  >
                    Reset
                  </button>
                </div>

                {loadingOrders ? (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>No orders found.</div>
                ) : (
                  <>
                    <div className={`mt-5 hidden overflow-x-auto rounded-2xl border lg:block ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-[#0b1324]"}`}>
                      <table className="min-w-[980px] w-full text-left text-sm">
                        <thead className={`border-b ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/8 bg-white/[0.02] text-slate-400"}`}>
                          <tr>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Order</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Route</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Client</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Date</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Status</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order, index) => (
                            <tr
                              key={order.id}
                              className={`border-t transition ${
                                theme === "light"
                                  ? `${index % 2 === 0 ? "bg-slate-50" : "bg-white"} border-slate-200 text-slate-700 hover:bg-slate-100`
                                  : `${index % 2 === 0 ? "bg-[#1b283f]/55" : "bg-[#0b1324]"} border-white/8 text-slate-200 hover:bg-[#22314a]/70`
                              }`}
                            >
                              <td className={`whitespace-nowrap px-4 py-4 font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>#{order.id}</td>
                              <td className="px-4 py-4">{formatRoute(order)}</td>
                              <td className="px-4 py-4">
                                <OrderClientInfo
                                  order={order}
                                  fallbackUser={user}
                                  theme={theme}
                                  compact
                                  labels={{
                                    clientName: "Name",
                                    clientEmail: "Email",
                                    clientPhone: "Phone",
                                    noData: "No data",
                                    unknown: "Your account",
                                  }}
                                />
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">{formatDate(order.date_transport)}</td>
                              <td className="whitespace-nowrap px-4 py-4">
                                <StatusBadge status={order.statut} />
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(order.id)}
                                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${theme === "light" ? "border-sky-300/50 bg-sky-100 text-sky-700 hover:bg-sky-200" : "border-sky-400/20 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20"}`}
                                >
                                  Details
                                </button>
                                {(order.facture_exists ?? Boolean(order.facture_path)) && !(order.facture_outdated ?? false) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFacture(order)}
                                    disabled={factureLoadingId === order.id}
                                    className={`ml-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${theme === "light" ? "border-emerald-300/50 bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"} disabled:cursor-not-allowed disabled:opacity-60`}
                                  >
                                    {factureLoadingId === order.id ? "Downloading..." : "Download invoice"}
                                  </button>
                                )}
                                {(order.facture_exists ?? Boolean(order.facture_path)) && (order.facture_outdated ?? false) && (
                                  <span className={`ml-2 inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-amber-300/60 bg-amber-100 text-amber-700" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}`}>
                                    Invoice updating
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 grid gap-4 lg:hidden">
                      {filteredOrders.map((order) => (
                        <article key={order.id} className={`rounded-2xl border p-4 ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Order #{order.id}</p>
                          <h3 className={`mt-2 text-base font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{formatRoute(order)}</h3>
                          <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{formatDate(order.date_transport)}</p>
                          <div className="mt-3"><StatusBadge status={order.statut} /></div>
                          <div className={`mt-3 rounded-xl border px-3 py-3 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/8 bg-white/[0.02]"}`}>
                            <OrderClientInfo
                              order={order}
                              fallbackUser={user}
                              theme={theme}
                              labels={{
                                clientName: "Name",
                                clientEmail: "Email",
                                clientPhone: "Phone",
                                noData: "No data",
                                unknown: "Your account",
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(order.id)}
                            className={`mt-3 rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-sky-300/40 bg-sky-100 text-sky-700" : "border-sky-400/20 bg-sky-500/10 text-sky-100"}`}
                          >
                            Details
                          </button>
                          {(order.facture_exists ?? Boolean(order.facture_path)) && !(order.facture_outdated ?? false) && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFacture(order)}
                              disabled={factureLoadingId === order.id}
                              className={`ml-2 mt-3 rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-emerald-300/40 bg-emerald-100 text-emerald-700" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {factureLoadingId === order.id ? "Downloading..." : "Download invoice"}
                            </button>
                          )}
                          {(order.facture_exists ?? Boolean(order.facture_path)) && (order.facture_outdated ?? false) && (
                            <span className={`ml-2 mt-3 inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-amber-300/60 bg-amber-100 text-amber-700" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}`}>
                              Invoice updating
                            </span>
                          )}
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} />
      )}
    </div>
  );
}

function normalizeOrderStatus(status) {
  const value = String(status || "").toLowerCase();

  if (["en_attente", "en_cours", "livree", "annulee", "validee"].includes(value)) {
    return value;
  }

  if (value === "verified") {
    return "validee";
  }

  return "en_attente";
}

function StatusBadge({ status }) {
  const theme = getThemeMode();
  const resolved = normalizeOrderStatus(status);
  const darkStyles = {
    en_attente: "border-amber-400/20 bg-amber-500/10 text-amber-200",
    en_cours: "border-sky-400/20 bg-sky-500/10 text-sky-200",
    livree: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    annulee: "border-rose-400/20 bg-rose-500/10 text-rose-200",
    validee: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
  };
  const lightStyles = {
    en_attente: "border-amber-300 bg-amber-100 text-amber-800",
    en_cours: "border-sky-300 bg-sky-100 text-sky-800",
    livree: "border-emerald-300 bg-emerald-100 text-emerald-800",
    annulee: "border-rose-300 bg-rose-100 text-rose-800",
    validee: "border-cyan-300 bg-cyan-100 text-cyan-800",
  };
  const styles = theme === "light" ? lightStyles : darkStyles;

  const labels = {
    en_attente: "Pending",
    en_cours: "In progress",
    livree: "Delivered",
    annulee: "Cancelled",
    validee: "Validated",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[resolved]}`}>{labels[resolved]}</span>;
}

function getThemeMode() {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function formatRoute(order) {
  return `${order?.lieu_depart || "Departure"} -> ${order?.lieu_arrivee || "Arrival"}`;
}

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function OrderModal({ order, onClose, theme = "dark" }) {
  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className={`absolute inset-0 backdrop-blur-md ${theme === "light" ? "bg-slate-900/45" : "bg-slate-950/90"}`}
        onClick={onClose}
        aria-label="Close dialog overlay"
      />
      <div className={`relative z-10 w-full max-w-3xl rounded-[28px] border p-6 shadow-[0_30px_120px_rgba(0,0,0,0.75)] ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-[#050814]"}`}>
        <div className={`mb-5 flex items-center justify-between border-b pb-4 ${theme === "light" ? "border-slate-200" : "border-white/8"}`}>
          <h2 className={`text-2xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>Order #{order.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-3 py-1.5 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-white/[0.03] text-slate-200"}`}
          >
            Close
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label="Route" value={formatRoute(order)} theme={theme} />
          <Detail label="Date" value={formatDate(order.date_transport)} theme={theme} />
          <Detail label="Status" value={normalizeOrderStatus(order.statut)} theme={theme} />
          <Detail label="Verification" value={order.verified ? "Verified" : "Non verified"} theme={theme} />
          <Detail label="Client" value={order.client?.nom || "N/A"} theme={theme} />
          <Detail label="Client Email" value={order.client?.email || "N/A"} theme={theme} />
          <Detail label="Client Phone" value={order.client?.telephone || "N/A"} theme={theme} />
          <Detail label="Truck" value={order.camion?.matricule || "Not assigned"} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, theme = "dark" }) {
  return (
    <div className={`rounded-xl border p-3 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"}`}>
      <p className={`text-xs uppercase tracking-[0.12em] ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-2 text-sm font-medium ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{value || "N/A"}</p>
    </div>
  );
}

function BellIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 10a5 5 0 0 1 10 0v4.3l1.3 2.2a1 1 0 0 1-.9 1.5H6.6a1 1 0 0 1-.9-1.5L7 14.3V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
