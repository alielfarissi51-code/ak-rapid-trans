import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser, getRoles } from "../services/api";
import UserForm from "../components/UserForm";
import UsersTable from "../components/UsersTable";
import Sidebar from "../components/Sidebar";

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
            setError("");
        } catch (err) {
            setError("Failed to load users: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (err) {
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
                setSuccess("User deleted successfully");
                fetchUsers();
                setTimeout(() => setSuccess(""), 3000);
            } catch (err) {
                setError("Failed to delete user: " + err.message);
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, formData);
                setSuccess("User updated successfully");
            } else {
                await createUser(formData);
                setSuccess("User created successfully");
            }
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Failed to save user: " + err.message);
        }
    };

    return (
        <div className="app-dashboard h-screen overflow-hidden bg-[#050814] text-slate-100">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6">
                        <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.24em] text-sky-300/70">Admin Tools</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Users Management</h1>
                                    <p className="mt-2 text-sm text-slate-400">Create, update and control user access.</p>
                                </div>
                                <button
                                    onClick={handleCreate}
                                    className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                                >
                                    + Add User
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
                                <UserForm
                                    user={editingUser}
                                    roles={roles}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowForm(false)}
                                />
                            )}

                            {loading ? (
                                <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-10 text-center text-slate-300">
                                    Loading users...
                                </div>
                            ) : (
                                <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
