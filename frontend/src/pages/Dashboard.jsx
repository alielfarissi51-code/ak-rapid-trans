import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import AdminNotificationPopup from "../components/AdminNotificationPopup";
import Sidebar from "../components/Sidebar";
import { clearToken, getCamions, getCommandes, getMe, getUsers, logout as apiLogout } from "../services/api";
import { applyDocumentTheme, getStoredPreferences } from "../utils/preferences";

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
    const [user, setUser] = useState(location.state?.user || null);
    const [loadingUser, setLoadingUser] = useState(!location.state?.user);
    const [authError, setAuthError] = useState("");
    const [counts, setCounts] = useState({ users: 0, camions: 0, commandes: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [truckStatusData, setTruckStatusData] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [orderStatusPieData, setOrderStatusPieData] = useState([]);
    const [activity, setActivity] = useState([]);
    const [preferences, setPreferences] = useState(() => getStoredPreferences());
    const roleName = user?.role_name || user?.role || null;
    const theme = preferences.theme === "light" ? "light" : "dark";
    const lang = preferences.lang === "fr" ? "fr" : "en";
    const t = useMemo(() => getDashboardTranslations(lang), [lang]);

    useEffect(() => {
        applyDocumentTheme(theme);
    }, [theme]);

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [successMessage]);

    useEffect(() => {
        let active = true;

        const loadUser = async () => {
            if (user && roleName) {
                if (roleName !== "admin") {
                    navigate("/dashboard-client", { replace: true });
                }

                return;
            }

            try {
                const profile = await getMe();

                if (active) {
                    const profileRole = profile.role_name || profile.role || null;

                    if (profileRole !== "admin") {
                        navigate("/dashboard-client", { replace: true, state: { user: profile } });
                        return;
                    }

                    setUser(profile);
                }
            } catch (error) {
                if (active) {
                    setAuthError(error.message || "Session expired. Please log in again.");
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
    }, [navigate, roleName, user]);

    useEffect(() => {
        if (roleName !== "admin") {
            return;
        }

        let active = true;

        const loadDashboardData = async () => {
            try {
                setLoadingStats(true);
                const [users, camions, commandes] = await Promise.all([
                    getUsers(),
                    getCamions(),
                    getCommandes(),
                ]);

                if (active) {
                    const pendingOrders = commandes.filter((item) => item.statut === "en_attente").length;
                    const deliveredOrders = commandes.filter((item) => item.statut === "livree").length;
                    const availableCamions = camions.filter((item) => item.statut === "disponible").length;
                    const trucksDistribution = buildStatusChartData(camions, CAMION_STATUS_META, lang);
                    const ordersDistribution = buildStatusChartData(commandes, ORDER_STATUS_META, lang);

                    setCounts({
                        users: users.length,
                        camions: camions.length,
                        commandes: commandes.length,
                    });

                    setRecentOrders(commandes.slice(0, 5));
                    setTruckStatusData(trucksDistribution);
                    setOrderStatusData(ordersDistribution);
                    setOrderStatusPieData(ordersDistribution);
                    setActivity([
                        {
                            title: t.pendingOrders(pendingOrders),
                            time: t.live,
                            tone: "bg-amber-400",
                        },
                        {
                            title: t.deliveredOrders(deliveredOrders),
                            time: t.live,
                            tone: "bg-emerald-400",
                        },
                        {
                            title: t.availableTrucks(availableCamions),
                            time: t.live,
                            tone: "bg-cyan-400",
                        },
                        {
                            title: t.registeredUsers(users.length),
                            time: t.live,
                            tone: "bg-indigo-400",
                        },
                    ]);
                }
            } catch {
                if (active) {
                    setCounts({ users: 0, camions: 0, commandes: 0 });
                    setRecentOrders([]);
                    setTruckStatusData([]);
                    setOrderStatusData([]);
                    setOrderStatusPieData([]);
                    setActivity([]);
                }
            } finally {
                if (active) {
                    setLoadingStats(false);
                }
            }
        };

        loadDashboardData();

        return () => {
            active = false;
        };
    }, [lang, roleName, t]);

    const isAdmin = roleName === "admin";
    const stats = [
        {
            label: t.totalUsers,
            value: loadingStats ? "..." : counts.users.toLocaleString(),
            delta: t.registeredAccounts,
            icon: ClientsStatIcon,
            accent: "from-indigo-500/25 to-sky-500/10",
        },
        {
            label: t.totalTrucks,
            value: loadingStats ? "..." : counts.camions.toLocaleString(),
            delta: t.fleetSize,
            icon: TruckStatIcon,
            accent: "from-cyan-500/25 to-sky-500/10",
        },
        {
            label: t.totalOrders,
            value: loadingStats ? "..." : counts.commandes.toLocaleString(),
            delta: t.allOrders,
            icon: OrdersStatIcon,
            accent: "from-sky-500/30 to-blue-500/10",
        },
    ];
    const pageSubtitle = t.pageSubtitle;
    const pageEyebrow = t.pageEyebrow;
    const liveBadge = t.liveSync;

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch {
            // Logout should still clear local state even if the API call fails.
        } finally {
            clearToken();
            navigate("/", { replace: true });
        }
    };

    return (
        <div className={`app-dashboard h-screen overflow-hidden ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100"}`}>
            <div className="flex h-full">
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                    user={user}
                    isAdmin={isAdmin}
                    onLogout={handleLogout}
                    preferences={preferences}
                    onPreferencesChange={setPreferences}
                />

                <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                    <header className={`sticky top-0 z-20 border-b px-4 py-4 backdrop-blur sm:px-6 lg:px-8 ${theme === "light" ? "border-slate-200 bg-white/90" : "border-slate-800 bg-slate-950/90"}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileSidebarOpen(true)}
                                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition lg:hidden ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-sky-400/40 hover:bg-sky-50" : "border-white/10 bg-white/5 text-slate-200 hover:border-sky-400/40 hover:bg-sky-500/10"}`}
                                    aria-label={t.openSidebar}
                                >
                                    <MenuIcon className="h-5 w-5" />
                                </button>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{t.operationsHq}</p>
                                    <h1 className={`truncate text-2xl font-semibold tracking-tight sm:text-3xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                                        {t.dashboard}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <AdminNotificationPopup theme={theme} />
                                <div className={`hidden rounded-full border px-4 py-2 text-sm sm:block ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-slate-700 bg-slate-900 text-slate-300"}`}>
                                    {user ? `${user.name} • ${t.admin}` : t.loadingAccount}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-7xl flex-col gap-6">
                            {loadingUser && !user && (
                                <div className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur-xl ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-slate-300"}`}>
                                    {t.loadingYourAccount}
                                </div>
                            )}

                            {authError && (
                                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200 backdrop-blur-xl">
                                    {authError}
                                </div>
                            )}

                            {successMessage && (
                                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_20px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl">
                                    {successMessage}
                                </div>
                            )}

                            <section className={`rounded-2xl border p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"}`}>
                                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className={`text-xs uppercase tracking-[0.22em] ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                            {pageEyebrow}
                                        </p>
                                        <h2 className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                                            {pageSubtitle}
                                        </h2>
                                    </div>

                                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${theme === "light" ? "border-slate-200 bg-white text-slate-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
                                        <SparkIcon className="h-4 w-4" />
                                        {liveBadge}
                                    </div>
                                </div>

                                <div className="mb-6 grid gap-3 md:grid-cols-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/users")}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500 hover:bg-slate-900"}`}
                                    >
                                        <UsersIcon className="h-4 w-4" />
                                        {t.manageUsers}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/camions")}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500 hover:bg-slate-900"}`}
                                    >
                                        <TruckActionIcon className="h-4 w-4" />
                                        {t.manageTrucks}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/commandes")}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500 hover:bg-slate-900"}`}
                                    >
                                        <OrdersActionIcon className="h-4 w-4" />
                                        {t.manageOrders}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(0)}
                                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${theme === "light" ? "border-slate-200 bg-slate-900 text-white hover:bg-slate-800" : "border-cyan-500/35 bg-cyan-500 text-slate-950 hover:bg-cyan-400"}`}
                                    >
                                        <RefreshIcon className="h-4 w-4" />
                                        {t.refreshData}
                                    </button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {stats.map((stat) => {
                                        const Icon = stat.icon;

                                        return (
                                            <article
                                                key={stat.label}
                                                className={`rounded-xl border p-5 transition duration-200 hover:-translate-y-0.5 ${theme === "light" ? "border-slate-200 bg-white hover:border-slate-300" : "border-slate-800 bg-slate-950 hover:border-slate-700"}`}
                                            >
                                                <div className="mb-5 flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-300"}`}>{stat.label}</p>
                                                        <p className={`mt-3 text-3xl font-semibold tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                                                            {stat.value}
                                                        </p>
                                                    </div>

                                                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-slate-700 bg-slate-900 text-cyan-300"}`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                </div>

                                                <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{stat.delta}</p>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                                    <StatusDistributionChart
                                        title={t.trucksStatus}
                                        subtitle={t.trucksStatusSubtitle}
                                        data={truckStatusData}
                                        total={counts.camions}
                                        loading={loadingStats}
                                        chartType="bar"
                                        lang={lang}
                                        theme={theme}
                                    />
                                    <StatusDistributionChart
                                        title={t.ordersStatus}
                                        subtitle={t.ordersStatusSubtitle}
                                        data={orderStatusData}
                                        total={counts.commandes}
                                        loading={loadingStats}
                                        chartType="line"
                                        lang={lang}
                                        theme={theme}
                                    />
                                    <StatusDistributionChart
                                        title={t.ordersStatus}
                                        subtitle={t.ordersStatusSubtitle}
                                        data={orderStatusPieData}
                                        total={counts.commandes}
                                        loading={loadingStats}
                                        chartType="pie"
                                        lang={lang}
                                        theme={theme}
                                    />
                                </div>
                            </section>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
                                <section className={`rounded-2xl border p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"}`}>
                                    <div className="mb-6 flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className={`text-lg font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.recentOrders}</h3>
                                                <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                                {t.recentOrdersSubtitle}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className={`rounded-lg border px-4 py-2 text-sm transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50" : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500 hover:bg-slate-900"}`}
                                        >
                                            {t.viewAll}
                                        </button>
                                    </div>

                                    <div className={`overflow-hidden rounded-xl border ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
                                        <div className="overflow-x-auto">
                                            <table className={`min-w-full divide-y text-left text-sm ${theme === "light" ? "divide-slate-100" : "divide-white/5"}`}>
                                                <thead className={`${theme === "light" ? "bg-slate-50 text-slate-500" : "bg-white/[0.03] text-slate-400"}`}>
                                                    <tr>
                                                        <th className="px-5 py-4 font-medium">ID</th>
                                                        <th className="px-5 py-4 font-medium">{t.client}</th>
                                                        <th className="px-5 py-4 font-medium">{t.status}</th>
                                                        <th className="px-5 py-4 font-medium">{t.date}</th>
                                                        <th className="px-5 py-4 font-medium">{t.action}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`divide-y ${theme === "light" ? "divide-slate-100" : "divide-white/5"}`}>
                                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                                        <tr key={order.id} className={`transition ${theme === "light" ? "hover:bg-slate-50" : "hover:bg-white/[0.03]"}`}>
                                                            <td className={`px-5 py-4 font-medium ${theme === "light" ? "text-slate-900" : "text-white"}`}>#{order.id}</td>
                                                            <td className={`px-5 py-4 ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{order.client?.nom || "N/A"}</td>
                                                            <td className="px-5 py-4">
                                                                <StatusPill status={order.statut} lang={lang} />
                                                            </td>
                                                            <td className={`px-5 py-4 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                                                                {new Date(order.date_transport).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => navigate("/admin/commandes")}
                                                                    className={`text-sm font-medium transition ${theme === "light" ? "text-slate-700 hover:text-slate-900" : "text-sky-300 hover:text-sky-200"}`}
                                                                >
                                                                    {t.open}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td className={`px-5 py-6 text-center ${theme === "light" ? "text-slate-500" : "text-slate-400"}`} colSpan="5">
                                                                {t.noRecentOrders}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>

                                <aside className="space-y-6">
                                    <section className={`rounded-2xl border p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"}`}>
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <h3 className={`text-lg font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.activity}</h3>
                                                <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{t.activitySubtitle}</p>
                                            </div>
                                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-sky-400/20 bg-sky-400/10 text-sky-200"}`}>
                                                {t.live}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {activity.map((item) => (
                                                <div key={item.title} className={`flex items-start gap-3 rounded-xl border p-4 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
                                                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm font-medium ${theme === "light" ? "text-slate-800" : "text-white"}`}>{item.title}</p>
                                                        <p className={`mt-1 text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{item.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className={`rounded-2xl border p-6 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"}`}>
                                        <p className={`text-sm uppercase tracking-[0.24em] ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{t.quickStats}</p>
                                        <div className="mt-4 space-y-4 text-sm text-slate-300">
                                            <MetricRow label={t.fleetUtilization} value="92%" theme={theme} />
                                            <MetricRow label={t.onTimeDelivery} value="97.6%" theme={theme} />
                                            <MetricRow label={t.openIncidents} value="04" theme={theme} />
                                        </div>
                                    </section>
                                </aside>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

function StatusPill({ status, lang = "en" }) {
    const styles = {
        livree: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        en_attente: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        annulee: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        validee: "border-blue-400/20 bg-blue-400/10 text-blue-300",
        en_cours: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    };

    const labels = lang === "fr"
        ? {
            livree: "Livree",
            en_attente: "En attente",
            annulee: "Annulee",
            validee: "Validee",
            en_cours: "En cours",
        }
        : {
            livree: "Delivered",
            en_attente: "Pending",
            annulee: "Cancelled",
            validee: "Validated",
            en_cours: "In Progress",
        };

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[status] || "border-white/10 bg-white/5 text-slate-300"}`}>
            {labels[status] || status}
        </span>
    );
}

function MetricRow({ label, value, theme = "dark" }) {
    return (
        <div className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${theme === "light" ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.03]"}`}>
            <span>{label}</span>
            <span className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{value}</span>
        </div>
    );
}

function StatusDistributionChart({ title, subtitle, data, total, loading, chartType = "bar", lang = "en", theme = "dark" }) {
    const [activeKey, setActiveKey] = useState(null);
    const normalizedTotal = total || data.reduce((sum, item) => sum + item.value, 0);
    const leadingItem = data[0] || null;
    const chartText = getChartTranslations(lang);
    const axisTickColor = theme === "light" ? "#475569" : "#e2e8f0";
    const axisLineColor = theme === "light" ? "rgba(100,116,139,0.35)" : "rgba(148,163,184,0.25)";
    const gridColor = theme === "light" ? "rgba(100,116,139,0.18)" : "rgba(148,163,184,0.15)";
    const tooltipStyles = {
        backgroundColor: theme === "light" ? "#0f172a" : "#020617",
        borderRadius: "10px",
        padding: "10px 12px",
        boxShadow: "0 10px 28px rgba(2, 6, 23, 0.38)",
        color: "#f8fafc",
        border: "1px solid rgba(148,163,184,0.3)",
    };

    const renderTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) {
            return null;
        }

        const rawPoint = payload[0]?.payload || {};
        const itemLabel = rawPoint.label || label || chartText.orders;
        const value = Number(payload[0]?.value ?? rawPoint.value ?? 0);
        const percentage = normalizedTotal > 0 ? Math.round((value / normalizedTotal) * 100) : 0;

        return (
            <div style={tooltipStyles}>
                <p className="text-[13px] font-semibold text-slate-50">{itemLabel}</p>
                <p className="mt-1 text-[13px] text-slate-200">{value} {chartText.records}</p>
                <p className="text-[13px] font-medium text-sky-300">{percentage}%</p>
            </div>
        );
    };

    return (
        <article className={`rounded-xl border p-5 shadow-sm ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-900"}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h3 className={`text-lg font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{title}</h3>
                    <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-500" : "text-slate-300"}`}>{subtitle}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${theme === "light" ? "border-slate-300 bg-slate-100 text-slate-700" : "border-slate-700 bg-slate-950 text-slate-300"}`}>
                    {normalizedTotal} {chartText.records}
                </span>
            </div>

            {loading ? (
                                        <div className={`rounded-2xl border px-4 py-6 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/[0.02] text-slate-300"}`}>
                    {chartText.loadingData}
                </div>
            ) : (
                <div className={`rounded-xl border p-4 ${theme === "light" ? "border-slate-200 bg-white" : "border-slate-800 bg-slate-950"}`}>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                                {chartType === "line" ? (
                                    <LineChart
                                        data={data}
                                        margin={{ top: 12, right: 12, left: 0, bottom: 24 }}
                                    >
                                        <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: axisTickColor, fontSize: 12, fontWeight: 500 }}
                                            axisLine={{ stroke: axisLineColor }}
                                            tickLine={false}
                                            interval={0}
                                            angle={-24}
                                            textAnchor="end"
                                            height={66}
                                            tickMargin={12}
                                            minTickGap={10}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: axisTickColor, fontSize: 12, fontWeight: 500 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={36}
                                        />
                                        <Tooltip
                                            content={renderTooltip}
                                            cursor={{ stroke: theme === "light" ? "#94a3b8" : "#475569", strokeWidth: 1 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#38bdf8"
                                            strokeWidth={3}
                                            dot={(dotProps) => {
                                                const isActive = !activeKey || activeKey === dotProps.payload?.key;

                                                return (
                                                    <circle
                                                        cx={dotProps.cx}
                                                        cy={dotProps.cy}
                                                        r={isActive ? 4.6 : 3.8}
                                                        fill="#e0f2fe"
                                                        stroke={theme === "light" ? "#0f172a" : "#082f49"}
                                                        strokeWidth={isActive ? 2.2 : 1.8}
                                                        opacity={isActive ? 1 : 0.55}
                                                    />
                                                );
                                            }}
                                            activeDot={{ r: 6.5, strokeWidth: 2, stroke: theme === "light" ? "#0f172a" : "#082f49" }}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                ) : chartType === "pie" ? (
                                    <PieChart>
                                        <Tooltip
                                            content={renderTooltip}
                                        />
                                        <Pie
                                            data={data}
                                            dataKey="value"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={92}
                                            innerRadius={54}
                                            paddingAngle={3}
                                            onMouseLeave={() => setActiveKey(null)}
                                        >
                                            {data.map((item) => (
                                                <Cell
                                                    key={`pie-${title}-${item.key}`}
                                                    fill={item.color}
                                                    opacity={!activeKey || activeKey === item.key ? 1 : 0.58}
                                                    stroke={theme === "light" ? "#ffffff" : "#0b1220"}
                                                    strokeWidth={!activeKey || activeKey === item.key ? 2 : 1}
                                                    onMouseEnter={() => setActiveKey(item.key)}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                ) : (
                                    <BarChart
                                        data={data}
                                        margin={{ top: 12, right: 12, left: 0, bottom: 24 }}
                                        barCategoryGap="24%"
                                    >
                                        <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: axisTickColor, fontSize: 12, fontWeight: 500 }}
                                            axisLine={{ stroke: axisLineColor }}
                                            tickLine={false}
                                            interval={0}
                                            angle={-24}
                                            textAnchor="end"
                                            height={66}
                                            tickMargin={12}
                                            minTickGap={10}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: axisTickColor, fontSize: 12, fontWeight: 500 }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={36}
                                        />
                                        <Tooltip
                                            content={renderTooltip}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[9, 9, 0, 0]}
                                            maxBarSize={44}
                                            onMouseLeave={() => setActiveKey(null)}
                                        >
                                            {data.map((item) => (
                                                <Cell
                                                    key={`${title}-${item.key}`}
                                                    fill={item.color}
                                                    opacity={!activeKey || activeKey === item.key ? 1 : 0.58}
                                                    onMouseEnter={() => setActiveKey(item.key)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {data.length > 0 ? data.map((item) => {
                            const percentage = normalizedTotal > 0 ? Math.round((item.value / normalizedTotal) * 100) : 0;

                            return (
                                <div
                                    key={`${title}-${item.key}`}
                                    className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition ${activeKey === item.key ? (theme === "light" ? "bg-slate-100" : "bg-slate-900") : ""}`}
                                    onMouseEnter={() => setActiveKey(item.key)}
                                    onMouseLeave={() => setActiveKey(null)}
                                >
                                    <span className={`flex items-center gap-2 text-[12px] font-medium ${theme === "light" ? "text-slate-700" : "text-slate-100"}`}>
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.label}
                                    </span>
                                    <span className={`text-[12px] font-semibold tabular-nums ${theme === "light" ? "text-slate-700" : "text-slate-200"}`}>{item.value} ({percentage}%)</span>
                                </div>
                            );
                        }) : (
                            <div className={`rounded-xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-500" : "border-slate-800 bg-slate-950 text-slate-400"}`}>
                                {chartText.noRecords}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!loading && leadingItem && normalizedTotal > 0 && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${theme === "light" ? "border-emerald-300/70 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
                    {chartText.dominantStatus}: <span className="font-semibold">{leadingItem.label}</span> ({Math.round((leadingItem.value / normalizedTotal) * 100)}%)
                </div>
            )}
        </article>
    );
}

function getChartTranslations(lang) {
    const chartTranslations = {
        en: {
            records: "records",
            orders: "Orders",
            loadingData: "Loading chart data...",
            noRecords: "No records available yet.",
            dominantStatus: "Dominant status",
        },
        fr: {
            records: "enregistrements",
            orders: "Commandes",
            loadingData: "Chargement des donnees du graphique...",
            noRecords: "Aucun enregistrement disponible.",
            dominantStatus: "Statut dominant",
        },
    };

    return chartTranslations[lang] || chartTranslations.en;
}

function getDashboardTranslations(lang) {
    const dashboardTranslations = {
        en: {
            pageEyebrow: "Admin Intelligence",
            pageSubtitle: "Overview of your logistics operations",
            liveSync: "Live sync enabled",
            openSidebar: "Open sidebar",
            operationsHq: "Operations HQ",
            dashboard: "Dashboard",
            admin: "Admin",
            loadingAccount: "Loading account...",
            loadingYourAccount: "Loading your account...",
            manageUsers: "Manage Users",
            manageTrucks: "Manage Trucks",
            manageOrders: "Manage Orders",
            refreshData: "Refresh Data",
            totalUsers: "Total Users",
            totalTrucks: "Total Trucks",
            totalOrders: "Total Orders",
            registeredAccounts: "Registered accounts",
            fleetSize: "Fleet size",
            allOrders: "All orders",
            trucksStatus: "Trucks Status",
            trucksStatusSubtitle: "Fleet availability and maintenance load",
            ordersStatus: "Orders Status",
            ordersStatusSubtitle: "Current order pipeline by stage",
            recentOrders: "Recent Orders",
            recentOrdersSubtitle: "Latest dispatch activity and shipping status",
            viewAll: "View all",
            client: "Client",
            status: "Status",
            date: "Date",
            action: "Action",
            open: "Open",
            noRecentOrders: "No recent orders available.",
            activity: "Activity",
            activitySubtitle: "Recent operational events",
            live: "Live",
            quickStats: "Quick Stats",
            fleetUtilization: "Fleet utilization",
            onTimeDelivery: "On-time delivery",
            openIncidents: "Open incidents",
            pendingOrders: (count) => `${count} pending orders to process`,
            deliveredOrders: (count) => `${count} orders delivered`,
            availableTrucks: (count) => `${count} trucks available`,
            registeredUsers: (count) => `${count} users registered`,
        },
        fr: {
            pageEyebrow: "Pilotage Admin",
            pageSubtitle: "Vue d'ensemble de vos operations logistiques",
            liveSync: "Synchronisation en direct activee",
            openSidebar: "Ouvrir la barre laterale",
            operationsHq: "Centre operations",
            dashboard: "Tableau de bord",
            admin: "Admin",
            loadingAccount: "Chargement du compte...",
            loadingYourAccount: "Chargement de votre compte...",
            manageUsers: "Gerer les utilisateurs",
            manageTrucks: "Gerer les camions",
            manageOrders: "Gerer les commandes",
            refreshData: "Actualiser les donnees",
            totalUsers: "Total utilisateurs",
            totalTrucks: "Total camions",
            totalOrders: "Total commandes",
            registeredAccounts: "Comptes enregistres",
            fleetSize: "Taille de flotte",
            allOrders: "Toutes les commandes",
            trucksStatus: "Statut des camions",
            trucksStatusSubtitle: "Disponibilite de la flotte et maintenance",
            ordersStatus: "Statut des commandes",
            ordersStatusSubtitle: "Pipeline actuel des commandes",
            recentOrders: "Commandes recentes",
            recentOrdersSubtitle: "Derniere activite d'expedition et statut",
            viewAll: "Voir tout",
            client: "Client",
            status: "Statut",
            date: "Date",
            action: "Action",
            open: "Ouvrir",
            noRecentOrders: "Aucune commande recente.",
            activity: "Activite",
            activitySubtitle: "Evenements operationnels recents",
            live: "Direct",
            quickStats: "Statistiques rapides",
            fleetUtilization: "Utilisation flotte",
            onTimeDelivery: "Livraison a l'heure",
            openIncidents: "Incidents ouverts",
            pendingOrders: (count) => `${count} commandes en attente`,
            deliveredOrders: (count) => `${count} commandes livrees`,
            availableTrucks: (count) => `${count} camions disponibles`,
            registeredUsers: (count) => `${count} utilisateurs enregistres`,
        },
    };

    return dashboardTranslations[lang] || dashboardTranslations.en;
}

const CAMION_STATUS_META = {
    disponible: { label: { en: "Available", fr: "Disponible" }, color: "#22c55e" },
    en_maintenance: { label: { en: "Maintenance", fr: "Maintenance" }, color: "#f59e0b" },
    indisponible: { label: { en: "Unavailable", fr: "Indisponible" }, color: "#ef4444" },
};

const ORDER_STATUS_META = {
    en_attente: { label: { en: "Pending", fr: "En attente" }, color: "#f59e0b" },
    validee: { label: { en: "Validated", fr: "Validee" }, color: "#38bdf8" },
    en_cours: { label: { en: "In Progress", fr: "En cours" }, color: "#06b6d4" },
    livree: { label: { en: "Delivered", fr: "Livree" }, color: "#22c55e" },
    annulee: { label: { en: "Cancelled", fr: "Annulee" }, color: "#ef4444" },
};

const FALLBACK_COLORS = ["#8b5cf6", "#f97316", "#14b8a6", "#eab308", "#a855f7", "#ec4899"];

function buildStatusChartData(items, statusMeta, lang) {
    const countsByStatus = items.reduce((acc, item) => {
        const statusKey = item?.statut || "unknown";
        acc[statusKey] = (acc[statusKey] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(countsByStatus)
        .map(([key, value], index) => ({
            key,
            value,
            label: statusMeta[key]?.label?.[lang] || statusMeta[key]?.label?.en || key,
            color: statusMeta[key]?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value);
}

function OrdersStatIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 6h14l-1 12H6L5 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function TruckStatIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 8h11v8H3V8Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M14 11h3l3 3v2h-6v-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M7 18a1.7 1.7 0 1 0 0-3.4A1.7 1.7 0 0 0 7 18Zm10 0a1.7 1.7 0 1 0 0-3.4A1.7 1.7 0 0 0 17 18Z" fill="currentColor" />
        </svg>
    );
}

function ClientsStatIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4.5 19.5c.7-3.1 3.2-5 7.5-5s6.8 1.9 7.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function MenuIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SparkIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 20c.7-3.2 3.2-5 5.5-5 2 0 3.7.9 4.8 2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M14.5 20c.4-2.5 2.1-4.2 4.5-4.2 1.4 0 2.8.6 3.5 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function TruckActionIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M3 9h12v7H3V9Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M15 11h3l3 3v2h-6v-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M7 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 18Zm10 0a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 18Z" fill="currentColor" />
        </svg>
    );
}

function OrdersActionIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 6h14l-1 12H6L5 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function RefreshIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M20 12a8 8 0 0 0-14-5M4 5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 12a8 8 0 0 0 14 5m2-5v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default Dashboard;