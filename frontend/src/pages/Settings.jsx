import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    clearToken,
    getMe,
    logout as apiLogout,
    updatePassword,
    updateProfile,
} from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function Settings() {
    const navigate = useNavigate();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const { addToast } = useToast();

    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        let active = true;

        const loadUser = async () => {
            try {
                const profile = await getMe();

                if (active) {
                    setUser(profile);
                    setProfileForm({
                        name: profile.name || "",
                        email: profile.email || "",
                    });
                }
            } catch (err) {
                if (active) {
                    clearToken();
                    navigate("/", {
                        replace: true,
                        state: { errorMessage: "Session expired. Please log in again." },
                    });
                }
            } finally {
                if (active) {
                    setLoadingUser(false);
                }
            }
        };

        loadUser();

        return () => {
            active = false;
        };
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (err) {
            // Local logout should always continue.
        } finally {
            clearToken();
            navigate("/", { replace: true });
        }
    };

    const onProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const onPasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await updateProfile(profileForm);
            if (result?.user) {
                setUser(result.user);
            }
            addToast({
                type: "success",
                title: "Profile updated",
                description: result?.message || "Your profile changes were saved successfully.",
            });
        } catch (err) {
            addToast({
                type: "error",
                title: "Profile update failed",
                description: err.message || "Failed to update profile.",
            });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.password !== passwordForm.password_confirmation) {
            addToast({
                type: "warning",
                title: "Password mismatch",
                description: "Password confirmation does not match.",
            });
            return;
        }

        try {
            const result = await updatePassword(passwordForm);
            setPasswordForm({
                current_password: "",
                password: "",
                password_confirmation: "",
            });
            addToast({
                type: "success",
                title: "Password updated",
                description: result?.message || "Your password has been updated successfully.",
            });
        } catch (err) {
            addToast({
                type: "error",
                title: "Password update failed",
                description: err.message || "Failed to update password.",
            });
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[#050814] text-slate-100">
            <div className="flex h-full">
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                    user={user}
                    isAdmin
                    onLogout={handleLogout}
                />

                <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                    <header className="border-b border-white/5 bg-[#050814]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Admin Tools</p>
                                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                    Settings
                                </h1>
                            </div>
                        </div>
                    </header>

                    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-5xl flex-col gap-6">
                            {loadingUser && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                                    Loading account...
                                </div>
                            )}

                            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                                <p className="mt-2 text-sm text-slate-400">
                                    Update your admin account information.
                                </p>

                                <form className="mt-6 grid gap-4" onSubmit={handleProfileSubmit}>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={onProfileChange}
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none"
                                            placeholder="Admin name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileForm.email}
                                            onChange={onProfileChange}
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none"
                                            placeholder="admin@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className="rounded-2xl border border-sky-400/20 bg-sky-500/15 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:bg-sky-500/25"
                                        >
                                            Save Profile
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                                <h2 className="text-xl font-semibold text-white">Change Password</h2>
                                <p className="mt-2 text-sm text-slate-400">
                                    Choose a strong password with at least 8 characters.
                                </p>

                                <form className="mt-6 grid gap-4" onSubmit={handlePasswordSubmit}>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">Current Password</label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordForm.current_password}
                                            onChange={onPasswordChange}
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={passwordForm.password}
                                            onChange={onPasswordChange}
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none"
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            value={passwordForm.password_confirmation}
                                            onChange={onPasswordChange}
                                            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none"
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
