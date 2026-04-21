import { useState, useEffect } from "react";

export default function CamionForm({ camion, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        matricule: "",
        marque: "",
        capacite: "",
        statut: "disponible",
    });

    const [errors, setErrors] = useState({});

    const statuses = [
        { value: "disponible", label: "Available" },
        { value: "en_maintenance", label: "In Maintenance" },
        { value: "indisponible", label: "Unavailable" },
    ];

    useEffect(() => {
        if (camion) {
            setFormData({
                matricule: camion.matricule,
                marque: camion.marque,
                capacite: camion.capacite,
                statut: camion.statut || "disponible",
            });
        }
    }, [camion]);

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

        if (!formData.matricule.trim()) newErrors.matricule = "License plate is required";
        if (!formData.marque.trim()) newErrors.marque = "Brand is required";
        if (!formData.capacite || formData.capacite <= 0) newErrors.capacite = "Valid capacity is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="mb-6 rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <h2 className="mb-4 text-xl font-semibold text-white">{camion ? "Edit Truck" : "Add New Truck"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            License Plate
                        </label>
                        <input
                            type="text"
                            name="matricule"
                            value={formData.matricule}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                                errors.matricule ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                            placeholder="ABC-1234"
                        />
                        {errors.matricule && <p className="mt-1 text-sm text-rose-300">{errors.matricule}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Brand
                        </label>
                        <input
                            type="text"
                            name="marque"
                            value={formData.marque}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                                errors.marque ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                            placeholder="Volvo, Scania, etc."
                        />
                        {errors.marque && <p className="mt-1 text-sm text-rose-300">{errors.marque}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Capacity (kg)
                        </label>
                        <input
                            type="number"
                            name="capacite"
                            value={formData.capacite}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                                errors.capacite ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                            placeholder="5000"
                            min="1"
                        />
                        {errors.capacite && <p className="mt-1 text-sm text-rose-300">{errors.capacite}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Status
                        </label>
                        <select
                            name="statut"
                            value={formData.statut}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-slate-100 focus:outline-none focus:border-sky-400/40"
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
                        className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                    >
                        {camion ? "Update Truck" : "Create Truck"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
