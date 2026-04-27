import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";
import {
  clearToken,
  getClientNotifications,
  getMe,
  logout as apiLogout,
  markAllClientNotificationsRead,
  markClientNotificationRead,
} from "../services/api";

const notificationsTranslations = {
  en: {
    clientSpace: "Client Space",
    notifications: "Notifications",
    refresh: "Refresh",
    updating: "Updating...",
    markAllRead: "Mark all as read",
    loadingAccount: "Loading account...",
    youHave: "You have",
    unreadNotification: "unread notification",
    unreadNotifications: "unread notifications",
    loadingNotifications: "Loading notifications...",
    noNotifications: "No notifications yet.",
    orderUpdate: "Order update",
    markAsRead: "Mark as read",
    viewOrder: "View order",
    unavailableLoadTitle: "Unable to load notifications",
    unavailableLoadDesc: "Please try again shortly.",
    unavailableUpdateTitle: "Unable to update notification",
    unavailableUpdateDesc: "Please try again.",
    updatedTitle: "Notifications updated",
    updatedDesc: "All notifications are marked as read.",
  },
  fr: {
    clientSpace: "Espace client",
    notifications: "Notifications",
    refresh: "Actualiser",
    updating: "Mise a jour...",
    markAllRead: "Tout marquer comme lu",
    loadingAccount: "Chargement du compte...",
    youHave: "Vous avez",
    unreadNotification: "notification non lue",
    unreadNotifications: "notifications non lues",
    loadingNotifications: "Chargement des notifications...",
    noNotifications: "Aucune notification pour le moment.",
    orderUpdate: "Mise a jour commande",
    markAsRead: "Marquer comme lue",
    viewOrder: "Voir la commande",
    unavailableLoadTitle: "Impossible de charger les notifications",
    unavailableLoadDesc: "Veuillez reessayer dans un instant.",
    unavailableUpdateTitle: "Impossible de mettre a jour la notification",
    unavailableUpdateDesc: "Veuillez reessayer.",
    updatedTitle: "Notifications mises a jour",
    updatedDesc: "Toutes les notifications sont marquees comme lues.",
  },
};

export default function ClientNotifications() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(() => getStoredPreferences());
  const [busyNotificationId, setBusyNotificationId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const theme = preferences.theme === "light" ? "light" : "dark";
  const lang = preferences.lang === "fr" ? "fr" : "en";
  const t = notificationsTranslations[lang];

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

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const payload = await getClientNotifications();
      setNotifications(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      setNotifications([]);
      addToast({
        type: "error",
        title: t.unavailableLoadTitle,
        description: error.message || t.unavailableLoadDesc,
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadNotifications();
  }, [user]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Local logout must always continue.
    } finally {
      clearToken();
      navigate("/", { replace: true });
    }
  };

  const handleMarkOneRead = async (notificationId) => {
    try {
      setBusyNotificationId(notificationId);
      await markClientNotificationRead(notificationId);
      setNotifications((prev) => prev.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item)));
    } catch (error) {
      addToast({
        type: "error",
        title: t.unavailableUpdateTitle,
        description: error.message || t.unavailableUpdateDesc,
      });
    } finally {
      setBusyNotificationId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllClientNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      addToast({
        type: "success",
        title: t.updatedTitle,
        description: t.updatedDesc,
      });
    } catch (error) {
      addToast({
        type: "error",
        title: t.unavailableUpdateTitle,
        description: error.message || t.unavailableUpdateDesc,
      });
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);

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
          clientUnreadCount={unreadCount}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
          <header className={`border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 ${theme === "light" ? "border-slate-200 bg-white/90" : "border-white/5 bg-[#050814]/80"}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{t.clientSpace}</p>
                <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.notifications}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadNotifications}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                >
                  {t.refresh}
                </button>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markingAll || unreadCount === 0}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${theme === "light" ? "border-cyan-300/50 bg-cyan-100 text-cyan-700 hover:bg-cyan-200" : "border-cyan-400/25 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"}`}
                >
                  {markingAll ? t.updating : t.markAllRead}
                </button>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
              {loadingUser && (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-slate-300"}`}>
                  {t.loadingAccount}
                </div>
              )}

              <section className={`rounded-[28px] border p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                <div className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.02]"}`}>
                  <p className={`text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                    {t.youHave} <span className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{unreadCount}</span> {unreadCount === 1 ? t.unreadNotification : t.unreadNotifications}.
                  </p>
                </div>

                {loadingNotifications ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                    {t.loadingNotifications}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                    {t.noNotifications}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((item) => (
                      <article
                        key={item.id}
                        className={`rounded-2xl border p-4 transition ${item.is_read ? "opacity-80" : ""} ${theme === "light" ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.03]"}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className={`text-sm font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{item.title || t.orderUpdate}</p>
                            <p className={`mt-1 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-300"}`}>{item.message}</p>
                            <p className={`mt-2 text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{formatDateTime(item.created_at, lang)}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {!item.is_read && (
                              <button
                                type="button"
                                onClick={() => handleMarkOneRead(item.id)}
                                disabled={busyNotificationId === item.id}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${theme === "light" ? "border-cyan-300/40 bg-cyan-100 text-cyan-700 hover:bg-cyan-200" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"}`}
                              >
                                {busyNotificationId === item.id ? t.updating : t.markAsRead}
                              </button>
                            )}

                            {item.commande_id && (
                              <button
                                type="button"
                                onClick={() => navigate("/client/orders")}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                              >
                                {t.viewOrder}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value, lang = "en") {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
