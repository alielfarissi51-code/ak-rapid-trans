import { useEffect } from "react";

export default function DeleteConfirmationModal({
    open,
    isDark,
    title,
    message,
    hint,
    itemLabel,
    cancelLabel,
    confirmLabel,
    onCancel,
    onConfirm,
}) {
    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCancel?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onCancel]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <button
                type="button"
                className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-[2px]"
                aria-label={cancelLabel}
                onClick={onCancel}
            />
            <div
                className={`relative w-full max-w-md overflow-hidden rounded-3xl border shadow-[0_30px_80px_rgba(15,23,42,0.28)] ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-confirmation-title"
                aria-describedby="delete-confirmation-description"
            >
                <div className={`flex items-start gap-4 border-b p-6 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                        <TrashIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 id="delete-confirmation-title" className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                            {title}
                        </h2>
                        <p id="delete-confirmation-description" className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {message}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-amber-400/20 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                        <span className="font-semibold">{itemLabel}</span>
                        {hint ? <span className="ml-1">{hint}</span> : null}
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${isDark ? "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-300 bg-rose-600 px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(225,29,72,0.25)] transition duration-200 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrashIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}