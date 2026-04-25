import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const ToastContext = createContext(null);

const DARK_TOAST_VARIANTS = {
    success: {
        icon: SuccessIcon,
        panel: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100 shadow-[0_14px_40px_rgba(16,185,129,0.18)]",
        iconWrap: "bg-emerald-400/20 text-emerald-300",
        title: "Success",
    },
    error: {
        icon: ErrorIcon,
        panel: "border-rose-400/25 bg-rose-500/10 text-rose-100 shadow-[0_14px_40px_rgba(244,63,94,0.18)]",
        iconWrap: "bg-rose-400/20 text-rose-300",
        title: "Error",
    },
    warning: {
        icon: WarningIcon,
        panel: "border-amber-400/25 bg-amber-500/10 text-amber-100 shadow-[0_14px_40px_rgba(245,158,11,0.18)]",
        iconWrap: "bg-amber-400/20 text-amber-300",
        title: "Warning",
    },
    info: {
        icon: InfoIcon,
        panel: "border-sky-400/25 bg-sky-500/10 text-sky-100 shadow-[0_14px_40px_rgba(14,165,233,0.18)]",
        iconWrap: "bg-sky-400/20 text-sky-300",
        title: "Info",
    },
};

const LIGHT_TOAST_VARIANTS = {
    success: {
        icon: SuccessIcon,
        panel: "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-[0_14px_40px_rgba(16,185,129,0.14)]",
        iconWrap: "bg-emerald-200 text-emerald-700",
        title: "Success",
    },
    error: {
        icon: ErrorIcon,
        panel: "border-rose-300 bg-rose-100 text-rose-800 shadow-[0_14px_40px_rgba(244,63,94,0.14)]",
        iconWrap: "bg-rose-200 text-rose-700",
        title: "Error",
    },
    warning: {
        icon: WarningIcon,
        panel: "border-amber-300 bg-amber-100 text-amber-800 shadow-[0_14px_40px_rgba(245,158,11,0.14)]",
        iconWrap: "bg-amber-200 text-amber-700",
        title: "Warning",
    },
    info: {
        icon: InfoIcon,
        panel: "border-sky-300 bg-sky-100 text-sky-800 shadow-[0_14px_40px_rgba(14,165,233,0.14)]",
        iconWrap: "bg-sky-200 text-sky-700",
        title: "Info",
    },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [theme, setTheme] = useState(() => getStoredPreferences().theme === "light" ? "light" : "dark");
    const timeoutMapRef = useRef(new Map());

    useEffect(() => {
        const handlePreferencesChanged = (event) => {
            const nextTheme = event?.detail?.theme || getStoredPreferences().theme;
            setTheme(nextTheme === "light" ? "light" : "dark");
        };

        window.addEventListener(PREFERENCES_EVENT, handlePreferencesChanged);

        return () => {
            window.removeEventListener(PREFERENCES_EVENT, handlePreferencesChanged);
        };
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        const timeoutId = timeoutMapRef.current.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutMapRef.current.delete(id);
        }
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.map((toast) => (
            toast.id === id ? { ...toast, leaving: true } : toast
        )));

        window.setTimeout(() => {
            removeToast(id);
        }, 220);
    }, [removeToast]);

    const addToast = useCallback((toast) => {
        const {
            type = "info",
            title,
            description = "",
            duration = 3600,
        } = toast || {};

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const variants = theme === "light" ? LIGHT_TOAST_VARIANTS : DARK_TOAST_VARIANTS;
        const resolvedVariant = variants[type] ? type : "info";
        const resolvedTitle = title || variants[resolvedVariant].title;

        setToasts((prev) => [
            ...prev,
            {
                id,
                type: resolvedVariant,
                title: resolvedTitle,
                description,
                entered: false,
                leaving: false,
            },
        ]);

        window.requestAnimationFrame(() => {
            setToasts((prev) => prev.map((item) => (
                item.id === id ? { ...item, entered: true } : item
            )));
        });

        if (duration > 0) {
            const timeoutId = window.setTimeout(() => {
                dismissToast(id);
            }, duration);
            timeoutMapRef.current.set(id, timeoutId);
        }

        return id;
    }, [dismissToast, theme]);

    useEffect(() => () => {
        timeoutMapRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
        timeoutMapRef.current.clear();
    }, []);

    const value = useMemo(() => ({
        addToast,
        dismissToast,
    }), [addToast, dismissToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onClose={dismissToast} theme={theme} />
        </ToastContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

function ToastViewport({ toasts, onClose, theme }) {
    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(92vw,380px)] flex-col gap-3 sm:right-6 sm:top-6">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={onClose} theme={theme} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose, theme }) {
    const variants = theme === "light" ? LIGHT_TOAST_VARIANTS : DARK_TOAST_VARIANTS;
    const variant = variants[toast.type] || variants.info;
    const Icon = variant.icon;

    return (
        <article
            className={`pointer-events-auto overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all duration-500 ease-out ${variant.panel} ${toast.leaving ? "translate-y-1 opacity-0" : toast.entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${variant.iconWrap}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-[0.01em]">{toast.title}</p>
                    {toast.description && (
                        <p className={`mt-1 text-xs ${theme === "light" ? "text-slate-700" : "text-slate-200/85"}`}>{toast.description}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onClose(toast.id)}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 ${theme === "light" ? "border-slate-300 bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300" : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10 hover:text-white focus-visible:ring-slate-300/40"}`}
                    aria-label="Close notification"
                >
                    <CloseIcon className="h-3.5 w-3.5" />
                </button>
            </div>
        </article>
    );
}

function SuccessIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ErrorIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 8v4m0 4h.01M10.3 3.8 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function WarningIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 8v5m0 3h.01m-8.9 1h17.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0L1.4 16a2 2 0 0 0 1.7 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function InfoIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 16v-5m0-3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
