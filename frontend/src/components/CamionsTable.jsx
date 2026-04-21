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
            disponible: "border-emerald-200 bg-emerald-50 text-emerald-700",
            en_maintenance: "border-amber-200 bg-amber-50 text-amber-700",
            indisponible: "border-rose-200 bg-rose-50 text-rose-700",
        };
        return colors[status] || "border-slate-200 bg-slate-50 text-slate-700";
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
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.05)]">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 text-slate-600">
                    <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.licensePlate}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.brand}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.capacity}
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
                    {camions.length > 0 ? (
                        camions.map((camion) => (
                            <tr key={camion.id} className="border-b border-slate-200/70 bg-transparent transition duration-200 hover:scale-[1.002] hover:bg-slate-50">
                                <td className="whitespace-nowrap px-5 py-4.5 font-semibold text-slate-900">
                                    {camion.matricule}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {camion.marque}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {camion.capacite.toLocaleString()}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5">
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeColor(camion.statut)}`}>
                                        {formatStatus(camion.statut)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(camion)}
                                        className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-transparent text-blue-600 transition duration-200 hover:scale-105 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                                        aria-label={t.edit}
                                        title={t.edit}
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(camion.id)}
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
                            <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
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
