import { useEffect, useState } from "react";
import { getCamions, createCamion, updateCamion, deleteCamion } from "../services/api";
import CamionForm from "../components/CamionForm";
import CamionsTable from "../components/CamionsTable";
import Sidebar from "../components/Sidebar";

export default function CamionsManagement() {
    const [camions, setCamions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCamion, setEditingCamion] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchCamions();
    }, []);

    const fetchCamions = async () => {
        try {
            setLoading(true);
            const data = await getCamions();
            setCamions(data);
            setError("");
        } catch (err) {
            setError("Failed to load trucks: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCamion(null);
        setShowForm(true);
    };

    const handleEdit = (camion) => {
        setEditingCamion(camion);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this truck?")) {
            try {
                await deleteCamion(id);
                setSuccess("Truck deleted successfully");
                fetchCamions();
                setTimeout(() => setSuccess(""), 3000);
            } catch (err) {
                setError("Failed to delete truck: " + err.message);
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingCamion) {
                await updateCamion(editingCamion.id, formData);
                setSuccess("Truck updated successfully");
            } else {
                await createCamion(formData);
                setSuccess("Truck created successfully");
            }
            setShowForm(false);
            setEditingCamion(null);
            fetchCamions();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to save truck: " + err.message);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[#050814] text-slate-100">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6">
                        <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-sky-300/70">Admin Tools</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Trucks Management</h1>
                                    <p className="mt-2 text-sm text-slate-400">Manage fleet vehicles and operational status.</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                                >
                                    + Add Truck
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                                    {success}
                                </div>
                            )}

                            {showForm && (
                                <CamionForm
                                    camion={editingCamion}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-10 text-center text-slate-300">
                                    Loading trucks...
                                </div>
                            ) : (
                                <CamionsTable camions={camions} onEdit={handleEdit} onDelete={handleDelete} />
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
