import { useNavigate, useLocation } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Orders", path: "/admin/commandes", icon: OrdersIcon },
  { label: "Users", path: "/admin/users", icon: ClientsIcon },
  { label: "Trucks", path: "/admin/camions", icon: VehiclesIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

function Sidebar({ mobileOpen = false, onClose = () => {}, user, isAdmin = false, onLogout = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-white/10 bg-[#08111f]/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col px-5 py-6">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
                <span className="text-sm font-black tracking-[0.2em] text-white">AR</span>
              </div>
              <div className="mt-4">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  AK Rapid Trans
                </h1>
                <p className="text-xs text-slate-400">Logistics control center</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
                  const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.label}
                  type="button"
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                      ? "bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-white shadow-[0_0_0_1px_rgba(56,189,248,0.2)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                          isActive
                        ? "bg-sky-500/15 text-sky-300"
                        : "bg-white/5 text-slate-400 group-hover:bg-sky-500/10 group-hover:text-sky-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                      {isActive && (
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-semibold text-white">
                {(user?.name || "AK").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "Guest User"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {isAdmin ? "Administrator" : user?.role_name || user?.role ? "Client" : "Operations Manager"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0d1728] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
            >
              <LogoutIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}

function DashboardIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 13.5V20h6v-6.5H4Zm10 0V20h6v-6.5h-6ZM4 4v6.5h6V4H4Zm10 0v6.5h6V4h-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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

function ClientsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 13a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19 19c0-1.7-1.1-3.1-2.7-3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DeliveriesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 7h11v10H3V7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 10h4l3 3v4h-7v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function VehiclesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 13h18l-2-5H5l-2 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 13v4h12v-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7.5 17.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor" />
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

function SettingsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.4 13.5a7.8 7.8 0 0 0 .1-1.5 7.8 7.8 0 0 0-.1-1.5l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.6-1.5L14 2h-4l-.4 2.6a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5A7.8 7.8 0 0 0 4.6 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.6 1.5L10 22h4l.4-2.6a8 8 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 12H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default Sidebar;