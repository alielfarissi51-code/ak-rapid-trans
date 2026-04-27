import { useEffect, useMemo, useState } from "react";
import { getCamions, createCamion, updateCamion, deleteCamion } from "../services/api";
import CamionForm from "../components/CamionForm";
import CamionsTable from "../components/CamionsTable";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const translations = {
    en: {
        adminTools: "Admin Tools",
        title: "Trucks Management",
        subtitle: "Manage fleet vehicles and operational status.",
        addTruck: "+ Add Truck",
        searchPlaceholder: "Search by plate or brand",
        allStatuses: "All statuses",
        available: "Available",
        inMaintenance: "In Maintenance",
        unavailable: "Unavailable",
        trucksCount: (n) => `${n} truck${n !== 1 ? "s" : ""}`,
        loadingTrucks: "Loading trucks...",
        page: "Page",
        of: "of",
        previous: "← Previous",
        next: "Next →",
        deleteConfirm: "Are you sure you want to delete this truck?",
        deleteSuccess: "Truck deleted",
        deleteSuccessDesc: "The truck was removed successfully.",
        deleteFailed: "Delete failed",
        deleteFailedDesc: (msg) => `We could not delete the truck. ${msg}`,
        updateSuccess: "Truck updated",
        updateSuccessDesc: "Your truck changes have been saved successfully.",
        createSuccess: "Truck created",
        createSuccessDesc: "The new truck has been added successfully.",
        saveFailed: "Save failed",
        saveFailedDesc: (msg) => `We could not save this truck. ${msg}`,
        loadError: "Unable to load trucks",
        loadErrorDesc: (msg) => `We could not fetch trucks. ${msg}`,
    },
    fr: {
        adminTools: "Outils Admin",
        title: "Gestion des camions",
        subtitle: "Gérer les véhicules de la flotte et leur statut opérationnel.",
        addTruck: "+ Ajouter un camion",
        searchPlaceholder: "Rechercher par plaque ou marque",
        allStatuses: "Tous les statuts",
        available: "Disponible",
        inMaintenance: "En maintenance",
        unavailable: "Indisponible",
        trucksCount: (n) => `${n} camion${n !== 1 ? "s" : ""}`,
        loadingTrucks: "Chargement des camions...",
        page: "Page",
        of: "sur",
        previous: "← Précédent",
        next: "Suivant →",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce camion ?",
        deleteSuccess: "Camion supprimé",
        deleteSuccessDesc: "Le camion a été supprimé avec succès.",
        deleteFailed: "Échec de la suppression",
        deleteFailedDesc: (msg) => `Impossible de supprimer le camion. ${msg}`,
        updateSuccess: "Camion mis à jour",
        updateSuccessDesc: "Les modifications du camion ont été enregistrées avec succès.",
        createSuccess: "Camion créé",
        createSuccessDesc: "Le nouveau camion a été ajouté avec succès.",
        saveFailed: "Échec de l'enregistrement",
        saveFailedDesc: (msg) => `Impossible d'enregistrer ce camion. ${msg}`,
        loadError: "Impossible de charger les camions",
        loadErrorDesc: (msg) => `Impossible de récupérer les camions. ${msg}`,
    },
};

export default function CamionsManagement() {
    const [camions, setCamions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCamion, setEditingCamion] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [preferences, setPreferences] = useState(() => getStoredPreferences());
    const itemsPerPage = 10;
    const { addToast } = useToast();

    const theme = preferences.theme === "light" ? "light" : "dark";
    const lang = preferences.lang === "fr" ? "fr" : "en";
    const t = useMemo(() => translations[lang], [lang]);

    useEffect(() => {
        applyDocumentTheme(theme);
    }, [theme]);

    useEffect(() => {
        const handler = (event) => {
            setPreferences(event?.detail ?? getStoredPreferences());
        };
        window.addEventListener(PREFERENCES_EVENT, handler);
        return () => window.removeEventListener(PREFERENCES_EVENT, handler);
    }, []);

    const filteredCamions = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return camions.filter((camion) => {
            const matchesSearch = !normalizedSearch
                || camion.matricule?.toLowerCase().includes(normalizedSearch)
                || camion.marque?.toLowerCase().includes(normalizedSearch);
            const matchesStatus = statusFilter === "all" || camion.statut === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [camions, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredCamions.length / itemsPerPage);
    const paginatedCamions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCamions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCamions, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        fetchCamions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCamions = async () => {
        try {
            setLoading(true);
            const data = await getCamions();
            setCamions(data);
        } catch (err) {
            addToast({
                type: "error",
                title: t.loadError,
                description: t.loadErrorDesc(err.message),
            });
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
        if (confirm(t.deleteConfirm)) {
            try {
                await deleteCamion(id);
                addToast({
                    type: "success",
                    title: t.deleteSuccess,
                    description: t.deleteSuccessDesc,
                });
                fetchCamions();
            } catch (err) {
                addToast({
                    type: "error",
                    title: t.deleteFailed,
                    description: t.deleteFailedDesc(err.message),
                });
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingCamion) {
                await updateCamion(editingCamion.id, formData);
                addToast({
                    type: "success",
                    title: t.updateSuccess,
                    description: t.updateSuccessDesc,
                });
            } else {
                await createCamion(formData);
                addToast({
                    type: "success",
                    title: t.createSuccess,
                    description: t.createSuccessDesc,
                });
            }
            setShowForm(false);
            setEditingCamion(null);
            fetchCamions();
        } catch (err) {
            addToast({
                type: "error",
                title: t.saveFailed,
                description: t.saveFailedDesc(err.message),
            });
        }
    };

    const isDark = theme === "dark";

    return (
        <div className={`app-dashboard min-h-screen overflow-x-hidden ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <Sidebar
                mobileOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                isAdmin={true}
                preferences={preferences}
                onPreferencesChange={setPreferences}
            />
            <div className="flex min-h-screen min-w-0 flex-col lg:pl-[260px]">
                <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6">
                        <section className={`rounded-2xl border p-6 shadow-[0_24px_70px_rgba(2,6,23,0.05)] ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                            <div className={`mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-700" : "border-slate-200/80"}`}>
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-sky-400/80" : "text-sky-600/80"}`}>{t.adminTools}</p>
                                    <h1 className={`mt-2 text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{t.title}</h1>
                                    <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.subtitle}</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${isDark ? "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:border-sky-400/50 hover:bg-sky-500/20" : "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 hover:border-sky-300 hover:from-sky-100 hover:to-cyan-100"}`}
                                >
                                    <AddIcon className="h-4 w-4" />
                                    {t.addTruck}
                                </button>
                            </div>

                            <div className={`mb-6 rounded-xl border p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-white"}`}>
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                                    <div className="relative">
                                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder={t.searchPlaceholder}
                                            className={`h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${isDark ? "border-slate-600 bg-slate-700 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        className={`h-11 rounded-xl border px-3 text-sm outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${isDark ? "border-slate-600 bg-slate-700 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                                    >
                                        <option value="all">{t.allStatuses}</option>
                                        <option value="disponible">{t.available}</option>
                                        <option value="en_maintenance">{t.inMaintenance}</option>
                                        <option value="indisponible">{t.unavailable}</option>
                                    </select>
                                    <div className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium ${isDark ? "border-slate-600 bg-slate-700 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                                        {t.trucksCount(filteredCamions.length)}
                                    </div>
                                </div>
                            </div>

                            {showForm && (
                                <CamionForm
                                    key={editingCamion ? `edit-${editingCamion.id}` : "create-camion"}
                                    camion={editingCamion}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className={`rounded-xl border py-10 text-center text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
                                    {t.loadingTrucks}
                                </div>
                            ) : (
                                <>
                                    <CamionsTable camions={paginatedCamions} onEdit={handleEdit} onDelete={handleDelete} />
                                    {totalPages > 1 && (
                                        <div className={`mt-6 flex items-center justify-between rounded-xl border px-4 py-4 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
                                            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                {t.page} {currentPage} {t.of} {totalPages}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${isDark ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-sky-400/40 hover:bg-sky-500/10" : "border-slate-200 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50"}`}
                                                >
                                                    {t.previous}
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${isDark ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-sky-400/40 hover:bg-sky-500/10" : "border-slate-200 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50"}`}
                                                >
                                                    {t.next}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}
