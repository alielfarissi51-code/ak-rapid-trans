import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function CommandesTable({ commandes, onEdit, onDelete }) {
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
            en_attente: "border-amber-400/20 bg-amber-400/10 text-amber-300",
            validee: "border-blue-400/20 bg-blue-400/10 text-blue-300",
            en_cours: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
            livree: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
            annulee: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        };
        return colors[status] || "border-white/10 bg-white/5 text-slate-300";
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
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.orderId}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.client}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.truck}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.route}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.date}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.price}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.status}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.actions}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {commandes.length > 0 ? (
                        commandes.map((commande) => (
                            <tr key={commande.id} className="transition hover:bg-white/[0.03]">
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-white">
                                    #{commande.id}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.client?.nom || t.na}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.camion?.matricule || t.notAssigned}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.lieu_depart} → {commande.lieu_arrivee}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                                    {new Date(commande.date_transport).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {commande.prix ? (
                                        <>DZD {parseFloat(commande.prix).toLocaleString()}</>
                                    ) : (
                                        t.na
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(
                                            commande.statut
                                        )}`}
                                    >
                                        {formatStatus(commande.statut)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(commande)}
                                        className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-500/10 px-2.5 py-1 text-sky-200 transition hover:bg-sky-500/20"
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                        {t.edit}
                                    </button>
                                    <button
                                        onClick={() => onDelete(commande.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2.5 py-1 text-rose-200 transition hover:bg-rose-500/20"
                                    >
                                        <DeleteIcon className="h-3.5 w-3.5" />
                                        {t.delete}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-5 py-8 text-center text-slate-400">
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
