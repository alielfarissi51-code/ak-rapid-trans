import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function CommandesTable({ commandes, onEdit, onDelete, onViewStatusLogs }) {
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
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.05)]">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 text-slate-600">
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
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.actions}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {commandes.length > 0 ? (
                        commandes.map((commande) => (
                            <tr key={commande.id} className="border-b border-slate-200/70 bg-transparent transition duration-200 hover:scale-[1.002] hover:bg-slate-50">
                                <td className="whitespace-nowrap px-5 py-4.5 font-semibold text-slate-900">
                                    #{commande.id}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {commande.client?.nom || t.na}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {commande.camion?.matricule || t.notAssigned}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
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
                                <td className="whitespace-nowrap px-5 py-4.5 text-sm font-medium">
                                    <button
                                        onClick={() => onViewStatusLogs?.(commande)}
                                        className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-transparent text-slate-700 transition duration-200 hover:scale-105 hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                                        aria-label={t.logs}
                                        title={t.logs}
                                        type="button"
                                    >
                                        <LogsIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(commande)}
                                        className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-transparent text-blue-600 transition duration-200 hover:scale-105 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                                        aria-label={t.edit}
                                        title={t.edit}
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(commande.id)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-transparent text-red-600 transition duration-200 hover:scale-105 hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                                        aria-label={t.delete}
                                        title={t.delete}
                                    >
                                        <DeleteIcon className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                            </tr>
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
            <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="m12.5 7.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function DeleteIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
