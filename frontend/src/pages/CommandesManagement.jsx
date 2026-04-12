import { useEffect, useState } from "react";
import { getCommandes, createCommande, updateCommande, deleteCommande, getCamions } from "../services/api";
import CommandeForm from "../components/CommandeForm";
import CommandesTable from "../components/CommandesTable";
import Sidebar from "../components/Sidebar";

export default function CommandesManagement() {
    const [commandes, setCommandes] = useState([]);
    const [camions, setCamions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCommande, setEditingCommande] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchCommandes();
        fetchCamions();
    }, []);

    const fetchCommandes = async () => {
        try {
            setLoading(true);
            const data = await getCommandes();
            setCommandes(data);
            setError("");
        } catch (err) {
            setError("Failed to load orders: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCamions = async () => {
        try {
            const data = await getCamions();
            setCamions(data);
        } catch (err) {
            console.error("Failed to load trucks");
        }
    };

    const handleCreate = () => {
        setEditingCommande(null);
        setShowForm(true);
    };

    const handleEdit = (commande) => {
        setEditingCommande(commande);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this order?")) {
            try {
                await deleteCommande(id);
                setSuccess("Order deleted successfully");
                fetchCommandes();
                setTimeout(() => setSuccess(""), 3000);
            } catch (err) {
                setError("Failed to delete order: " + err.message);
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingCommande) {
                await updateCommande(editingCommande.id, formData);
                setSuccess("Order updated successfully");
            } else {
                await createCommande(formData);
                setSuccess("Order created successfully");
            }
            setShowForm(false);
            setEditingCommande(null);
            fetchCommandes();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to save order: " + err.message);
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
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Orders Management</h1>
                                    <p className="mt-2 text-sm text-slate-400">Create, update and monitor all transport orders.</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                                >
                                    + Add Order
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
                                <CommandeForm
                                    commande={editingCommande}
                                    camions={camions}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-10 text-center text-slate-300">
                                    Loading orders...
                                </div>
                            ) : (
                                <CommandesTable commandes={commandes} onEdit={handleEdit} onDelete={handleDelete} />
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
