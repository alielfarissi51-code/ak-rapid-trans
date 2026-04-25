import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import OrderClientInfo from "../components/OrderClientInfo";
import { useToast } from "../components/ToastProvider";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";
import {
  clearToken,
  createClientCommande,
  getClientCommandeById,
  getClientCommandes,
  getMe,
  logout as apiLogout,
  getClientCommandesSummary,
} from "../services/api";

const clientDashboardTranslations = {
  en: {
    portalTitle: "Client Portal",
    welcomeBack: "Welcome back",
    overviewDescription: "Track your transport requests, monitor each order state, and submit a new request in a few seconds.",
    privateAccess: "Private account access",
    requestNewOrder: "Request new order",
    loadingAccount: "Loading your account...",
    latestUpdate: "Latest update",
    noRequestsYet: "No transport requests yet",
    status: "Status",
    verification: "Verification",
    whatHappensNext: "What happens next",
    noData: "No data",
    requestTransport: "Request transport",
    newTransportRequest: "New transport request",
    requestDescription: "Fill in the route details below. The request will be created as pending and non-verified automatically.",
    close: "Close",
    autoStatus: "Auto status",
    autoVerification: "Auto verification",
    access: "Access",
    submitRequest: "Submit request",
    submitting: "Submitting...",
    cancel: "Cancel",
    requestRules: "Request rules",
    totalOrders: "Total orders",
    pendingRequests: "Pending requests",
    verifiedOrders: "Verified orders",
    deliveredOrders: "Delivered orders",
    myOrders: "My orders",
    transportRequests: "Client orders",
    reviewOrders: "Review the route, date, status, and verification state for each request.",
    visibleTotal: "visible",
    total: "total",
    refresh: "Refresh",
    searchPlaceholder: "Search by order ID, route, or truck",
    resetFilters: "Reset filters",
    noOrdersMatch: "No orders match your filters",
    noOrdersAvailable: "You do not have any transport requests yet",
    adjustFilters: "Try changing the search or status filter to find an order.",
    firstRequestHelp: "Start by submitting your first transport request. It will be created as pending and linked only to your account.",
    requestYourFirstOrder: "Request your first order",
    howItWorks: "How it works",
    sendRouteDetails: "Send the route details",
    operationsReviews: "Operations reviews it",
    trackTheProgress: "Track the progress",
    routeDetailsCopy: "Enter departure, arrival, transport date, and optional price estimate.",
    operationsReviewsCopy: "Your request starts as pending until the admin team validates it.",
    trackProgressCopy: "Use this portal to follow progress, verification, and delivery updates.",
    order: "Order",
    date: "Date",
    route: "Route",
    truck: "Truck",
    client: "Client",
    viewDetails: "View details",
    truckNotAssigned: "Truck not assigned yet",
    estimatedPrice: "Estimated price (DHS, optional)",
    departure: "Departure",
    arrival: "Arrival",
    transportDate: "Transport date",
    requestSummary: "Tracking summary",
    progressNotes: "Progress notes",
    clientInformation: "Client information",
    truckAssignment: "Truck assignment",
    transportRequest: "Transport request",
    orderCreated: "Created",
    lastUpdated: "Last updated",
    currentStage: "Current stage",
    brand: "Brand",
    model: "Model",
    truckStatus: "Truck status",
    onlyOwnOrders: "You can only view your own transport request in this portal.",
    progressUpdates: "Any progress updates will appear here once operations changes the status.",
    requestID: "Request ID",
    clientName: "Client name",
    clientEmail: "Client email",
    clientPhone: "Client phone",
    clientAddress: "Client address",
    assignedTruck: "Not assigned yet",
    noDataLabel: "No data",
    accountOnly: "Your own account only",
    pendingState: "Pending",
    nonVerified: "Non verified",
    verified: "Verified",
    unknownAccount: "Your account",
    orderTitlePrefix: "Order",
  },
  fr: {
    portalTitle: "Portail client",
    welcomeBack: "Bon retour",
    overviewDescription: "Suivez vos demandes de transport, controlez chaque statut et envoyez une nouvelle demande en quelques secondes.",
    privateAccess: "Acces prive au compte",
    dbSummary: "Resume base de donnees",
    dbSummaryCopy: "Cette section est calculee via une procedure stockee dans la base backend.",
    totalAmount: "Montant total",
    loadingSummary: "Chargement du resume...",
    requestNewOrder: "Nouvelle demande",
    loadingAccount: "Chargement de votre compte...",
    latestUpdate: "Derniere mise a jour",
    noRequestsYet: "Aucune demande de transport pour le moment",
    status: "Statut",
    verification: "Verification",
    whatHappensNext: "Et ensuite",
    noData: "Aucune donnee",
    requestTransport: "Demande de transport",
    newTransportRequest: "Nouvelle demande de transport",
    requestDescription: "Renseignez ci-dessous les details du trajet. La demande sera creee automatiquement en attente et non verifiee.",
    close: "Fermer",
    autoStatus: "Statut automatique",
    autoVerification: "Verification automatique",
    access: "Acces",
    submitRequest: "Envoyer la demande",
    submitting: "Envoi...",
    cancel: "Annuler",
    requestRules: "Regles de demande",
    totalOrders: "Total des commandes",
    pendingRequests: "Demandes en attente",
    verifiedOrders: "Commandes verifiees",
    deliveredOrders: "Commandes livrees",
    myOrders: "Mes commandes",
    transportRequests: "Commandes client",
    reviewOrders: "Consultez le trajet, la date, le statut et la verification pour chaque demande.",
    visibleTotal: "visibles",
    total: "total",
    refresh: "Actualiser",
    searchPlaceholder: "Rechercher par ID, trajet ou camion",
    resetFilters: "Reinitialiser les filtres",
    noOrdersMatch: "Aucune commande ne correspond aux filtres",
    noOrdersAvailable: "Vous n'avez encore aucune demande de transport",
    adjustFilters: "Essayez de modifier la recherche ou le filtre de statut pour trouver une commande.",
    firstRequestHelp: "Commencez par envoyer votre premiere demande de transport. Elle sera creee en attente et liee uniquement a votre compte.",
    requestYourFirstOrder: "Demander votre premiere commande",
    howItWorks: "Comment ca marche",
    sendRouteDetails: "Envoyer les details du trajet",
    operationsReviews: "Les operations l'examinent",
    trackTheProgress: "Suivre la progression",
    routeDetailsCopy: "Saisissez le depart, l'arrivee, la date de transport et une estimation du prix si besoin.",
    operationsReviewsCopy: "Votre demande commence en attente jusqu'a validation par l'equipe admin.",
    trackProgressCopy: "Utilisez ce portail pour suivre la progression, la verification et la livraison.",
    order: "Commande",
    date: "Date",
    route: "Trajet",
    truck: "Camion",
    client: "Client",
    viewDetails: "Voir le detail",
    truckNotAssigned: "Camion non affecte",
    estimatedPrice: "Prix estime (DHS, optionnel)",
    departure: "Depart",
    arrival: "Arrivee",
    transportDate: "Date de transport",
    requestSummary: "Resume du suivi",
    progressNotes: "Notes de progression",
    clientInformation: "Informations client",
    truckAssignment: "Affectation du camion",
    transportRequest: "Demande de transport",
    orderCreated: "Creee",
    lastUpdated: "Derniere mise a jour",
    currentStage: "Etape actuelle",
    brand: "Marque",
    model: "Modele",
    truckStatus: "Statut du camion",
    onlyOwnOrders: "Vous ne pouvez voir ici que votre propre demande de transport.",
    progressUpdates: "Les mises a jour apparaitront ici lorsque les operations changeront le statut.",
    requestID: "ID de demande",
    clientName: "Nom du client",
    clientEmail: "Email du client",
    clientPhone: "Telephone du client",
    clientAddress: "Adresse du client",
    assignedTruck: "Non affecte",
    noDataLabel: "Aucune donnee",
    accountOnly: "Votre propre compte uniquement",
    pendingState: "En attente",
    nonVerified: "Non verifiee",
    verified: "Verifiee",
    unknownAccount: "Votre compte",
    orderTitlePrefix: "Commande",
  },
};

function getThemeMode() {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function ClientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => getStoredPreferences());
  const requestSectionRef = useRef(null);
  const ordersSectionRef = useRef(null);
  const statusMenuRef = useRef(null);

  const roleName = (user?.role_name || user?.role || "").toLowerCase();
  const theme = preferences.theme === "light" ? "light" : "dark";
  const lang = preferences.lang === "fr" ? "fr" : "en";
  const t = useMemo(() => clientDashboardTranslations[lang] || clientDashboardTranslations.en, [lang]);

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

  const metrics = useMemo(() => {
    const normalizedOrders = orders.map((order) => ({
      ...order,
      normalizedStatus: normalizeOrderStatus(order.statut),
    }));

    return {
      total: normalizedOrders.length,
      pending: normalizedOrders.filter((order) => order.normalizedStatus === "en_attente").length,
      verified: normalizedOrders.filter((order) => Boolean(order.verified)).length,
      delivered: normalizedOrders.filter((order) => order.normalizedStatus === "livree").length,
      inProgress: normalizedOrders.filter((order) => order.normalizedStatus === "en_cours").length,
      cancelled: normalizedOrders.filter((order) => order.normalizedStatus === "annulee").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const normalizedStatus = normalizeOrderStatus(order.statut);
      const routeText = `${order.lieu_depart || ""} ${order.lieu_arrivee || ""}`.toLowerCase();
      const idText = String(order.id || "");
      const matchesSearch =
        !normalizedSearch ||
        routeText.includes(normalizedSearch) ||
        idText.includes(normalizedSearch) ||
        String(order.camion?.matricule || "").toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const latestOrder = orders[0] || null;
  const latestOrderRoute = latestOrder ? formatRoute(latestOrder, lang) : t.noRequestsYet;
  const latestOrderStep = latestOrder ? getProgressCopy(latestOrder, lang) : t.firstRequestHelp;

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

  useEffect(() => {
    if (roleName !== "client") {
      return;
    }

    loadOrders();
  }, [roleName]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setStatusMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setStatusMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (location.hash !== "#orders") {
      return;
    }

    window.requestAnimationFrame(() => {
      ordersSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const [data, summaryPayload] = await Promise.all([
        getClientCommandes(),
        getClientCommandesSummary().catch(() => ({ data: [] })),
      ]);
      setOrders(Array.isArray(data) ? data : []);
      setSummaryRows(Array.isArray(summaryPayload?.data) ? summaryPayload.data : []);
    } catch (error) {
      addToast({
        type: "error",
        title: "Unable to load your orders",
        description: error.message || "Please try again shortly.",
      });
      setOrders([]);
      setSummaryRows([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadSummaryOnly = async () => {
    try {
      setLoadingSummary(true);
      const summaryPayload = await getClientCommandesSummary();
      setSummaryRows(Array.isArray(summaryPayload?.data) ? summaryPayload.data : []);
    } catch (error) {
      setSummaryRows([]);
      addToast({
        type: "warning",
        title: lang === "fr" ? "Resume indisponible" : "Summary unavailable",
        description: error.message || (lang === "fr" ? "Impossible de charger le resume base de donnees." : "Unable to load database summary."),
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
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

  const openRequestForm = () => {
    setShowRequestForm(true);

    window.requestAnimationFrame(() => {
      requestSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const closeRequestForm = () => setShowRequestForm(false);

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
        title: lang === "fr" ? "Demande envoyee" : "Order request submitted",
        description: lang === "fr" ? "Votre demande est maintenant en attente et non verifiee." : "Your request is now pending and non-verified.",
      });

      setRequestForm({
        lieu_depart: "",
        lieu_arrivee: "",
        date_transport: "",
        prix: "",
      });
      closeRequestForm();
      await loadOrders();
    } catch (error) {
      addToast({
        type: "error",
        title: lang === "fr" ? "Echec de la demande" : "Request failed",
        description: error.message || (lang === "fr" ? "Impossible de creer votre demande de transport." : "Unable to create your order request."),
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
        title: lang === "fr" ? "Impossible d'ouvrir la commande" : "Unable to open order",
        description: error.message || (lang === "fr" ? "Veuillez reessayer." : "Please try again."),
      });
    }
  };

  const hasVisibleOrders = filteredOrders.length > 0;

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#050814] text-slate-100"}`}>
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          user={user}
          isAdmin={false}
          onLogout={handleLogout}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
          <header className={`sticky top-0 z-20 border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 ${theme === "light" ? "border-slate-200/80 bg-white/90" : "border-white/5 bg-[#050814]/85"}`}>
            <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/70">{t.portalTitle}</p>
                <h1 className={`mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                  {t.welcomeBack}, {user?.name || "client"}
                </h1>
                <p className={`mt-2 max-w-2xl text-sm leading-6 sm:text-base ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                  {t.overviewDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${theme === "light" ? "border-cyan-300/50 bg-cyan-100 text-cyan-700" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"}`}>
                  {t.privateAccess}
                </span>
                <button
                  type="button"
                  onClick={openRequestForm}
                  className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 ${theme === "light" ? "border-cyan-300/50 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 focus-visible:ring-cyan-300/50" : "border-cyan-400/25 bg-cyan-500/15 text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-500/25 hover:shadow-[0_12px_28px_rgba(34,211,238,0.18)] focus-visible:ring-cyan-300/40"}`}
                >
                  <PlusIcon className="h-4 w-4" />
                  {t.requestNewOrder}
                </button>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
              {loadingUser && !user && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-slate-300"}`}>
                  {t.loadingAccount}
                </div>
              )}

              {roleName === "client" && (
                <section className={`rounded-[28px] border p-6 backdrop-blur-2xl sm:p-8 ${theme === "light" ? "border-slate-200 bg-white shadow-[0_28px_100px_rgba(15,23,42,0.08)]" : "border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,15,28,0.96))] shadow-[0_28px_100px_rgba(0,0,0,0.38)]"}`}>
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)] lg:items-center">
                    <div>
                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/10 bg-white/5 text-slate-300"}`}>
                        {t.portalTitle}
                      </div>
                      <h2 className={`mt-4 text-3xl font-semibold tracking-tight sm:text-4xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                        {lang === "fr" ? "Gerez vos demandes de transport depuis un seul endroit." : "Manage your transport requests in one place."}
                      </h2>
                      <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                        {t.overviewDescription}
                      </p>
                      <div className={`mt-6 flex flex-wrap gap-3 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"}`}>
                          <ShieldIcon className="h-4 w-4 text-cyan-300" />
                          {lang === "fr" ? "Vos commandes seulement" : "Only your orders are visible here"}
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"}`}>
                          <ClockIcon className="h-4 w-4 text-sky-300" />
                          {lang === "fr" ? "Les demandes en attente sont suivies automatiquement" : "Pending requests are tracked automatically"}
                        </span>
                      </div>
                    </div>

                    <div className={`rounded-[24px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${theme === "light" ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.04]"}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">{t.latestUpdate}</p>
                      <h3 className="mt-3 text-xl font-semibold text-white">
                        {latestOrder ? `${t.orderTitlePrefix} #${latestOrder.id}` : t.noRequestsYet}
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">{latestOrderRoute}</p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <MiniStat label={t.status} value={latestOrder ? formatStatusLabel(latestOrder.statut, lang) : t.noData} tone={latestOrder ? getStatusTone(latestOrder.statut) : "neutral"} />
                        <MiniStat label={t.verification} value={latestOrder ? (latestOrder.verified ? t.verified : t.nonVerified) : t.noData} tone={latestOrder ? (latestOrder.verified ? "success" : "muted") : "neutral"} />
                      </div>

                      <div className={`mt-5 rounded-2xl border p-4 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/10 bg-[#0b1324]/70"}`}>
                        <p className={`text-sm font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.whatHappensNext}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{latestOrderStep}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {showRequestForm && (
                <section className={`rounded-[28px] border p-5 shadow-[0_28px_100px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-cyan-400/15 bg-[linear-gradient(180deg,rgba(8,15,28,0.98),rgba(11,19,36,0.98))]"}`}>
                  <div className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between ${theme === "light" ? "border-slate-200" : "border-white/8"}`}>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">{t.requestTransport}</p>
                      <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>New transport request</h2>
                      <p className={`mt-2 text-sm leading-6 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                        Fill in the route details below. The request will be created as pending and non-verified automatically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeRequestForm}
                      className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                    >
                      {t.close}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.8fr)]">
                    <form className="space-y-4" onSubmit={handleCreateRequest}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                          label={t.departure}
                          name="lieu_depart"
                          value={requestForm.lieu_depart}
                          onChange={handleRequestChange}
                          placeholder="City, warehouse, or address"
                        />
                        <InputField
                          label={t.arrival}
                          name="lieu_arrivee"
                          value={requestForm.lieu_arrivee}
                          onChange={handleRequestChange}
                          placeholder="City, warehouse, or address"
                        />
                        <InputField
                          label={t.transportDate}
                          name="date_transport"
                          value={requestForm.date_transport}
                          onChange={handleRequestChange}
                          type="date"
                        />
                        <InputField
                          label={t.estimatedPrice}
                          name="prix"
                          value={requestForm.prix}
                          onChange={handleRequestChange}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className={`text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                          {lang === "fr" ? "Le statut reste en attente et la verification est geree automatiquement par les operations." : "Status is fixed to pending and verification is set automatically by the operations team."}
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={closeRequestForm}
                            className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {submitting ? t.submitting : t.submitRequest}
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className={`rounded-[24px] border p-5 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/8 bg-[#0b1324]/70"}`}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">{t.requestRules}</p>
                      <div className={`mt-4 space-y-3 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                        <RuleLine title={lang === "fr" ? "Seules vos demandes de transport sont stockees ici." : "Only your transport requests are stored here."} />
                        <RuleLine title={lang === "fr" ? "Aucun champ administrateur n'apparait dans ce flux." : "No admin fields are shown in this flow."} />
                        <RuleLine title={lang === "fr" ? "La demande commence automatiquement en attente." : "The request starts in pending state automatically."} />
                      </div>
                      <div className={`mt-5 rounded-2xl border p-4 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-400"}`}>
                        {lang === "fr" ? "Conseil : utilisez un trajet clair et une date realiste pour accelerer la validation." : "Tip: use clear route names and a realistic transport date so operations can review your request faster."}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label={t.totalOrders}
                  value={metrics.total}
                  icon={OrdersIcon}
                  tone="cyan"
                  caption={lang === "fr" ? "Toutes les demandes liees a votre compte" : "All requests linked to your account"}
                />
                <MetricCard
                  label={t.pendingRequests}
                  value={metrics.pending}
                  icon={PendingIcon}
                  tone="amber"
                  caption={lang === "fr" ? "En attente de validation ou d'expedition" : "Awaiting review or dispatch"}
                />
                <MetricCard
                  label={t.verifiedOrders}
                  value={metrics.verified}
                  icon={VerifiedIcon}
                  tone="emerald"
                  caption={lang === "fr" ? "Confirmees par l'equipe operations" : "Confirmed by the operations team"}
                />
                <MetricCard
                  label={t.deliveredOrders}
                  value={metrics.delivered}
                  icon={TruckCheckIcon}
                  tone="sky"
                  caption={lang === "fr" ? "Commandes terminees et archivees" : "Completed and closed orders"}
                />
              </section>

              <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.86fr)] lg:items-start">
                <div className="space-y-6">
                  <section
                    ref={ordersSectionRef}
                    id="orders"
                    className={`rounded-[28px] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}
                  >
                    <div className={`flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between ${theme === "light" ? "border-slate-200" : "border-white/8"}`}>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{t.myOrders}</p>
                        <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.transportRequests}</h2>
                        <p className={`mt-2 text-sm leading-6 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                          {t.reviewOrders}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`rounded-full border px-3 py-2 text-xs font-medium ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                          {filteredOrders.length} {t.visibleTotal} / {orders.length} {t.total}
                        </div>
                        <button
                          type="button"
                          onClick={loadOrders}
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-cyan-400/25 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-cyan-400/25 hover:bg-white/[0.06]"}`}
                        >
                          <RefreshIcon className="h-4 w-4" />
                          {t.refresh}
                        </button>
                      </div>
                    </div>

                    <div className={`mt-5 grid gap-3 rounded-2xl border p-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/8 bg-white/[0.02]"}`}>
                      <div className="relative">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          className={`client-search-input h-12 w-full rounded-xl border pl-10 pr-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-300/10 ${theme === "light" ? "border-slate-200 bg-white text-slate-900 focus:bg-white" : "border-slate-800/90 bg-slate-950/80 text-slate-100 focus:bg-slate-950"}`}
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder={t.searchPlaceholder}
                          autoComplete="off"
                        />
                      </div>
                      <div ref={statusMenuRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setStatusMenuOpen((prev) => !prev)}
                          className={`flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-300/10 ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-cyan-400/40 hover:bg-slate-50 focus:bg-white" : "border-slate-800/90 bg-slate-950/80 text-slate-100 hover:border-cyan-400/40 hover:bg-slate-950 focus:bg-slate-950"}`}
                          aria-haspopup="listbox"
                          aria-expanded={statusMenuOpen}
                        >
                          <span>{getStatusFilterLabel(statusFilter, lang)}</span>
                          <ChevronIcon className={`h-4 w-4 text-slate-500 transition ${statusMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {statusMenuOpen && (
                          <div className={`absolute right-0 top-[calc(100%+8px)] z-20 w-full min-w-[220px] overflow-hidden rounded-2xl border shadow-[0_24px_60px_rgba(0,0,0,0.42)] ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
                            {STATUS_FILTER_OPTIONS.map((option) => {
                              const isActive = option.value === statusFilter;

                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setStatusFilter(option.value);
                                    setStatusMenuOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                                    isActive
                                      ? "bg-cyan-500/15 text-cyan-100"
                                      : theme === "light"
                                        ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                        : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                                  }`}
                                >
                                  <span>{option.label}</span>
                                  {isActive && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        className={`inline-flex h-12 items-center justify-center rounded-xl border px-4 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"}`}
                      >
                        {t.resetFilters}
                      </button>
                    </div>

                    {loadingOrders ? (
                      <div className="mt-5 space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className={`rounded-2xl border p-4 ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-[#0b1324]/70"}`}>
                            <div className={`h-4 w-36 rounded-full ${theme === "light" ? "bg-slate-200" : "bg-white/10"}`} />
                            <div className={`mt-3 h-3 w-64 rounded-full ${theme === "light" ? "bg-slate-200" : "bg-white/10"}`} />
                            <div className={`mt-3 h-3 w-44 rounded-full ${theme === "light" ? "bg-slate-200" : "bg-white/10"}`} />
                          </div>
                        ))}
                      </div>
                    ) : hasVisibleOrders ? (
                      <>
                        <div className={`mt-5 hidden overflow-x-auto rounded-2xl border lg:block ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-[#0b1324]"}`}>
                          <table className="min-w-[980px] w-full text-left text-sm">
                            <thead className={`border-b ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/8 bg-white/[0.02] text-slate-400"}`}>
                              <tr>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">Order ID</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">Route</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">{t.client}</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">Date</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">Status</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">Verification</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.14em]">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrders.map((order, index) => (
                                <tr
                                  key={order.id}
                                  className={`border-t transition duration-200 ${
                                    theme === "light"
                                      ? `${index % 2 === 0 ? "bg-slate-50" : "bg-white"} border-slate-200 text-slate-700 hover:bg-slate-100`
                                      : `${index % 2 === 0 ? "bg-[#1b283f]/55" : "bg-[#0b1324]"} border-white/8 text-slate-200 hover:bg-[#22314a]/70`
                                  }`}
                                >
                                  <td className={`whitespace-nowrap px-4 py-4 font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>#{order.id}</td>
                                  <td className={`px-4 py-4 ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                                    <div className={`font-medium ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{formatRoute(order, lang)}</div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      {order.camion?.matricule ? `${t.truck}: ${order.camion.matricule}` : t.assignedTruck}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <OrderClientInfo
                                      order={order}
                                      fallbackUser={user}
                                      theme={theme}
                                      compact
                                      labels={{
                                        clientName: t.clientName,
                                        clientEmail: t.clientEmail,
                                        clientPhone: t.clientPhone,
                                        noData: t.noData,
                                        unknown: t.unknownAccount,
                                      }}
                                    />
                                  </td>
                                  <td className={`whitespace-nowrap px-4 py-4 ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>{formatDate(order.date_transport, lang)}</td>
                                  <td className="whitespace-nowrap px-4 py-4">
                                    <StatusBadge status={order.statut} />
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-4">
                                    <VerificationBadge verified={Boolean(order.verified)} />
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-4">
                                    <button
                                      type="button"
                                      onClick={() => handleViewDetails(order.id)}
                                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${theme === "light" ? "border-cyan-300/40 bg-cyan-100 text-cyan-700 hover:bg-cyan-200" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-500/20"}`}
                                    >
                                      {t.viewDetails}
                                      <ArrowRightIcon className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-5 grid gap-4 lg:hidden">
                          {filteredOrders.map((order) => (
                            <article key={order.id} className={`rounded-2xl border p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-[#0b1324]/70"}`}>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.order} #{order.id}</p>
                                  <h3 className={`mt-2 text-base font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{formatRoute(order, lang)}</h3>
                                </div>
                                <StatusBadge status={order.statut} />
                              </div>

                              <div className={`mt-4 grid gap-3 text-sm sm:grid-cols-2 ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{t.date}</p>
                                  <p className={`mt-1 font-medium ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{formatDate(order.date_transport, lang)}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{t.verification}</p>
                                  <div className="mt-1"><VerificationBadge verified={Boolean(order.verified)} /></div>
                                </div>
                              </div>

                              <div className={`mt-4 rounded-xl border px-3 py-3 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/8 bg-white/[0.02]"}`}>
                                <OrderClientInfo
                                  order={order}
                                  fallbackUser={user}
                                  theme={theme}
                                  labels={{
                                    clientName: t.clientName,
                                    clientEmail: t.clientEmail,
                                    clientPhone: t.clientPhone,
                                    noData: t.noData,
                                    unknown: t.unknownAccount,
                                  }}
                                />
                              </div>

                              <div className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-white/8 bg-white/[0.02] text-slate-300"}`}>
                                <span>{order.camion?.matricule ? `${t.truck} ${order.camion.matricule}` : t.assignedTruck}</span>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(order.id)}
                                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${theme === "light" ? "border-cyan-300/40 bg-cyan-100 text-cyan-700 hover:bg-cyan-200" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-500/20"}`}
                                >
                                  {t.viewDetails}
                                  <ArrowRightIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </>
                    ) : (
                      <EmptyOrdersState hasFilters={Boolean(searchTerm || statusFilter !== "all")} onRequestOrder={openRequestForm} />
                    )}
                  </section>
                </div>

                <div className="space-y-6 lg:sticky lg:top-6">
                  <section className={`rounded-[28px] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.requestTransport}</p>
                        <h2 className={`mt-2 text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{lang === "fr" ? "Envoyer une nouvelle commande" : "Submit a new order"}</h2>
                        <p className={`mt-2 text-sm leading-6 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                          {lang === "fr" ? "Lancez une demande en moins d'une minute. Le statut restera en attente et la verification restera non verifiee automatiquement." : "Start a request in under a minute. Status will be set to pending and verification will remain non-verified automatically."}
                        </p>
                      </div>
                      <div className={`rounded-2xl border p-3 ${theme === "light" ? "border-cyan-300/50 bg-cyan-100 text-cyan-700" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"}`}>
                        <RequestIcon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className={`mt-5 space-y-3 text-sm ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                      <FeatureLine label={t.autoStatus} value={lang === "fr" ? t.pendingState : "Pending"} />
                      <FeatureLine label={t.autoVerification} value={t.nonVerified} />
                      <FeatureLine label={t.access} value={t.accountOnly} />
                    </div>

                    <button
                      type="button"
                      onClick={openRequestForm}
                      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition duration-200 hover:bg-cyan-400 hover:shadow-[0_14px_32px_rgba(34,211,238,0.25)]"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {t.requestNewOrder}
                    </button>
                  </section>

                  <section className={`rounded-[28px] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.howItWorks}</p>
                    <ol className={`mt-4 space-y-4 text-sm ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                      <li className="flex gap-3">
                        <StepNumber>1</StepNumber>
                        <div>
                          <p className={`font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.sendRouteDetails}</p>
                          <p className={`mt-1 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>{t.routeDetailsCopy}</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <StepNumber>2</StepNumber>
                        <div>
                          <p className={`font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.operationsReviews}</p>
                          <p className={`mt-1 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>{t.operationsReviewsCopy}</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <StepNumber>3</StepNumber>
                        <div>
                          <p className={`font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.trackTheProgress}</p>
                          <p className={`mt-1 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>{t.trackProgressCopy}</p>
                        </div>
                      </li>
                    </ol>
                  </section>
                </div>

                <section className={`rounded-[28px] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">SQL</p>
                      <h2 className={`mt-2 text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.dbSummary}</h2>
                      <p className={`mt-2 text-sm leading-6 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>{t.dbSummaryCopy}</p>
                    </div>
                    <button
                      type="button"
                      onClick={loadSummaryOnly}
                      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                    >
                      <RefreshIcon className="h-4 w-4" />
                      {t.refresh}
                    </button>
                  </div>

                  {loadingSummary ? (
                    <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                      {t.loadingSummary}
                    </div>
                  ) : summaryRows.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-white/8">
                      <table className="min-w-full text-left text-sm">
                        <thead className={`${theme === "light" ? "bg-slate-100 text-slate-600" : "bg-white/[0.02] text-slate-400"}`}>
                          <tr>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.status}</th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.totalOrders}</th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]">{t.totalAmount}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryRows.map((row) => (
                            <tr key={row.statut} className={`${theme === "light" ? "border-t border-slate-200 text-slate-900" : "border-t border-white/8 text-slate-200"}`}>
                              <td className="px-4 py-3.5">{formatStatusLabel(row.statut, lang)}</td>
                              <td className="px-4 py-3.5">{row.total}</td>
                              <td className="px-4 py-3.5">{formatPrice(row.total_amount, lang)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                      {t.noData}
                    </div>
                  )}
                </section>
              </section>
            </div>
          </main>
        </div>
      </div>

      {selectedOrder && (
        <ModalShell title={`Order #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
            <div className="space-y-4">
              <section className="rounded-[24px] border border-slate-800 bg-[#0b1324] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.transportRequest}</p>
                    <h3 className={`mt-2 text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{formatRoute(selectedOrder, lang)}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {lang === "fr"
                        ? `Creee ${formatDate(selectedOrder.created_at, lang)} · Derniere mise a jour ${formatDate(selectedOrder.updated_at, lang)}`
                        : `Created ${formatDate(selectedOrder.created_at, lang)} · Last updated ${formatDate(selectedOrder.updated_at, lang)}`}
                    </p>
                  </div>
                  <StatusBadge status={selectedOrder.statut} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailField label={t.transportDate} value={formatDate(selectedOrder.date_transport, lang)} />
                  <DetailField label={lang === "fr" ? "Prix" : "Price"} value={formatPrice(selectedOrder.prix, lang)} />
                  <DetailField label={t.verification} value={selectedOrder.verified ? t.verified : t.nonVerified} />
                  <DetailField label={t.truck} value={selectedOrder.camion?.matricule || t.assignedTruck} />
                  <DetailField label={t.requestID} value={`#${selectedOrder.id}`} />
                  <DetailField label={t.currentStage} value={formatStatusLabel(selectedOrder.statut, lang)} />
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-800 bg-[#0b1324] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.clientInformation}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailField label={t.clientName} value={selectedOrder.client?.nom || user?.name || t.unknownAccount} />
                  <DetailField label={t.clientEmail} value={selectedOrder.client?.email || user?.email || t.noData} />
                  <DetailField label={t.clientPhone} value={selectedOrder.client?.telephone || t.noData} />
                  <DetailField label={t.clientAddress} value={selectedOrder.client?.adresse || t.noData} />
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-800 bg-[#0b1324] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.truckAssignment}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailField label={t.truck} value={selectedOrder.camion?.matricule || t.assignedTruck} />
                  <DetailField label={t.brand} value={selectedOrder.camion?.marque || t.noData} />
                  <DetailField label={t.model} value={selectedOrder.camion?.modele || t.noData} />
                  <DetailField label={t.truckStatus} value={selectedOrder.camion?.statut || t.noData} />
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-[24px] border border-slate-800 bg-[#0b1324] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/70">{t.requestSummary}</p>
                <div className="mt-4 space-y-3">
                  <MiniStat label={t.status} value={formatStatusLabel(selectedOrder.statut, lang)} tone={getStatusTone(selectedOrder.statut)} fullWidth />
                  <MiniStat label={t.verification} value={selectedOrder.verified ? t.verified : t.nonVerified} tone={selectedOrder.verified ? "success" : "muted"} fullWidth />
                  <MiniStat label={t.clientName} value={selectedOrder.client?.nom || user?.name || t.unknownAccount} tone="neutral" fullWidth />
                </div>
              </section>

              <section className="rounded-[24px] border border-slate-800 bg-[#0b1324] p-5 text-sm text-slate-300 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.progressNotes}</p>
                <div className="mt-4 space-y-3">
                  <RuleLine title={getProgressCopy(selectedOrder, lang)} />
                  <RuleLine title={lang === "fr" ? "Vous ne pouvez voir ici que votre propre demande de transport." : "You can only view your own transport request in this portal."} />
                  <RuleLine title={lang === "fr" ? "Les mises a jour apparaitront ici lorsque les operations changeront le statut." : "Any progress updates will appear here once operations changes the status."} />
                </div>
              </section>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, tone, caption }) {
  const theme = getThemeMode();
  const toneClasses = {
    cyan: "from-cyan-500/25 to-sky-500/10 text-cyan-200 border-cyan-400/15",
    amber: "from-amber-500/25 to-orange-500/10 text-amber-200 border-amber-400/15",
    emerald: "from-emerald-500/25 to-green-500/10 text-emerald-200 border-emerald-400/15",
    sky: "from-sky-500/25 to-blue-500/10 text-sky-200 border-sky-400/15",
  };

  return (
    <article className={`group rounded-[24px] border p-5 shadow-[0_22px_70px_rgba(0,0,0,0.26)] transition duration-200 hover:-translate-y-0.5 ${toneClasses[tone] || toneClasses.cyan} ${theme === "light" ? "bg-white" : "bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>{value}</p>
        </div>
        <div className={`rounded-2xl border p-3 transition group-hover:border-white/15 ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700 group-hover:bg-slate-100" : "border-white/10 bg-white/[0.03] text-slate-200 group-hover:bg-white/[0.06]"}`}>
          {icon ? createElement(icon, { className: "h-5 w-5" }) : null}
        </div>
      </div>
      <p className={`mt-4 text-xs leading-5 ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>{caption}</p>
    </article>
  );
}

function MiniStat({ label, value, tone, fullWidth = false }) {
  const theme = getThemeMode();
  const toneClasses = {
    success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    muted: "border-slate-500/20 bg-slate-500/10 text-slate-200",
    neutral: "border-white/10 bg-white/[0.03] text-slate-200",
    active: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses[tone] || toneClasses.neutral} ${theme === "light" ? "bg-white text-slate-900" : ""} ${fullWidth ? "w-full" : ""}`}>
      <p className={`text-xs uppercase tracking-[0.14em] ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-1 text-sm font-medium ${theme === "light" ? "text-slate-900" : ""}`}>{value}</p>
    </div>
  );
}

function FeatureLine({ label, value }) {
  const theme = getThemeMode();
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/8 bg-white/[0.03]"}`}>
      <span className={theme === "light" ? "text-slate-600" : "text-slate-400"}>{label}</span>
      <span className={`font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>{value}</span>
    </div>
  );
}

function EmptyOrdersState({ hasFilters, onRequestOrder }) {
  const theme = getThemeMode();
  return (
    <div className={`mt-5 rounded-[24px] border border-dashed px-6 py-10 text-center ${theme === "light" ? "border-slate-200 bg-white" : "border-white/12 bg-[#0b1324]/70"}`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
        <PackageIcon className="h-8 w-8" />
      </div>
      <h3 className={`mt-5 text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>
        {hasFilters ? (theme === "light" ? "Aucune commande ne correspond a vos filtres" : "No orders match your filters") : (theme === "light" ? "Vous n'avez encore aucune demande de transport" : "You do not have any transport requests yet")}
      </h3>
      <p className={`mx-auto mt-3 max-w-xl text-sm leading-6 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
        {hasFilters
          ? (theme === "light" ? "Essayez de modifier la recherche ou le filtre de statut pour trouver une commande." : "Try changing the search or status filter to find an order.")
          : (theme === "light" ? "Commencez par envoyer votre premiere demande de transport. Elle sera creee en attente et liee uniquement a votre compte." : "Start by submitting your first transport request. It will be created as pending and linked only to your account.")}
      </p>
      <button
        type="button"
        onClick={onRequestOrder}
        className={`mt-6 inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${theme === "light" ? "border-cyan-400/25 bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "border-cyan-400/25 bg-cyan-500 text-slate-950 hover:bg-cyan-400"}`}
      >
        <PlusIcon className="h-4 w-4" />
        {theme === "light" ? "Demander votre premiere commande" : "Request your first order"}
      </button>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  const theme = getThemeMode();
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onClose}
      />
      <div className={`relative z-10 my-auto w-full max-w-5xl rounded-[30px] border p-5 shadow-[0_30px_120px_rgba(0,0,0,0.75)] sm:p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-[#050814]"}`}>
        <div className={`mb-5 flex items-start justify-between gap-4 border-b pb-4 ${theme === "light" ? "border-slate-200" : "border-white/8"}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">AK Rapid Trans</p>
            <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white"}`}
            aria-label="Close dialog"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[82vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  const theme = getThemeMode();
  return (
    <div className={`rounded-2xl border p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-[#0b1324]"}`}>
      <p className={`text-xs uppercase tracking-[0.14em] ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
      <p className={`mt-2 text-sm font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>{value}</p>
    </div>
  );
}

function RuleLine({ title }) {
  const theme = getThemeMode();
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-[#0b1324]"}`}>
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <p className={theme === "light" ? "text-slate-700" : "text-slate-300"}>{title}</p>
    </div>
  );
}

function StepNumber({ children }) {
  const theme = getThemeMode();

  return (
    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${theme === "light" ? "border-cyan-300/50 bg-cyan-100 text-cyan-700" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const theme = getThemeMode();
  const resolvedStatus = normalizeOrderStatus(status);
  const darkConfig = {
    en_attente: {
      label: "Pending",
      className: "border-amber-400/20 bg-amber-500/10 text-amber-200",
    },
    en_cours: {
      label: "In progress",
      className: "border-sky-400/20 bg-sky-500/10 text-sky-200",
    },
    livree: {
      label: "Delivered",
      className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    },
    annulee: {
      label: "Cancelled",
      className: "border-rose-400/20 bg-rose-500/10 text-rose-200",
    },
    validee: {
      label: "Validated",
      className: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
    },
  };
  const lightConfig = {
    en_attente: {
      label: "Pending",
      className: "border-amber-300 bg-amber-100 text-amber-800",
    },
    en_cours: {
      label: "In progress",
      className: "border-sky-300 bg-sky-100 text-sky-800",
    },
    livree: {
      label: "Delivered",
      className: "border-emerald-300 bg-emerald-100 text-emerald-800",
    },
    annulee: {
      label: "Cancelled",
      className: "border-rose-300 bg-rose-100 text-rose-800",
    },
    validee: {
      label: "Validated",
      className: "border-cyan-300 bg-cyan-100 text-cyan-800",
    },
  };

  const config = theme === "light" ? lightConfig : darkConfig;

  const resolved = config[resolvedStatus] || config.en_attente;

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${resolved.className}`}>{resolved.label}</span>;
}

function VerificationBadge({ verified }) {
  const theme = getThemeMode();
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        verified
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : theme === "light"
            ? "border-slate-200 bg-slate-100 text-slate-700"
            : "border-slate-500/20 bg-slate-500/10 text-slate-300"
      }`}
    >
      {verified ? "Verified" : "Non verified"}
    </span>
  );
}

function normalizeOrderStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "verified") {
    return "validee";
  }

  if (["en_attente", "en_cours", "livree", "annulee", "validee"].includes(value)) {
    return value;
  }

  return "en_attente";
}

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "en_attente", label: "Pending" },
  { value: "en_cours", label: "In progress" },
  { value: "livree", label: "Delivered" },
  { value: "annulee", label: "Cancelled" },
];

function getStatusFilterLabel(value, lang = "en") {
  const labels = {
    en: "All statuses",
    fr: "Tous les statuts",
  };

  return STATUS_FILTER_OPTIONS.find((option) => option.value === value)?.label || labels[lang] || labels.en;
}

function formatStatusLabel(status, lang = "en") {
  const normalized = normalizeOrderStatus(status);
  const labels = {
    en: {
      en_attente: "Pending",
      en_cours: "In progress",
      livree: "Delivered",
      annulee: "Cancelled",
      validee: "Validated",
    },
    fr: {
      en_attente: "En attente",
      en_cours: "En cours",
      livree: "Livree",
      annulee: "Annulee",
      validee: "Validee",
    },
  };

  return labels[lang]?.[normalized] || labels.en.en_attente;
}

function getStatusTone(status) {
  const normalized = normalizeOrderStatus(status);
  if (normalized === "livree") return "success";
  if (normalized === "en_cours" || normalized === "validee") return "active";
  if (normalized === "annulee") return "muted";
  return "neutral";
}

function getProgressCopy(order, lang = "en") {
  const status = normalizeOrderStatus(order.statut);
  const isVerified = Boolean(order.verified);

  const copy = {
    en: {
      annulee: "This request was cancelled. You can submit a new one whenever you are ready.",
      livree: "Your transport has been delivered. Keep the record here for tracking and reference.",
      en_cours: isVerified
        ? "Your request is active, verified, and currently in progress with the operations team."
        : "Your request is moving forward, but it still needs verification from the operations team.",
      validee: "Your request has been validated and is waiting for the next operational step.",
      defaultVerified: "Your request is under review and marked as verified for the next steps.",
      defaultPending: "Your request is under review and waiting for verification by the operations team.",
    },
    fr: {
      annulee: "Cette demande a ete annulee. Vous pouvez en envoyer une nouvelle quand vous etes pret.",
      livree: "Votre transport a ete livre. Conservez ici la trace pour le suivi et la reference.",
      en_cours: isVerified
        ? "Votre demande est active, verifiee et actuellement en cours avec l'equipe operations."
        : "Votre demande avance, mais elle attend encore la verification de l'equipe operations.",
      validee: "Votre demande a ete validee et attend la prochaine etape operationnelle.",
      defaultVerified: "Votre demande est en cours de verification et marquee comme verifiee pour la suite.",
      defaultPending: "Votre demande est en cours de verification par l'equipe operations.",
    },
  };

  if (status === "annulee") {
    return copy[lang]?.annulee || copy.en.annulee;
  }

  if (status === "livree") {
    return copy[lang]?.livree || copy.en.livree;
  }

  if (status === "en_cours") {
    return copy[lang]?.en_cours || copy.en.en_cours;
  }

  if (status === "validee") {
    return copy[lang]?.validee || copy.en.validee;
  }

  return isVerified ? copy[lang]?.defaultVerified || copy.en.defaultVerified : copy[lang]?.defaultPending || copy.en.defaultPending;
}

function formatRoute(order, lang = "en") {
  const departure = order?.lieu_depart || (lang === "fr" ? "Depart" : "Departure");
  const arrival = order?.lieu_arrivee || (lang === "fr" ? "Arrivee" : "Arrival");

  return `${departure} → ${arrival}`;
}

function formatDate(value, lang = "en") {
  if (!value) {
    return lang === "fr" ? "N/A" : "N/A";
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

function formatPrice(value, lang = "en") {
  if (value === null || value === undefined || value === "") {
    return lang === "fr" ? "N/A" : "N/A";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `DHS ${numeric.toLocaleString(lang === "fr" ? "fr-FR" : undefined)}`;
}

function InputField({ label, name, value, onChange, type = "text", ...rest }) {
  const theme = getThemeMode();
  return (
    <label className="block">
      <span className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
        required={type !== "number"}
        {...rest}
      />
    </label>
  );
}

function PlusIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 12a8 8 0 0 0-14.5-4.5M4 12a8 8 0 0 0 14.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 4h4v4M8 20H4v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RequestIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 15v5m-2.5-2.5H19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PackageIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7.5 12 3l8 4.5-8 4.5L4 7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 7.5V16.5L12 21l8-4.5V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 12v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 5 6v5c0 5 3.5 8.8 7 10 3.5-1.2 7-5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function PendingIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function VerifiedIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m9 12 2.2 2.2L15 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3 5 6v5c0 5 3.5 8.8 7 10 3.5-1.2 7-5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function TruckCheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 7h10v10H3V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 10h3l3 3v4h-6v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8 14 1.8 1.8L13 12.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="18" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default ClientDashboard;
