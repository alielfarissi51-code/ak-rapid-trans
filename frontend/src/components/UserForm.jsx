import { useState, useEffect } from "react";

export default function UserForm({ user, roles, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role_id: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                password: "",
            });
        }
    }, [user]);

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

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.role_id) newErrors.role_id = "Role is required";
        if (!user && !formData.password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const submitData = { ...formData };
        if (!user || formData.password) {
            submitData.password = formData.password;
        }

        onSubmit(submitData);
    };

    return (
        <div className="mb-6 rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <h2 className="mb-4 text-xl font-semibold text-white">{user ? "Edit User" : "Add New User"}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                                errors.name ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                            placeholder="Full name"
                        />
                        {errors.name && <p className="mt-1 text-sm text-rose-300">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                                errors.email ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                            placeholder="user@example.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-rose-300">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Role
                        </label>
                        <select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 focus:outline-none ${
                                errors.role_id ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && <p className="mt-1 text-sm text-rose-300">{errors.role_id}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Password {user && "(Leave blank to keep current)"}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none ${
                                errors.password ? "border-rose-500/70" : "border-white/10 focus:border-sky-400/40"
                            }`}
                            placeholder="Password"
                        />
                        {errors.password && <p className="mt-1 text-sm text-rose-300">{errors.password}</p>}
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <button
                        type="submit"
                        className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                    >
                        {user ? "Update User" : "Create User"}
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
