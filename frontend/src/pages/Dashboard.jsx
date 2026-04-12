import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { clearToken, getCamions, getCommandes, getMe, getUsers, logout as apiLogout } from "../services/api";

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
    const [activity, setActivity] = useState([]);
    const roleName = user?.role_name || user?.role || null;

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

                    setCounts({
                        users: users.length,
                        camions: camions.length,
                        commandes: commandes.length,
                    });

                    setRecentOrders(commandes.slice(0, 5));
                    setActivity([
                        {
                            title: `${pendingOrders} pending orders to process`,
                            time: "Live",
                            tone: "bg-amber-400",
                        },
                        {
                            title: `${deliveredOrders} orders delivered`,
                            time: "Live",
                            tone: "bg-emerald-400",
                        },
                        {
                            title: `${availableCamions} trucks available`,
                            time: "Live",
                            tone: "bg-cyan-400",
                        },
                        {
                            title: `${users.length} users registered`,
                            time: "Live",
                            tone: "bg-indigo-400",
                        },
                    ]);
                }
            } catch (error) {
                if (active) {
                    setCounts({ users: 0, camions: 0, commandes: 0 });
                    setRecentOrders([]);
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
    }, [roleName]);

    const isAdmin = roleName === "admin";
    const stats = [
        {
            label: "Total Users",
            value: loadingStats ? "..." : counts.users.toLocaleString(),
            delta: "Registered accounts",
            icon: ClientsStatIcon,
            accent: "from-indigo-500/25 to-sky-500/10",
        },
        {
            label: "Total Camions",
            value: loadingStats ? "..." : counts.camions.toLocaleString(),
            delta: "Fleet size",
            icon: TruckStatIcon,
            accent: "from-cyan-500/25 to-sky-500/10",
        },
        {
            label: "Total Orders",
            value: loadingStats ? "..." : counts.commandes.toLocaleString(),
            delta: "All commandes",
            icon: OrdersStatIcon,
            accent: "from-sky-500/30 to-blue-500/10",
        },
    ];
    const pageSubtitle = "Overview of your logistics operations";
    const pageEyebrow = "Admin Intelligence";
    const liveBadge = "Live sync enabled";

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            // Logout should still clear local state even if the API call fails.
        } finally {
            clearToken();
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[#050814] text-slate-100">
            <div className="flex h-full">
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                    user={user}
                    isAdmin={isAdmin}
                    onLogout={handleLogout}
                />

                <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                    <header className="border-b border-white/5 bg-[#050814]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileSidebarOpen(true)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10 lg:hidden"
                                    aria-label="Open sidebar"
                                >
                                    <MenuIcon className="h-5 w-5" />
                                </button>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-400">Operations HQ</p>
                                    <h1 className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                        Dashboard
                                    </h1>
                                </div>
                            </div>

                            <div className="hidden items-center gap-3 sm:flex">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
                                    {user ? `${user.name} • Admin` : "Loading account..."}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-7xl flex-col gap-6">
                            {loadingUser && !user && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-xl">
                                    Loading your account...
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

                            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.28em] text-sky-300/70">
                                            {pageEyebrow}
                                        </p>
                                        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                                            {pageSubtitle}
                                        </h2>
                                    </div>

                                    <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 px-4 py-3 text-sm text-sky-200">
                                        {liveBadge}
                                    </div>
                                </div>

                                <div className="mb-6 grid gap-3 md:grid-cols-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/users")}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-500/10"
                                    >
                                        Manage Users
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/camions")}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-500/10"
                                    >
                                        Manage Camions
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/commandes")}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-500/10"
                                    >
                                        Manage Orders
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(0)}
                                        className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                                    >
                                        Refresh Data
                                    </button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {stats.map((stat) => {
                                        const Icon = stat.icon;

                                        return (
                                            <article
                                                key={stat.label}
                                                className={`rounded-3xl border border-white/8 bg-gradient-to-br ${stat.accent} p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-sky-300/20`}
                                            >
                                                <div className="mb-6 flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm text-slate-300">{stat.label}</p>
                                                        <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                                                            {stat.value}
                                                        </p>
                                                    </div>

                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sky-200 shadow-[0_12px_30px_rgba(2,132,199,0.18)]">
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                </div>

                                                <p className="text-sm text-emerald-300">{stat.delta}</p>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
                                <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                                    <div className="mb-6 flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Latest dispatch activity and shipping status
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-white"
                                        >
                                            View all
                                        </button>
                                    </div>

                                    <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                                                <thead className="bg-white/[0.03] text-slate-400">
                                                    <tr>
                                                        <th className="px-5 py-4 font-medium">ID</th>
                                                        <th className="px-5 py-4 font-medium">Client</th>
                                                        <th className="px-5 py-4 font-medium">Status</th>
                                                        <th className="px-5 py-4 font-medium">Date</th>
                                                        <th className="px-5 py-4 font-medium">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                                        <tr key={order.id} className="transition hover:bg-white/[0.03]">
                                                            <td className="px-5 py-4 font-medium text-white">#{order.id}</td>
                                                            <td className="px-5 py-4 text-slate-300">{order.client?.nom || "N/A"}</td>
                                                            <td className="px-5 py-4">
                                                                <StatusPill status={order.statut} />
                                                            </td>
                                                            <td className="px-5 py-4 text-slate-400">
                                                                {new Date(order.date_transport).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => navigate("/admin/commandes")}
                                                                    className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
                                                                >
                                                                    Open
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td className="px-5 py-6 text-center text-slate-400" colSpan="5">
                                                                No recent orders available.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>

                                <aside className="space-y-6">
                                    <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Activity</h3>
                                                <p className="mt-1 text-sm text-slate-400">Recent operational events</p>
                                            </div>
                                            <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
                                                Live
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {activity.map((item) => (
                                                <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                                                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone} shadow-[0_0_18px_currentColor]`} />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-white">{item.title}</p>
                                                        <p className="mt-1 text-xs text-slate-400">{item.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-[28px] border border-sky-400/15 bg-gradient-to-br from-sky-500/15 to-blue-500/10 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.1)] backdrop-blur-2xl">
                                        <p className="text-sm uppercase tracking-[0.24em] text-sky-200/70">Quick Stats</p>
                                        <div className="mt-4 space-y-4 text-sm text-slate-300">
                                            <MetricRow label="Fleet utilization" value="92%" />
                                            <MetricRow label="On-time delivery" value="97.6%" />
                                            <MetricRow label="Open incidents" value="04" />
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

function StatusPill({ status }) {
    const styles = {
        livree: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        en_attente: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        annulee: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        validee: "border-blue-400/20 bg-blue-400/10 text-blue-300",
        en_cours: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    };

    const labels = {
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

function MetricRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span>{label}</span>
            <span className="font-semibold text-white">{value}</span>
        </div>
    );
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

export default Dashboard;