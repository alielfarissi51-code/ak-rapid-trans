import { useEffect, useMemo, useState } from "react";
import { getClients, createClient, updateClient, deleteClient } from "../services/api";
import ClientForm from "../components/ClientForm";
import ClientsTable from "../components/ClientsTable";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const translations = {
    en: {
        adminTools: "Admin Tools",
        title: "Clients Management",
        subtitle: "Create, update and maintain client records.",
        addClient: "+ Add Client",
        searchPlaceholder: "Search by name, email or phone",
        clientsCount: (n) => `${n} client${n !== 1 ? "s" : ""}`,
        loadingClients: "Loading clients...",
        page: "Page",
        of: "of",
        previous: "← Previous",
        next: "Next →",
        deleteTitle: "Delete client record?",
        deleteConfirm: "This action will permanently remove the selected client record and cannot be undone.",
        deleteHint: "Only continue if this client is no longer needed.",
        cancel: "Cancel",
        confirmDelete: "Delete client",
        deleteSuccess: "Client deleted",
        deleteSuccessDesc: "The client was removed successfully.",
        deleteFailed: "Delete failed",
        deleteFailedDesc: (msg) => `We could not delete the client. ${msg}`,
        saveSuccess: "Client updated",
        saveSuccessDesc: "Client changes have been saved successfully.",
        createSuccess: "Client created",
        createSuccessDesc: "The new client has been added successfully.",
        saveFailed: "Save failed",
        saveFailedDesc: (msg) => `We could not save this client. ${msg}`,
        loadError: "Unable to load clients",
        loadErrorDesc: (msg) => `We could not fetch clients. ${msg}`,
    },
    fr: {
        adminTools: "Outils Admin",
        title: "Gestion des clients",
        subtitle: "Créer, modifier et maintenir les données clients.",
        addClient: "+ Ajouter un client",
        searchPlaceholder: "Rechercher par nom, email ou téléphone",
        clientsCount: (n) => `${n} client${n !== 1 ? "s" : ""}`,
        loadingClients: "Chargement des clients...",
        page: "Page",
        of: "sur",
        previous: "← Précédent",
        next: "Suivant →",
        deleteTitle: "Supprimer la fiche client ?",
        deleteConfirm: "Cette action supprimera définitivement la fiche sélectionnée et ne peut pas être annulée.",
        deleteHint: "Continuez uniquement si ce client n’est plus nécessaire.",
        cancel: "Annuler",
        confirmDelete: "Supprimer le client",
        deleteSuccess: "Client supprimé",
        deleteSuccessDesc: "Le client a été supprimé avec succès.",
        deleteFailed: "Échec de la suppression",
        deleteFailedDesc: (msg) => `Impossible de supprimer le client. ${msg}`,
        saveSuccess: "Client mis à jour",
        saveSuccessDesc: "Les modifications du client ont été enregistrées avec succès.",
        createSuccess: "Client créé",
        createSuccessDesc: "Le nouveau client a été ajouté avec succès.",
        saveFailed: "Échec de l'enregistrement",
        saveFailedDesc: (msg) => `Impossible d'enregistrer ce client. ${msg}`,
        loadError: "Impossible de charger les clients",
        loadErrorDesc: (msg) => `Impossible de récupérer les clients. ${msg}`,
    },
};

export default function ClientsManagement() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [preferences, setPreferences] = useState(() => getStoredPreferences());
    const [deleteTarget, setDeleteTarget] = useState(null);
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

    const filteredClients = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return clients.filter((client) => {
            if (!normalizedSearch) {
                return true;
            }

            return `${client.nom || ""} ${client.email || ""} ${client.telephone || ""}`
                .toLowerCase()
                .includes(normalizedSearch);
        });
    }, [clients, searchTerm]);

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredClients.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredClients, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchClients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const data = await getClients();
            setClients(data);
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
        setEditingClient(null);
        setShowForm(true);
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setShowForm(true);
    };

    const handleDeleteRequest = (id) => {
        const target = clients.find((client) => client.id === id) || { id };
        setDeleteTarget(target);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await deleteClient(deleteTarget.id);
            addToast({
                type: "success",
                title: t.deleteSuccess,
                description: t.deleteSuccessDesc,
            });
            setDeleteTarget(null);
            fetchClients();
        } catch (err) {
            addToast({
                type: "error",
                title: t.deleteFailed,
                description: t.deleteFailedDesc(err.message),
            });
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingClient) {
                await updateClient(editingClient.id, formData);
                addToast({
                    type: "success",
                    title: t.saveSuccess,
                    description: t.saveSuccessDesc,
                });
            } else {
                await createClient(formData);
                addToast({
                    type: "success",
                    title: t.createSuccess,
                    description: t.createSuccessDesc,
                });
            }
            setShowForm(false);
            setEditingClient(null);
            fetchClients();
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
                        <section className={`clients-surface rounded-2xl border p-6 shadow-[0_24px_70px_rgba(2,6,23,0.05)] ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
                            <div className={`mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-700" : "border-slate-200/80"}`}>
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-sky-400/80" : "text-sky-600/80"}`}>{t.adminTools}</p>
                                    <h1 className={`mt-2 text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{t.title}</h1>
                                    <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.subtitle}</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className={`clients-cta inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${isDark ? "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:border-sky-400/50 hover:bg-sky-500/20" : "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 hover:border-sky-300 hover:from-sky-100 hover:to-cyan-100"}`}
                                >
                                    <AddIcon className="h-4 w-4" />
                                    {t.addClient}
                                </button>
                            </div>

                            <div className={`clients-filter-shell mb-6 rounded-xl border p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-white"}`}>
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                    <div className="relative">
                                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder={t.searchPlaceholder}
                                            className={`h-11 w-full rounded-xl border pl-10 pr-3 text-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${isDark ? "border-slate-600 bg-slate-700 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                                        />
                                    </div>
                                    <div className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium ${isDark ? "border-slate-600 bg-slate-700 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                                        {t.clientsCount(filteredClients.length)}
                                    </div>
                                </div>
                            </div>

                            {showForm && (
                                <ClientForm
                                    key={editingClient ? `edit-${editingClient.id}` : "create-client"}
                                    client={editingClient}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                    isDark={isDark}
                                />
                            )}

                            {loading ? (
                                <div className={`rounded-xl border py-10 text-center text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
                                    {t.loadingClients}
                                </div>
                            ) : (
                                <>
                                    <ClientsTable clients={paginatedClients} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                                    {totalPages > 1 && (
                                        <div className={`mt-6 flex items-center justify-between rounded-xl border px-4 py-4 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
                                            <div className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                {t.page} {currentPage} {t.of} {totalPages}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${isDark ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-sky-400/40 hover:bg-sky-500/10" : "border-slate-200 bg-white text-slate-900 hover:border-sky-300 hover:bg-sky-50"}`}
                                                >
                                                    {t.previous}
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

            <DeleteConfirmationModal
                open={Boolean(deleteTarget)}
                isDark={isDark}
                title={t.deleteTitle}
                message={t.deleteConfirm}
                hint={t.deleteHint}
                itemLabel={deleteTarget?.nom || deleteTarget?.email || `#${deleteTarget?.id}`}
                cancelLabel={t.cancel}
                confirmLabel={t.confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
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