import { useEffect, useMemo, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, getRoles } from "../services/api";
import UserForm from "../components/UserForm";
import UsersTable from "../components/UsersTable";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const translations = {
    en: {
        adminTools: "Admin Tools",
        title: "Users Management",
        subtitle: "Create, update and control user access.",
        addUser: "+ Add User",
        searchPlaceholder: "Search by name or email",
        allRoles: "All roles",
        usersCount: (n) => `${n} user${n !== 1 ? "s" : ""}`,
        loadingUsers: "Loading users...",
        page: "Page",
        of: "of",
        previous: "← Previous",
        next: "Next →",
        deleteTitle: "Delete user account?",
        deleteConfirm: "This action will permanently remove the selected user account and cannot be undone.",
        deleteHint: "Make sure the account is no longer needed before continuing.",
        cancel: "Cancel",
        confirmDelete: "Delete user",
        deleteSuccess: "User deleted",
        deleteSuccessDesc: "The user account was removed successfully.",
        deleteFailed: "Delete failed",
        deleteFailedDesc: (msg) => `We could not delete the user. ${msg}`,
        saveSuccess: "User updated",
        saveSuccessDesc: "Your changes have been saved successfully.",
        createSuccess: "User created",
        createSuccessDesc: "The new user has been added successfully.",
        saveFailed: "Save failed",
        saveFailedDesc: (msg) => `We could not save this user. ${msg}`,
        loadError: "Unable to load users",
        loadErrorDesc: (msg) => `We could not fetch users. ${msg}`,
    },
    fr: {
        adminTools: "Outils Admin",
        title: "Gestion des utilisateurs",
        subtitle: "Créer, modifier et gérer les accès utilisateurs.",
        addUser: "+ Ajouter un utilisateur",
        searchPlaceholder: "Rechercher par nom ou email",
        allRoles: "Tous les rôles",
        usersCount: (n) => `${n} utilisateur${n !== 1 ? "s" : ""}`,
        loadingUsers: "Chargement des utilisateurs...",
        page: "Page",
        of: "sur",
        previous: "← Précédent",
        next: "Suivant →",
        deleteTitle: "Supprimer le compte utilisateur ?",
        deleteConfirm: "Cette action supprimera définitivement le compte sélectionné et ne peut pas être annulée.",
        deleteHint: "Vérifiez que ce compte n’est plus nécessaire avant de continuer.",
        cancel: "Annuler",
        confirmDelete: "Supprimer l'utilisateur",
        deleteSuccess: "Utilisateur supprimé",
        deleteSuccessDesc: "Le compte utilisateur a été supprimé avec succès.",
        deleteFailed: "Échec de la suppression",
        deleteFailedDesc: (msg) => `Impossible de supprimer l'utilisateur. ${msg}`,
        saveSuccess: "Utilisateur mis à jour",
        saveSuccessDesc: "Vos modifications ont été enregistrées avec succès.",
        createSuccess: "Utilisateur créé",
        createSuccessDesc: "Le nouvel utilisateur a été ajouté avec succès.",
        saveFailed: "Échec de l'enregistrement",
        saveFailedDesc: (msg) => `Impossible d'enregistrer cet utilisateur. ${msg}`,
        loadError: "Impossible de charger les utilisateurs",
        loadErrorDesc: (msg) => `Impossible de récupérer les utilisateurs. ${msg}`,
    },
};

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
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

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch = !normalizedSearch
                || user.name?.toLowerCase().includes(normalizedSearch)
                || user.email?.toLowerCase().includes(normalizedSearch);
            const roleName = (user.role?.name || user.role_name || user.role || "").toLowerCase();
            const matchesRole = roleFilter === "all" || roleName === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
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

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
        } catch {
            // non-critical
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDeleteRequest = (id) => {
        const target = users.find((user) => user.id === id) || { id };
        setDeleteTarget(target);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            await deleteUser(deleteTarget.id);
            addToast({
                type: "success",
                title: t.deleteSuccess,
                description: t.deleteSuccessDesc,
            });
            setDeleteTarget(null);
            fetchUsers();
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
            if (editingUser) {
                await updateUser(editingUser.id, formData);
                addToast({
                    type: "success",
                    title: t.saveSuccess,
                    description: t.saveSuccessDesc,
                });
            } else {
                await createUser(formData);
                addToast({
                    type: "success",
                    title: t.createSuccess,
                    description: t.createSuccessDesc,
                });
            }
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
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
                                    {t.addUser}
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
                                        value={roleFilter}
                                        onChange={(event) => setRoleFilter(event.target.value)}
                                        className={`h-11 rounded-xl border px-3 text-sm outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${isDark ? "border-slate-600 bg-slate-700 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}
                                    >
                                        <option value="all">{t.allRoles}</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                    <div className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium ${isDark ? "border-slate-600 bg-slate-700 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                                        {t.usersCount(filteredUsers.length)}
                                    </div>
                                </div>
                            </div>

                            {showForm && (
                                <UserForm
                                    key={editingUser ? `edit-${editingUser.id}` : "create-user"}
                                    user={editingUser}
                                    roles={roles}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className={`rounded-xl border py-10 text-center text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
                                    {t.loadingUsers}
                                </div>
                            ) : (
                                <>
                                    <UsersTable users={paginatedUsers} onEdit={handleEdit} onDelete={handleDeleteRequest} />
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

            <DeleteConfirmationModal
                open={Boolean(deleteTarget)}
                isDark={isDark}
                title={t.deleteTitle}
                message={t.deleteConfirm}
                hint={t.deleteHint}
                itemLabel={deleteTarget?.name || deleteTarget?.email || `#${deleteTarget?.id}`}
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
