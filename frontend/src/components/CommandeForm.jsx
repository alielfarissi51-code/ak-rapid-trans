import { useState, useEffect } from "react";
import { getClients } from "../services/api";
import { getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

export default function CommandeForm({ commande, camions, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        client_id: "",
        camion_id: "",
        lieu_depart: "",
        lieu_arrivee: "",
        date_transport: "",
        prix: "",
        statut: "en_attente",
    });

    const [clients, setClients] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => getStoredPreferences().theme === "light" ? "light" : "dark");

    const statuses = [
        { value: "en_attente", label: "Pending" },
        { value: "validee", label: "Validated" },
        { value: "en_cours", label: "In Progress" },
        { value: "livree", label: "Delivered" },
        { value: "annulee", label: "Cancelled" },
    ];

    useEffect(() => {
        fetchClients();
        if (commande) {
            setFormData({
                client_id: commande.client_id,
                camion_id: commande.camion_id || "",
                lieu_depart: commande.lieu_depart,
                lieu_arrivee: commande.lieu_arrivee,
                date_transport: commande.date_transport,
                prix: commande.prix || "",
                statut: commande.statut || "en_attente",
            });
        }
    }, [commande]);

    useEffect(() => {
        const syncTheme = (event) => {
            const nextTheme = event?.detail?.theme || getStoredPreferences().theme;
            setTheme(nextTheme === "light" ? "light" : "dark");
        };

        window.addEventListener(PREFERENCES_EVENT, syncTheme);

        return () => {
            window.removeEventListener(PREFERENCES_EVENT, syncTheme);
        };
    }, []);

    const fetchClients = async () => {
        try {
            const data = await getClients();
            setClients(data);
        } catch {
            // Silently handle client loading error
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.client_id) newErrors.client_id = "Client is required";
        if (!formData.lieu_depart.trim()) newErrors.lieu_depart = "Departure location is required";
        if (!formData.lieu_arrivee.trim()) newErrors.lieu_arrivee = "Arrival location is required";
        if (!formData.date_transport) newErrors.date_transport = "Transport date is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const submitData = { ...formData };
        if (submitData.prix === "") {
            delete submitData.prix;
        }
        if (submitData.camion_id === "") {
            submitData.camion_id = null;
        }

        onSubmit(submitData);
    };

    if (loading) {
        return (
            <div className={`rounded-2xl border py-10 text-center ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/8 bg-white/[0.02] text-slate-300"}`}>
                Loading form data...
            </div>
        );
    }

    return (
        <div className={`mb-6 rounded-3xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
            <h2 className={`mb-4 text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{commande ? "Edit Order" : "Add New Order"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Client
                        </label>
                        <select
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 focus:outline-none ${
                                errors.client_id
                                    ? "border-rose-500/70"
                                    : theme === "light"
                                        ? "border-slate-200 focus:border-sky-400/50"
                                        : "border-white/10 focus:border-sky-400/40"
                            } ${theme === "light" ? "bg-white text-slate-900" : "bg-white/[0.03] text-slate-100"
                            }`}
                        >
                            <option value="" className="bg-slate-100 text-slate-900">Select Client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id} className="bg-slate-100 text-slate-900">
                                    {client.nom}
                                </option>
                            ))}
                        </select>
                        {errors.client_id && <p className={`mt-1 text-sm ${theme === "light" ? "text-rose-600" : "text-rose-300"}`}>{errors.client_id}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Truck (Optional)
                        </label>
                        <select
                            name="camion_id"
                            value={formData.camion_id}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900 focus:border-sky-400/50" : "border-white/10 bg-white/[0.03] text-slate-100 focus:border-sky-400/40"}`}
                        >
                            <option value="" className="bg-slate-100 text-slate-900">Select Truck</option>
                            {camions.map((camion) => (
                                <option key={camion.id} value={camion.id} className="bg-slate-100 text-slate-900">
                                    {camion.matricule} - {camion.marque}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Departure Location
                        </label>
                        <input
                            type="text"
                            name="lieu_depart"
                            value={formData.lieu_depart}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${
                                errors.lieu_depart
                                    ? "border-rose-500/70"
                                    : theme === "light"
                                        ? "border-slate-200 focus:border-sky-400/50"
                                        : "border-white/10 focus:border-sky-400/40"
                            } ${theme === "light" ? "bg-white text-slate-900" : "bg-white/[0.03] text-slate-100"
                            }`}
                            placeholder="City or address"
                        />
                        {errors.lieu_depart && <p className={`mt-1 text-sm ${theme === "light" ? "text-rose-600" : "text-rose-300"}`}>{errors.lieu_depart}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Arrival Location
                        </label>
                        <input
                            type="text"
                            name="lieu_arrivee"
                            value={formData.lieu_arrivee}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${
                                errors.lieu_arrivee
                                    ? "border-rose-500/70"
                                    : theme === "light"
                                        ? "border-slate-200 focus:border-sky-400/50"
                                        : "border-white/10 focus:border-sky-400/40"
                            } ${theme === "light" ? "bg-white text-slate-900" : "bg-white/[0.03] text-slate-100"
                            }`}
                            placeholder="City or address"
                        />
                        {errors.lieu_arrivee && <p className={`mt-1 text-sm ${theme === "light" ? "text-rose-600" : "text-rose-300"}`}>{errors.lieu_arrivee}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Transport Date
                        </label>
                        <input
                            type="date"
                            name="date_transport"
                            value={formData.date_transport}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 focus:outline-none ${
                                errors.date_transport
                                    ? "border-rose-500/70"
                                    : theme === "light"
                                        ? "border-slate-200 focus:border-sky-400/50"
                                        : "border-white/10 focus:border-sky-400/40"
                            } ${theme === "light" ? "bg-white text-slate-900" : "bg-white/[0.03] text-slate-100"
                            }`}
                        />
                        {errors.date_transport && <p className={`mt-1 text-sm ${theme === "light" ? "text-rose-600" : "text-rose-300"}`}>{errors.date_transport}</p>}
                    </div>

                    <div>
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Price (Optional)
                        </label>
                        <input
                            type="number"
                            name="prix"
                            value={formData.prix}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900 focus:border-sky-400/50" : "border-white/10 bg-white/[0.03] text-slate-100 focus:border-sky-400/40"}`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                            Status
                        </label>
                        <select
                            name="statut"
                            value={formData.statut}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border px-4 py-2.5 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900 focus:border-sky-400/50" : "border-white/10 bg-white/[0.03] text-slate-100 focus:border-sky-400/40"}`}
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value} className="bg-slate-100 text-slate-900">
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <button
                        type="submit"
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme === "light" ? "border-sky-300/50 bg-sky-100 text-sky-700 hover:bg-sky-200" : "border-sky-400/20 bg-sky-500/15 text-sky-100 hover:border-sky-300/40 hover:bg-sky-500/25"}`}
                    >
                        {commande ? "Update Order" : "Create Order"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
