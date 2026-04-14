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
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#0b1324]/70 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.name}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.email}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.role}
                        </th>
                        <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider">
                            {t.actions}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="transition hover:bg-white/[0.03]">
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-white">
                                    {user.name}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                                    <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-300">
                                        {user.role?.name || t.na}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-500/10 px-2.5 py-1 text-sky-200 transition hover:bg-sky-500/20"
                                    >
                                        <EditIcon className="h-3.5 w-3.5" />
                                        {t.edit}
                                    </button>
                                    <button
                                        onClick={() => onDelete(user.id)}
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
                            <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
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
