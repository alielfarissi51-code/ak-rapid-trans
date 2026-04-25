import { useEffect, useMemo, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, getRoles } from "../services/api";
import UserForm from "../components/UserForm";
import UsersTable from "../components/UsersTable";
import Sidebar from "../components/Sidebar";
import { useToast } from "../components/ToastProvider";

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { addToast } = useToast();

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
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            addToast({
                type: "error",
                title: "Unable to load users",
                description: `We could not fetch users. ${err.message}`,
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
            console.error("Failed to load roles");
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

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                addToast({
                    type: "success",
                    title: "User deleted",
                    description: "The user account was removed successfully.",
                });
                fetchUsers();
            } catch (err) {
                addToast({
                    type: "error",
                    title: "Delete failed",
                    description: `We could not delete the user. ${err.message}`,
                });
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
                addToast({
                    type: "success",
                    title: "User updated",
                    description: "Your changes have been saved successfully.",
                });
            } else {
                await createUser(formData);
                addToast({
                    type: "success",
                    title: "User created",
                    description: "The new user has been added successfully.",
                });
            }
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            addToast({
                type: "error",
                title: "Save failed",
                description: `We could not save this user. ${err.message}`,
            });
        }
    };

    return (
        <div className="app-dashboard min-h-screen overflow-x-hidden bg-white text-slate-900">
            <Sidebar />
            <div className="flex min-h-screen min-w-0 flex-col lg:pl-[260px]">
                <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.05)]">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-sky-600/70">Admin Tools</p>
                                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Users Management</h1>
                                    <p className="mt-2 text-sm text-slate-500">Create, update and control user access.</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition duration-200 hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                >
                                    <AddIcon className="h-4 w-4" />
                                    + Add User
                                </button>
                            </div>

                            <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                                <div className="relative">
                                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search by name or email"
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                                    />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={(event) => setRoleFilter(event.target.value)}
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                                >
                                    <option value="all">All roles</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                                <div className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-500">
                                    {filteredUsers.length} users
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
                                <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-slate-500">
                                    Loading users...
                                </div>
                            ) : (
                                <>
                                    <UsersTable users={paginatedUsers} onEdit={handleEdit} onDelete={handleDelete} />
                                    {totalPages > 1 && (
                                        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4">
                                            <div className="text-sm text-slate-600">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                                >
                                                    ← Previous
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition duration-200 hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                                >
                                                    Next →
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
