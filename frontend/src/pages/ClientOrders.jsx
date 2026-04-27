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

const ordersTranslations = {
  en: {
    clientSpace: "Client Space",
    orders: "Orders",
    loadingAccount: "Loading account...",
    myOrders: "My Orders",
    reviewOrders: "Review your route, status, and client data for each order.",
    refresh: "Refresh",
    searchPlaceholder: "Search by ID, route, or client",
    allStatuses: "All statuses",
    pending: "Pending",
    inProgress: "In progress",
    delivered: "Delivered",
    cancelled: "Cancelled",
    validated: "Validated",
    reset: "Reset",
    loadingOrders: "Loading orders...",
    noOrdersFound: "No orders found.",
    order: "Order",
    route: "Route",
    client: "Client",
    date: "Date",
    status: "Status",
    action: "Action",
    name: "Name",
    email: "Email",
    phone: "Phone",
    noData: "No data",
    yourAccount: "Your account",
    details: "Details",
    downloading: "Downloading...",
    downloadInvoice: "Download invoice",
    invoiceUpdating: "Invoice updating",
    orderPrefix: "Order",
    close: "Close",
    verification: "Verification",
    verified: "Verified",
    nonVerified: "Non verified",
    clientEmail: "Client Email",
    clientPhone: "Client Phone",
    truck: "Truck",
    notAssigned: "Not assigned",
    departure: "Departure",
    arrival: "Arrival",
    notAvailable: "N/A",
    openNotifications: "Open notifications",
    factureDownloadStartedTitle: "Facture download started",
    factureDownloadStartedDesc: "The facture PDF is downloading.",
    factureUnavailableTitle: "Facture unavailable",
    factureUnavailableDesc: "Unable to download facture.",
    unableOpenOrderTitle: "Unable to open order",
    unableOpenOrderDesc: "Please try again.",
    unableLoadOrdersTitle: "Unable to load your orders",
    unableLoadOrdersDesc: "Please try again shortly.",
  },
  fr: {
    clientSpace: "Espace client",
    orders: "Commandes",
    loadingAccount: "Chargement du compte...",
    myOrders: "Mes commandes",
    reviewOrders: "Consultez le trajet, le statut et les informations client pour chaque commande.",
    refresh: "Actualiser",
    searchPlaceholder: "Rechercher par ID, trajet ou client",
    allStatuses: "Tous les statuts",
    pending: "En attente",
    inProgress: "En cours",
    delivered: "Livree",
    cancelled: "Annulee",
    validated: "Validee",
    reset: "Reinitialiser",
    loadingOrders: "Chargement des commandes...",
    noOrdersFound: "Aucune commande trouvee.",
    order: "Commande",
    route: "Trajet",
    client: "Client",
    date: "Date",
    status: "Statut",
    action: "Action",
    name: "Nom",
    email: "Email",
    phone: "Telephone",
    noData: "Aucune donnee",
    yourAccount: "Votre compte",
    details: "Details",
    downloading: "Telechargement...",
    downloadInvoice: "Telecharger la facture",
    invoiceUpdating: "Facture en cours de mise a jour",
    orderPrefix: "Commande",
    close: "Fermer",
    verification: "Verification",
    verified: "Verifiee",
    nonVerified: "Non verifiee",
    clientEmail: "Email client",
    clientPhone: "Telephone client",
    truck: "Camion",
    notAssigned: "Non affecte",
    departure: "Depart",
    arrival: "Arrivee",
    notAvailable: "N/A",
    openNotifications: "Ouvrir les notifications",
    factureDownloadStartedTitle: "Telechargement de la facture lance",
    factureDownloadStartedDesc: "Le PDF de la facture est en cours de telechargement.",
    factureUnavailableTitle: "Facture indisponible",
    factureUnavailableDesc: "Impossible de telecharger la facture.",
    unableOpenOrderTitle: "Impossible d'ouvrir la commande",
    unableOpenOrderDesc: "Veuillez reessayer.",
    unableLoadOrdersTitle: "Impossible de charger vos commandes",
    unableLoadOrdersDesc: "Veuillez reessayer dans un instant.",
  },
};

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
  const lang = preferences.lang === "fr" ? "fr" : "en";
  const t = ordersTranslations[lang];

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
        title: t.unableLoadOrdersTitle,
        description: error.message || t.unableLoadOrdersDesc,
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
        title: t.unableOpenOrderTitle,
        description: error.message || t.unableOpenOrderDesc,
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
        title: t.factureDownloadStartedTitle,
        description: t.factureDownloadStartedDesc,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: t.factureUnavailableTitle,
        description: error.message || t.factureUnavailableDesc,
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
                <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{t.clientSpace}</p>
                <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.orders}</h1>
              </div>
              <button
                type="button"
                onClick={() => navigate("/client/notifications")}
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl border transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"}`}
                aria-label={t.openNotifications}
                title={t.openNotifications}
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
                  {t.loadingAccount}
                </div>
              )}

              <section className={`rounded-[28px] border p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                <div className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between ${theme === "light" ? "border-slate-200" : "border-white/8"}`}>
                  <div>
                    <h2 className={`text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.myOrders}</h2>
                    <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>{t.reviewOrders}</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadOrders}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                  >
                    {t.refresh}
                  </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
                  <input
                    className={`h-11 w-full rounded-xl border px-3 text-sm outline-none placeholder:text-slate-500 focus:border-sky-400/40 ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t.searchPlaceholder}
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className={`h-11 rounded-xl border px-3 text-sm outline-none focus:border-sky-400/40 ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-[#0b1324] text-slate-100"}`}
                    style={{ colorScheme: theme }}
                  >
                    <option value="all" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>{t.allStatuses}</option>
                    <option value="en_attente" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>{t.pending}</option>
                    <option value="en_cours" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>{t.inProgress}</option>
                    <option value="livree" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>{t.delivered}</option>
                    <option value="annulee" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>{t.cancelled}</option>
                    <option value="validee" className={theme === "light" ? "bg-white text-slate-900" : "bg-[#0b1324] text-slate-100"}>{t.validated}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className={`h-11 rounded-xl border px-4 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                  >
                    {t.reset}
                  </button>
                </div>

                {loadingOrders ? (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{t.loadingOrders}</div>
                ) : filteredOrders.length === 0 ? (
                  <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>{t.noOrdersFound}</div>
                ) : (
                  <>
                    <div className={`mt-5 hidden overflow-x-auto rounded-2xl border lg:block ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-[#0b1324]"}`}>
                      <table className="min-w-[980px] w-full text-left text-sm">
                        <thead className={`border-b ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/8 bg-white/[0.02] text-slate-400"}`}>
                          <tr>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">{t.order}</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">{t.route}</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">{t.client}</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">{t.date}</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">{t.status}</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]">{t.action}</th>
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
                              <td className="px-4 py-4">{formatRoute(order, lang)}</td>
                              <td className="px-4 py-4">
                                <OrderClientInfo
                                  order={order}
                                  fallbackUser={user}
                                  theme={theme}
                                  compact
                                  labels={{
                                    clientName: t.name,
                                    clientEmail: t.email,
                                    clientPhone: t.phone,
                                    noData: t.noData,
                                    unknown: t.yourAccount,
                                  }}
                                />
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">{formatDate(order.date_transport, lang)}</td>
                              <td className="whitespace-nowrap px-4 py-4">
                                <StatusBadge status={order.statut} lang={lang} />
                              </td>
                              <td className="whitespace-nowrap px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(order.id)}
                                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${theme === "light" ? "border-sky-300/50 bg-sky-100 text-sky-700 hover:bg-sky-200" : "border-sky-400/20 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20"}`}
                                >
                                  {t.details}
                                </button>
                                {(order.facture_exists ?? Boolean(order.facture_path)) && !(order.facture_outdated ?? false) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFacture(order)}
                                    disabled={factureLoadingId === order.id}
                                    className={`ml-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${theme === "light" ? "border-emerald-300/50 bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"} disabled:cursor-not-allowed disabled:opacity-60`}
                                  >
                                    {factureLoadingId === order.id ? t.downloading : t.downloadInvoice}
                                  </button>
                                )}
                                {(order.facture_exists ?? Boolean(order.facture_path)) && (order.facture_outdated ?? false) && (
                                  <span className={`ml-2 inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-amber-300/60 bg-amber-100 text-amber-700" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}`}>
                                    {t.invoiceUpdating}
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
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t.orderPrefix} #{order.id}</p>
                          <h3 className={`mt-2 text-base font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{formatRoute(order, lang)}</h3>
                          <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{formatDate(order.date_transport, lang)}</p>
                          <div className="mt-3"><StatusBadge status={order.statut} lang={lang} /></div>
                          <div className={`mt-3 rounded-xl border px-3 py-3 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/8 bg-white/[0.02]"}`}>
                            <OrderClientInfo
                              order={order}
                              fallbackUser={user}
                              theme={theme}
                              labels={{
                                clientName: t.name,
                                clientEmail: t.email,
                                clientPhone: t.phone,
                                noData: t.noData,
                                unknown: t.yourAccount,
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(order.id)}
                            className={`mt-3 rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-sky-300/40 bg-sky-100 text-sky-700" : "border-sky-400/20 bg-sky-500/10 text-sky-100"}`}
                          >
                            {t.details}
                          </button>
                          {(order.facture_exists ?? Boolean(order.facture_path)) && !(order.facture_outdated ?? false) && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFacture(order)}
                              disabled={factureLoadingId === order.id}
                              className={`ml-2 mt-3 rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-emerald-300/40 bg-emerald-100 text-emerald-700" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {factureLoadingId === order.id ? t.downloading : t.downloadInvoice}
                            </button>
                          )}
                          {(order.facture_exists ?? Boolean(order.facture_path)) && (order.facture_outdated ?? false) && (
                            <span className={`ml-2 mt-3 inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold ${theme === "light" ? "border-amber-300/60 bg-amber-100 text-amber-700" : "border-amber-400/30 bg-amber-500/10 text-amber-200"}`}>
                              {t.invoiceUpdating}
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
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={theme} lang={lang} />
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

function StatusBadge({ status, lang = "en" }) {
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

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[resolved]}`}>{getOrderStatusLabel(resolved, lang)}</span>;
}

function getOrderStatusLabel(status, lang = "en") {
  const labels = lang === "fr"
    ? {
        en_attente: "En attente",
        en_cours: "En cours",
        livree: "Livree",
        annulee: "Annulee",
        validee: "Validee",
      }
    : {
        en_attente: "Pending",
        en_cours: "In progress",
        livree: "Delivered",
        annulee: "Cancelled",
        validee: "Validated",
      };

  return labels[normalizeOrderStatus(status)] || labels.en_attente;
}

function getThemeMode() {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function formatRoute(order, lang = "en") {
  const departure = lang === "fr" ? "Depart" : "Departure";
  const arrival = lang === "fr" ? "Arrivee" : "Arrival";
  return `${order?.lieu_depart || departure} -> ${order?.lieu_arrivee || arrival}`;
}

function formatDate(value, lang = "en") {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function OrderModal({ order, onClose, theme = "dark", lang = "en" }) {
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
          <h2 className={`text-2xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{lang === "fr" ? "Commande" : "Order"} #{order.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-3 py-1.5 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/10 bg-white/[0.03] text-slate-200"}`}
          >
            {lang === "fr" ? "Fermer" : "Close"}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Detail label={lang === "fr" ? "Trajet" : "Route"} value={formatRoute(order, lang)} theme={theme} />
          <Detail label={lang === "fr" ? "Date" : "Date"} value={formatDate(order.date_transport, lang)} theme={theme} />
          <Detail label={lang === "fr" ? "Statut" : "Status"} value={getOrderStatusLabel(order.statut, lang)} theme={theme} />
          <Detail label={lang === "fr" ? "Verification" : "Verification"} value={order.verified ? (lang === "fr" ? "Verifiee" : "Verified") : (lang === "fr" ? "Non verifiee" : "Non verified")} theme={theme} />
          <Detail label={lang === "fr" ? "Client" : "Client"} value={order.client?.nom || "N/A"} theme={theme} />
          <Detail label={lang === "fr" ? "Email client" : "Client Email"} value={order.client?.email || "N/A"} theme={theme} />
          <Detail label={lang === "fr" ? "Telephone client" : "Client Phone"} value={order.client?.telephone || "N/A"} theme={theme} />
          <Detail label={lang === "fr" ? "Camion" : "Truck"} value={order.camion?.matricule || (lang === "fr" ? "Non affecte" : "Not assigned")} theme={theme} />
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
