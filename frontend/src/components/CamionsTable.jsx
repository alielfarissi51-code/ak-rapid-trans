import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function CamionsTable({ camions, onEdit, onDelete }) {
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
            licensePlate: "Matricule",
            brand: "Marque",
            capacity: "Capacite (kg)",
            status: "Statut",
            actions: "Actions",
            edit: "Modifier",
            delete: "Supprimer",
            noTrucks: "Aucun camion",
            available: "Disponible",
            maintenance: "Maintenance",
            unavailable: "Indisponible",
        }
        : {
            licensePlate: "License Plate",
            brand: "Brand",
            capacity: "Capacity (kg)",
            status: "Status",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            noTrucks: "No trucks found",
            available: "Available",
            maintenance: "In Maintenance",
            unavailable: "Unavailable",
        };

    const getStatusBadgeColor = (status) => {
        const colors = {
            disponible: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
            en_maintenance: "border-amber-400/20 bg-amber-400/10 text-amber-300",
            indisponible: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        };
        return colors[status] || "border-white/10 bg-white/5 text-slate-300";
    };

    const formatStatus = (status) => {
        const labels = {
            disponible: t.available,
            en_maintenance: t.maintenance,
            indisponible: t.unavailable,
        };
        return labels[status] || status;
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.licensePlate}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.brand}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.capacity}
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
                    {camions.length > 0 ? (
                        camions.map((camion) => (
                            <tr key={camion.id} className="transition hover:bg-slate-50">
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                                    {camion.matricule}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                    {camion.marque}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                    {camion.capacite.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4">
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeColor(camion.statut)}`}>
                                        {formatStatus(camion.statut)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(camion)}
                                        className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 transition hover:border-sky-300/50 hover:bg-slate-50"
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                        {t.edit}
                                    </button>
                                    <button
                                        onClick={() => onDelete(camion.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                                    >
                                        <DeleteIcon className="h-3.5 w-3.5" />
                                        {t.delete}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                                {t.noTrucks}
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
