import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAdminUnreadNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
} from "../services/api";

const POLL_INTERVAL_MS = 45_000;

export default function AdminNotificationPopup({ theme = "dark" }) {
    const [notifications, setNotifications] = useState([]);
    const [visible, setVisible] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [panelOpen, setPanelOpen] = useState(false);
    const seenIds = useRef(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;

        const run = async () => {
            try {
                const res = await getAdminUnreadNotifications();
                if (!active) return;
                const items = res?.data ?? [];
                setUnreadCount(items.length);
                setNotifications(items);
                const newItems = items.filter((n) => !seenIds.current.has(n.id));
                if (newItems.length > 0) {
                    newItems.forEach((n) => seenIds.current.add(n.id));
                    setVisible((prev) => {
                        const existingIds = new Set(prev.map((v) => v.id));
                        return [...prev, ...newItems.filter((n) => !existingIds.has(n.id))];
                    });
                }
            } catch {
                // Silently ignore — admin may not be authenticated yet
            }
        };

        run();
        const id = setInterval(run, POLL_INTERVAL_MS);
        return () => {
            active = false;
            clearInterval(id);
        };
    }, []);

    const dismissPopup = useCallback((id) => {
        setVisible((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const handleMarkRead = useCallback(async (id) => {
        try {
            await markAdminNotificationRead(id);
        } catch {
            // ignore
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((c) => Math.max(0, c - 1));
        dismissPopup(id);
    }, [dismissPopup]);

    const handleViewOrder = useCallback(async (notification) => {
        try {
            await markAdminNotificationRead(notification.id);
        } catch {
            // ignore
        }
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        setUnreadCount((c) => Math.max(0, c - 1));
        dismissPopup(notification.id);
        navigate("/admin/commandes");
    }, [dismissPopup, navigate]);

    const handleMarkAllRead = useCallback(async () => {
        try {
            await markAllAdminNotificationsRead();
        } catch {
            // ignore
        }
        setNotifications([]);
        setUnreadCount(0);
        setVisible([]);
        seenIds.current.clear();
        setPanelOpen(false);
    }, []);

    const isDark = theme !== "light";

    const panelBg = isDark
        ? "border-slate-700 bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        : "border-slate-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]";
    const itemBg = isDark
        ? "border-slate-700/60 bg-slate-800/60"
        : "border-slate-200 bg-slate-50";
    const textPrimary = isDark ? "text-white" : "text-slate-900";
    const textSecondary = isDark ? "text-slate-300" : "text-slate-600";
    const textMuted = isDark ? "text-slate-400" : "text-slate-500";
    const btnViewOrder = isDark
        ? "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
        : "border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100";
    const btnMarkRead = isDark
        ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50";
    const closeBtnCls = isDark
        ? "text-slate-400 hover:text-slate-200"
        : "text-slate-400 hover:text-slate-700";
    const bellActiveCls = isDark
        ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
        : "border-sky-400/50 bg-sky-50 text-sky-600";
    const bellIdleCls = isDark
        ? "border-white/10 bg-white/5 text-slate-300 hover:border-sky-400/30 hover:bg-sky-500/10 hover:text-sky-300"
        : "border-slate-200 bg-white text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600";
    const dividerCls = isDark ? "border-slate-700" : "border-slate-200";

    return (
        <>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setPanelOpen((o) => !o)}
                    className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${unreadCount > 0 ? bellActiveCls : bellIdleCls}`}
                    aria-label="Notifications admin"
                >
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-950">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {panelOpen && (
                    <div className={`absolute right-0 top-14 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl border ${panelBg}`}>
                        <div className={`flex items-center justify-between border-b px-4 py-3 ${dividerCls}`}>
                            <p className={`text-sm font-semibold ${textPrimary}`}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-400">
                                        {unreadCount} non lu{unreadCount > 1 ? "es" : "e"}
                                    </span>
                                )}
                            </p>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className={`text-xs font-medium transition ${isDark ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-700"}`}
                                    >
                                        Tout marquer
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(false)}
                                    className={`transition ${closeBtnCls}`}
                                    aria-label="Fermer"
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className={`px-4 py-6 text-center text-sm ${textMuted}`}>
                                    Aucune notification non lue
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1 p-2">
                                    {notifications.map((n) => (
                                        <PanelItem
                                            key={n.id}
                                            notification={n}
                                            itemBg={itemBg}
                                            textPrimary={textPrimary}
                                            textSecondary={textSecondary}
                                            textMuted={textMuted}
                                            btnViewOrder={btnViewOrder}
                                            btnMarkRead={btnMarkRead}
                                            onView={() => { setPanelOpen(false); handleViewOrder(n); }}
                                            onMarkRead={() => handleMarkRead(n.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(92vw,380px)] flex-col gap-3 sm:right-6">
                {visible.map((n) => (
                    <PopupToast
                        key={n.id}
                        notification={n}
                        theme={theme}
                        onDismiss={() => dismissPopup(n.id)}
                        onMarkRead={() => handleMarkRead(n.id)}
                        onView={() => handleViewOrder(n)}
                    />
                ))}
            </div>
        </>
    );
}

function PanelItem({ notification: n, textPrimary, textSecondary, textMuted, itemBg, btnViewOrder, btnMarkRead, onView, onMarkRead }) {
    return (
        <div className={`rounded-xl border p-3 ${itemBg}`}>
            <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                    <OrderIcon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${textPrimary}`}>{n.title}</p>
                    {n.client_name && (
                        <p className={`text-xs ${textSecondary}`}>Client&nbsp;: {n.client_name}</p>
                    )}
                    <p className={`mt-0.5 text-xs ${textMuted}`}>{formatRelativeTime(n.created_at)}</p>
                </div>
            </div>
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={onView}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${btnViewOrder}`}
                >
                    Voir la commande
                </button>
                <button
                    type="button"
                    onClick={onMarkRead}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${btnMarkRead}`}
                >
                    Lu
                </button>
            </div>
        </div>
    );
}

function PopupToast({ notification: n, theme, onDismiss, onMarkRead, onView }) {
    const [entered, setEntered] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const timerRef = useRef(null);
    const isDark = theme !== "light";

    const triggerLeave = useCallback(() => {
        clearTimeout(timerRef.current);
        setLeaving(true);
        setTimeout(onDismiss, 300);
    }, [onDismiss]);

    useEffect(() => {
        requestAnimationFrame(() => setEntered(true));
        timerRef.current = setTimeout(triggerLeave, 8000);
        return () => clearTimeout(timerRef.current);
    }, [triggerLeave]);

    const panel = isDark
        ? "border-sky-400/20 bg-slate-900/95 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        : "border-sky-300/60 bg-white text-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.12)]";
    const btnView = isDark
        ? "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
        : "border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100";
    const btnRead = isDark
        ? "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50";
    const closeCls = isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-700";
    const subText = isDark ? "text-slate-300" : "text-slate-600";
    const mutedText = isDark ? "text-slate-400" : "text-slate-500";

    return (
        <article
            className={`pointer-events-auto overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ease-out ${panel} ${leaving ? "translate-x-4 opacity-0" : entered ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
            role="status"
            aria-live="polite"
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                        <OrderIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{n.title}</p>
                        {n.client_name && (
                            <p className={`text-xs ${subText}`}>Client&nbsp;: {n.client_name}</p>
                        )}
                        <p className={`mt-0.5 text-xs ${mutedText}`}>{n.message}</p>
                    </div>
                    <button
                        type="button"
                        onClick={triggerLeave}
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${closeCls}`}
                        aria-label="Fermer"
                    >
                        <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => { triggerLeave(); onView(); }}
                        className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${btnView}`}
                    >
                        Voir la commande
                    </button>
                    <button
                        type="button"
                        onClick={() => { triggerLeave(); onMarkRead(); }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${btnRead}`}
                    >
                        Marquer comme lu
                    </button>
                </div>
            </div>
        </article>
    );
}

function formatRelativeTime(dateString) {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    return `Il y a ${Math.floor(hours / 24)} j`;
}

function BellIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M6 10a6 6 0 0 1 12 0c0 3.5 1.5 5 2 6H4c.5-1 2-2.5 2-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function OrderIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 6h14l-1 12H6L5 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
