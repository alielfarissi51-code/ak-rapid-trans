import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function UsersTable({ users, onEdit, onDelete }) {
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
            role: "Role",
            actions: "Actions",
            edit: "Modifier",
            delete: "Supprimer",
            noUsers: "Aucun utilisateur",
            na: "N/A",
        }
        : {
            name: "Name",
            email: "Email",
            role: "Role",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            noUsers: "No users found",
            na: "N/A",
        };

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.05)]">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 text-slate-600">
                    <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.name}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.email}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.role}
                        </th>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.1em]">
                            {t.actions}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="border-b border-slate-200/70 bg-transparent transition duration-200 hover:scale-[1.002] hover:bg-slate-50">
                                <td className="whitespace-nowrap px-5 py-4.5 font-semibold text-slate-900">
                                    {user.name}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-slate-600">
                                    <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                                        {user.role?.name || t.na}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4.5 text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-transparent text-blue-600 transition duration-200 hover:scale-105 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                                        aria-label={t.edit}
                                        title={t.edit}
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(user.id)}
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
                            <td colSpan="4" className="px-5 py-10 text-center text-slate-500">
                                {t.noUsers}
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
