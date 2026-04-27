import { useEffect, useState } from "react";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

function createInitialFormData(client) {
    return {
        nom: client?.nom || "",
        email: client?.email || "",
        telephone: client?.telephone || "",
        adresse: client?.adresse || "",
    };
}

export default function ClientForm({ client, onSubmit, onCancel, isDark = true }) {
    const [formData, setFormData] = useState(() => createInitialFormData(client));
    const [errors, setErrors] = useState({});
    const [lang, setLang] = useState(() => getStoredPreferences().lang || "en");

    useEffect(() => {
        const handler = (event) => {
            setLang(event?.detail?.lang || getStoredPreferences().lang || "en");
        };

        window.addEventListener(PREFERENCES_EVENT, handler);
        return () => window.removeEventListener(PREFERENCES_EVENT, handler);
    }, []);

    const t = lang === "fr"
        ? {
            titleCreate: "Ajouter un client",
            titleEdit: "Modifier le client",
            name: "Nom",
            email: "Email",
            phone: "Téléphone",
            address: "Adresse",
            requiredName: "Le nom est requis",
            requiredEmail: "L'email est requis",
            requiredPhone: "Le téléphone est requis",
            namePlaceholder: "Nom complet",
            emailPlaceholder: "client@exemple.com",
            phonePlaceholder: "Téléphone",
            addressPlaceholder: "Adresse",
            update: "Mettre à jour",
            create: "Créer",
            cancel: "Annuler",
        }
        : {
            titleCreate: "Add New Client",
            titleEdit: "Edit Client",
            name: "Name",
            email: "Email",
            phone: "Phone",
            address: "Address",
            requiredName: "Name is required",
            requiredEmail: "Email is required",
            requiredPhone: "Phone is required",
            namePlaceholder: "Full name",
            emailPlaceholder: "client@example.com",
            phonePlaceholder: "Phone number",
            addressPlaceholder: "Address",
            update: "Update Client",
            create: "Create Client",
            cancel: "Cancel",
        };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const nextErrors = {};

        if (!formData.nom.trim()) nextErrors.nom = t.requiredName;
        if (!formData.email.trim()) nextErrors.email = t.requiredEmail;
        if (!formData.telephone.trim()) nextErrors.telephone = t.requiredPhone;

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className={`mb-6 rounded-3xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
            <h2 className={`mb-4 text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{client ? t.titleEdit : t.titleCreate}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {t.name}
                        </label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${errors.nom ? "border-rose-500/70" : isDark ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-sky-400/40" : "border-slate-200 bg-white text-slate-900 focus:border-sky-400"}`}
                            placeholder={t.namePlaceholder}
                        />
                        {errors.nom && <p className="mt-1 text-sm text-rose-400">{errors.nom}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {t.email}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${errors.email ? "border-rose-500/70" : isDark ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-sky-400/40" : "border-slate-200 bg-white text-slate-900 focus:border-sky-400"}`}
                            placeholder={t.emailPlaceholder}
                        />
                        {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {t.phone}
                        </label>
                        <input
                            type="text"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${errors.telephone ? "border-rose-500/70" : isDark ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-sky-400/40" : "border-slate-200 bg-white text-slate-900 focus:border-sky-400"}`}
                            placeholder={t.phonePlaceholder}
                        />
                        {errors.telephone && <p className="mt-1 text-sm text-rose-400">{errors.telephone}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {t.address}
                        </label>
                        <input
                            type="text"
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${isDark ? "border-slate-600 bg-slate-700 text-slate-100 focus:border-sky-400/40" : "border-slate-200 bg-white text-slate-900 focus:border-sky-400"}`}
                            placeholder={t.addressPlaceholder}
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <button
                        type="submit"
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${isDark ? "border-sky-400/20 bg-sky-500/15 text-sky-100 hover:border-sky-300/40 hover:bg-sky-500/25" : "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 hover:border-sky-300 hover:from-sky-100 hover:to-cyan-100"}`}
                    >
                        {client ? t.update : t.create}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${isDark ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                    >
                        {t.cancel}
                    </button>
                </div>
            </form>
        </div>
    );
}