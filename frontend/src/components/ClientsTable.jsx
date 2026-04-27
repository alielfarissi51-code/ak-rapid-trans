import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function ClientsTable({ clients, onEdit, onDelete }) {
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
            name: "Nom",
            email: "Email",
            phone: "Téléphone",
            address: "Adresse",
            actions: "Actions",
            edit: "Modifier",
            delete: "Supprimer",
            noClients: "Aucun client",
            na: "N/A",
        }
        : {
            name: "Name",
            email: "Email",
            phone: "Phone",
            address: "Address",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            noClients: "No clients found",
            na: "N/A",
        };

    return (
        <div className="clients-table-shell overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(2,6,23,0.08)]">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50 text-slate-600">
                    <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">{t.name}</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">{t.email}</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">{t.phone}</th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">{t.address}</th>
                        <th className="w-[160px] px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">{t.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length > 0 ? (
                        clients.map((client) => (
                            <tr key={client.id} className="clients-table-row border-b border-slate-200/80 transition duration-200 odd:bg-slate-50 hover:bg-sky-50">
                                <td className="whitespace-nowrap px-5 py-4.5 font-semibold text-slate-900">{client.nom || t.na}</td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">{client.email || t.na}</td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">{client.telephone || t.na}</td>
                                <td className="max-w-[280px] truncate px-5 py-4.5 text-slate-600">{client.adresse || t.na}</td>
                                <td className="w-[160px] whitespace-nowrap px-5 py-4.5 text-sm font-medium">
                                    <div className="clients-action-group inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                        <button
                                            onClick={() => onEdit(client)}
                                            className="clients-icon-btn clients-icon-btn--edit inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition duration-200 hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                                            aria-label={t.edit}
                                            title={t.edit}
                                            type="button"
                                        >
                                            <EditIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(client.id)}
                                            className="clients-icon-btn clients-icon-btn--delete inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition duration-200 hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                                            aria-label={t.delete}
                                            title={t.delete}
                                            type="button"
                                        >
                                            <DeleteIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                {t.noClients}
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