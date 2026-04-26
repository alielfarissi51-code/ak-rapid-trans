import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function CommandesTable({
    commandes,
    onEdit,
    onDelete,
    onViewStatusLogs,
    onGenerateFacture,
    onDownloadFacture,
    factureLoadingId = null,
}) {
    const [lang, setLang] = useState(() => getStoredPreferences().lang || "en");

    useEffect(() => {
        const handlePreferencesChanged = (event) => {
            const nextLang = event?.detail?.lang || getStoredPreferences().lang || "en";
            setLang(nextLang);
        };

        window.addEventListener(PREFERENCES_EVENT, handlePreferencesChanged);
        return () => window.removeEventListener(PREFERENCES_EVENT, handlePreferencesChanged);
    }, []);

    const t = lang === "fr"
        ? {
            orderId: "ID commande",
            client: "Client",
            truck: "Camion",
            route: "Trajet",
            date: "Date",
            price: "Prix",
            status: "Statut",
            actions: "Actions",
            facture: "Facture",
            generateFacture: "Generer facture",
            regenerateFacture: "Regenerer facture",
            factureGenerated: "Facture generee",
            factureOutdated: "Facture a regenerer",
            downloadFacture: "Telecharger",
            generatingFacture: "Generation...",
            regeneratingFacture: "Regeneration...",
            downloadingFacture: "Telechargement...",
            invoiceAfterValidation: "Facture disponible apres validation",
            logs: "Logs",
            notAssigned: "Non assigne",
            edit: "Modifier",
            delete: "Supprimer",
            noOrders: "Aucune commande",
            pending: "En attente",
            validated: "Validee",
            inProgress: "En cours",
            delivered: "Livree",
            cancelled: "Annulee",
            na: "N/A",
        }
        : {
            orderId: "Order ID",
            client: "Client",
            truck: "Truck",
            route: "Route",
            date: "Date",
            price: "Price",
            status: "Status",
            actions: "Actions",
            facture: "Invoice",
            generateFacture: "Generate invoice",
            regenerateFacture: "Regenerate invoice",
            factureGenerated: "Invoice generated",
            factureOutdated: "Invoice outdated",
            downloadFacture: "Download",
            generatingFacture: "Generating...",
            regeneratingFacture: "Regenerating...",
            downloadingFacture: "Downloading...",
            invoiceAfterValidation: "Invoice available after validation",
            logs: "Logs",
            notAssigned: "Not assigned",
            edit: "Edit",
            delete: "Delete",
            noOrders: "No orders found",
            pending: "Pending",
            validated: "Validated",
            inProgress: "In Progress",
            delivered: "Delivered",
            cancelled: "Cancelled",
            na: "N/A",
        };

    const getStatusBadgeColor = (status) => {
        const colors = {
            en_attente: "bg-orange-100 text-orange-700",
            validee: "bg-blue-100 text-blue-700",
            en_cours: "bg-yellow-100 text-yellow-700",
            livree: "bg-green-100 text-green-700",
            annulee: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-slate-100 text-slate-700";
    };

    const formatStatus = (status) => {
        const labels = {
            en_attente: t.pending,
            validee: t.validated,
            en_cours: t.inProgress,
            livree: t.delivered,
            annulee: t.cancelled,
        };
        return labels[status] || status;
    };

    return (
        <div className="orders-table-shell overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(2,6,23,0.08)]">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 text-slate-600">
                    <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.orderId}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.client}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.truck}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.route}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.date}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.price}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.status}
                        </th>
                        <th className="w-[310px] px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.actions}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {commandes.length > 0 ? (
                        commandes.map((commande) => (
                            (() => {
                                const factureExists = commande.facture_exists ?? Boolean(commande.facture_path);
                                const factureOutdated = commande.facture_outdated ?? false;

                                return (
                            <tr key={commande.id} className="orders-table-row border-b border-slate-200/80 transition duration-200 odd:bg-slate-50 hover:bg-sky-50">
                                <td className="whitespace-nowrap px-5 py-4.5 font-semibold text-slate-900">
                                    #{commande.id}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {commande.client?.nom || t.na}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {commande.camion?.matricule || t.notAssigned}
                                </td>
                                <td className="px-5 py-4.5 text-slate-600">
                                    {commande.lieu_depart} → {commande.lieu_arrivee}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {new Date(commande.date_transport).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 font-medium text-slate-600">
                                    {commande.prix ? (
                                        <>DHS {parseFloat(commande.prix).toLocaleString()}</>
                                    ) : (
                                        t.na
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
                                            commande.statut
                                        )}`}
                                    >
                                        {formatStatus(commande.statut)}
                                    </span>
                                </td>
                                <td className="w-[310px] px-5 py-4.5 text-sm font-medium">
                                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                                        <div className="orders-action-group inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                            {commande.statut !== "validee" ? (
                                                <span
                                                    className="orders-icon-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400"
                                                    aria-label={t.invoiceAfterValidation}
                                                    title={t.invoiceAfterValidation}
                                                >
                                                    <HourglassIcon className="h-4 w-4" />
                                                </span>
                                            ) : !factureExists ? (
                                                <button
                                                    onClick={() => onGenerateFacture?.(commande, false)}
                                                    className="orders-icon-btn orders-icon-btn--invoice inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 transition duration-200 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                                                    type="button"
                                                    disabled={factureLoadingId === commande.id}
                                                    aria-label={factureLoadingId === commande.id ? t.generatingFacture : t.generateFacture}
                                                    title={factureLoadingId === commande.id ? t.generatingFacture : t.generateFacture}
                                                >
                                                    <FactureIcon className="h-4 w-4" />
                                                </button>
                                            ) : factureOutdated ? (
                                                <>
                                                    <span
                                                        className="orders-icon-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700"
                                                        aria-label={t.factureOutdated}
                                                        title={t.factureOutdated}
                                                    >
                                                        <AlertIcon className="h-4 w-4" />
                                                    </span>
                                                    <button
                                                        onClick={() => onGenerateFacture?.(commande, true)}
                                                        className="orders-icon-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-700 transition duration-200 hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                                                        type="button"
                                                        disabled={factureLoadingId === commande.id}
                                                        aria-label={factureLoadingId === commande.id ? t.regeneratingFacture : t.regenerateFacture}
                                                        title={factureLoadingId === commande.id ? t.regeneratingFacture : t.regenerateFacture}
                                                    >
                                                        <RefreshIcon className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        className="orders-icon-btn orders-icon-btn--invoice inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        aria-label={t.factureGenerated}
                                                        title={t.factureGenerated}
                                                    >
                                                        <CheckIcon className="h-4 w-4" />
                                                    </span>
                                                    <button
                                                        onClick={() => onDownloadFacture?.(commande)}
                                                        className="orders-icon-btn orders-icon-btn--download inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-200 bg-white text-cyan-700 transition duration-200 hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                                                        type="button"
                                                        disabled={factureLoadingId === commande.id}
                                                        aria-label={factureLoadingId === commande.id ? t.downloadingFacture : t.downloadFacture}
                                                        title={factureLoadingId === commande.id ? t.downloadingFacture : t.downloadFacture}
                                                    >
                                                        <DownloadIcon className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="orders-action-group inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                            <button
                                                onClick={() => onViewStatusLogs?.(commande)}
                                                className="orders-icon-btn orders-icon-btn--logs inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-white text-slate-700 transition duration-200 hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                                                aria-label={t.logs}
                                                title={t.logs}
                                                type="button"
                                            >
                                                <LogsIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(commande)}
                                                className="orders-icon-btn orders-icon-btn--edit inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition duration-200 hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                                                aria-label={t.edit}
                                                title={t.edit}
                                                type="button"
                                            >
                                                <EditIcon className="h-[1.05rem] w-[1.05rem]" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(commande.id)}
                                                className="orders-icon-btn orders-icon-btn--delete inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition duration-200 hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                                                aria-label={t.delete}
                                                title={t.delete}
                                                type="button"
                                            >
                                                <DeleteIcon className="h-[1.05rem] w-[1.05rem]" />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                                );
                            })()
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-5 py-10 text-center text-slate-500">
                                {t.noOrders}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function EditIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="m12.5 7.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function DeleteIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function LogsIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M6 6h12M6 12h12M6 18h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function FactureIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M7 3h7l5 5v13H7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    );
}

function DownloadIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function HourglassIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M7 3h10M7 21h10M8 3c0 4 3 5 4 6-1 1-4 2-4 6M16 3c0 4-3 5-4 6 1 1 4 2 4 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function AlertIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="m12 4 8 14H4L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
    );
}

function RefreshIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
