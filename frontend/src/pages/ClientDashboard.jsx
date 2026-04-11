import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { clearToken, getMe, logout as apiLogout } from "../services/api";

const clientStats = [
  {
    label: "My Orders",
    value: "18",
    delta: "+3 this week",
    icon: OrdersStatIcon,
    accent: "from-sky-500/30 to-blue-500/10",
  },
  {
    label: "Active Deliveries",
    value: "4",
    delta: "2 in transit",
    icon: TruckStatIcon,
    accent: "from-cyan-500/25 to-sky-500/10",
  },
  {
    label: "Invoices Due",
    value: "2",
    delta: "1 due this week",
    icon: InvoicesIcon,
    accent: "from-indigo-500/25 to-sky-500/10",
  },
  {
    label: "Support Tickets",
    value: "1",
    delta: "All others resolved",
    icon: SupportIcon,
    accent: "from-sky-400/25 to-emerald-400/10",
  },
];

const myOrders = [
  { id: "#ORD-211", destination: "Casablanca", status: "Delivered", date: "Apr 11, 2026" },
  { id: "#ORD-210", destination: "Rabat", status: "Pending", date: "Apr 11, 2026" },
  { id: "#ORD-209", destination: "Marrakech", status: "Pending", date: "Apr 10, 2026" },
  { id: "#ORD-208", destination: "Tangier", status: "Cancelled", date: "Apr 09, 2026" },
];

function ClientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
  const [user, setUser] = useState(location.state?.user || null);
  const [loadingUser, setLoadingUser] = useState(!location.state?.user);
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
        if (roleName === "admin") {
          navigate("/dashboard-admin", { replace: true });
        }

        return;
      }

      try {
        const profile = await getMe();

        if (active) {
          const profileRole = profile.role_name || profile.role || null;

          if (profileRole === "admin") {
            navigate("/dashboard-admin", { replace: true });
            return;
          }

          setUser(profile);
        }
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
  }, [navigate, roleName, user]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      // Always clear local auth state even if backend logout fails.
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
          isAdmin={false}
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
                  <p className="text-sm font-medium text-slate-400">Client Portal</p>
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Dashboard Client
                  </h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
                  {user ? `${user.name} • Client` : "Loading account..."}
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

              {successMessage && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_20px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl">
                  {successMessage}
                </div>
              )}

              <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-sky-300/70">My Logistics</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                      Track your orders and deliveries
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 px-4 py-3 text-sm text-sky-200">
                    Client updates enabled
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {clientStats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <article
                        key={stat.label}
                        className={`rounded-3xl border border-white/8 bg-gradient-to-br ${stat.accent} p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-sky-300/20`}
                      >
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-300">{stat.label}</p>
                            <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
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

              <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">My Orders</h3>
                    <p className="mt-1 text-sm text-slate-400">Overview of your latest requests and statuses</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                      <thead className="bg-white/[0.03] text-slate-400">
                        <tr>
                          <th className="px-5 py-4 font-medium">ID</th>
                          <th className="px-5 py-4 font-medium">Destination</th>
                          <th className="px-5 py-4 font-medium">Status</th>
                          <th className="px-5 py-4 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {myOrders.map((order) => (
                          <tr key={order.id} className="transition hover:bg-white/[0.03]">
                            <td className="px-5 py-4 font-medium text-white">{order.id}</td>
                            <td className="px-5 py-4 text-slate-300">{order.destination}</td>
                            <td className="px-5 py-4">
                              <StatusPill status={order.status} />
                            </td>
                            <td className="px-5 py-4 text-slate-400">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Delivered: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    Pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    Cancelled: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
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

function InvoicesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 11h5M9.5 14h5M9.5 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SupportIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 20a8 8 0 1 0-8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 12v4a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
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

export default ClientDashboard;
