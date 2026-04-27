import { useEffect, useMemo, useState } from "react";
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
import { applyDocumentTheme, getStoredPreferences, PREFERENCES_EVENT } from "../utils/preferences";

const translations = {
    en: {
        adminTools: "Admin Tools",
        clientSpace: "Client Space",
        settings: "Settings",
        loadingAccount: "Loading account...",
        profileInfo: "Profile Information",
        profileSubtitleAdmin: "Update your admin account information.",
        profileSubtitleClient: "Update your account information.",
        name: "Name",
        email: "Email",
        namePlaceholderAdmin: "Admin name",
        namePlaceholderClient: "Your name",
        emailPlaceholderAdmin: "admin@example.com",
        emailPlaceholderClient: "your@email.com",
        saveProfile: "Save Profile",
        changePassword: "Change Password",
        passwordSubtitle: "Choose a strong password with at least 8 characters.",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        updatePassword: "Update Password",
        profileUpdated: "Profile updated",
        profileUpdatedDesc: (msg) => msg || "Your profile changes were saved successfully.",
        profileFailed: "Profile update failed",
        profileFailedDesc: (msg) => msg || "Failed to update profile.",
        passwordMismatch: "Password mismatch",
        passwordMismatchDesc: "Password confirmation does not match.",
        passwordUpdated: "Password updated",
        passwordUpdatedDesc: (msg) => msg || "Your password has been updated successfully.",
        passwordFailed: "Password update failed",
        passwordFailedDesc: (msg) => msg || "Failed to update password.",
    },
    fr: {
        adminTools: "Outils Admin",
        clientSpace: "Espace Client",
        settings: "Paramètres",
        loadingAccount: "Chargement du compte...",
        profileInfo: "Informations du profil",
        profileSubtitleAdmin: "Mettre à jour les informations de votre compte administrateur.",
        profileSubtitleClient: "Mettre à jour les informations de votre compte.",
        name: "Nom",
        email: "Email",
        namePlaceholderAdmin: "Nom de l'administrateur",
        namePlaceholderClient: "Votre nom",
        emailPlaceholderAdmin: "admin@exemple.com",
        emailPlaceholderClient: "votre@email.com",
        saveProfile: "Enregistrer le profil",
        changePassword: "Changer le mot de passe",
        passwordSubtitle: "Choisissez un mot de passe fort d'au moins 8 caractères.",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmer le nouveau mot de passe",
        updatePassword: "Mettre à jour le mot de passe",
        profileUpdated: "Profil mis à jour",
        profileUpdatedDesc: (msg) => msg || "Vos modifications de profil ont été enregistrées avec succès.",
        profileFailed: "Échec de la mise à jour du profil",
        profileFailedDesc: (msg) => msg || "Impossible de mettre à jour le profil.",
        passwordMismatch: "Mots de passe non concordants",
        passwordMismatchDesc: "La confirmation du mot de passe ne correspond pas.",
        passwordUpdated: "Mot de passe mis à jour",
        passwordUpdatedDesc: (msg) => msg || "Votre mot de passe a été mis à jour avec succès.",
        passwordFailed: "Échec de la mise à jour du mot de passe",
        passwordFailedDesc: (msg) => msg || "Impossible de mettre à jour le mot de passe.",
    },
};

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
    const [preferences, setPreferences] = useState(() => getStoredPreferences());
    const roleName = (user?.role_name || user?.role || "").toLowerCase();
    const isAdminUser = roleName === "admin";
    const theme = preferences.theme === "light" ? "light" : "dark";
    const lang = preferences.lang === "fr" ? "fr" : "en";
    const t = useMemo(() => translations[lang], [lang]);

    useEffect(() => {
        applyDocumentTheme(theme);
    }, [theme]);

    useEffect(() => {
        const handlePreferencesChanged = (event) => {
            if (event?.detail) {
                setPreferences(event.detail);
                return;
            }

            setPreferences(getStoredPreferences());
        };

        window.addEventListener(PREFERENCES_EVENT, handlePreferencesChanged);

        return () => {
            window.removeEventListener(PREFERENCES_EVENT, handlePreferencesChanged);
        };
    }, []);

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
            } catch {
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
        } catch {
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
                title: t.profileUpdated,
                description: t.profileUpdatedDesc(result?.message),
            });
        } catch (err) {
            addToast({
                type: "error",
                title: t.profileFailed,
                description: t.profileFailedDesc(err.message),
            });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.password !== passwordForm.password_confirmation) {
            addToast({
                type: "warning",
                title: t.passwordMismatch,
                description: t.passwordMismatchDesc,
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
                title: t.passwordUpdated,
                description: t.passwordUpdatedDesc(result?.message),
            });
        } catch (err) {
            addToast({
                type: "error",
                title: t.passwordFailed,
                description: t.passwordFailedDesc(err.message),
            });
        }
    };

    return (
        <div className={`h-screen overflow-hidden ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#050814] text-slate-100"}`}>
            <div className="flex h-full">
                <Sidebar
                    mobileOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                    user={user}
                    isAdmin={isAdminUser}
                    onLogout={handleLogout}
                    preferences={preferences}
                    onPreferencesChange={setPreferences}
                />

                <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
                    <header className={`border-b px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8 ${theme === "light" ? "border-slate-200 bg-white/90" : "border-white/5 bg-[#050814]/80"}`}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className={`text-sm font-medium ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{isAdminUser ? t.adminTools : t.clientSpace}</p>
                                <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                                    {t.settings}
                                </h1>
                            </div>
                        </div>
                    </header>

                    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-5xl flex-col gap-6">
                            {loadingUser && (
                                <div className={`rounded-2xl border px-4 py-3 text-sm ${theme === "light" ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/5 text-slate-300"}`}>
                                    {t.loadingAccount}
                                </div>
                            )}

                            <section className={`rounded-[28px] border p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                                <h2 className={`text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.profileInfo}</h2>
                                <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                                    {isAdminUser ? t.profileSubtitleAdmin : t.profileSubtitleClient}
                                </p>

                                <form className="mt-6 grid gap-4" onSubmit={handleProfileSubmit}>
                                    <div>
                                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>{t.name}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={onProfileChange}
                                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                                            placeholder={isAdminUser ? t.namePlaceholderAdmin : t.namePlaceholderClient}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>{t.email}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileForm.email}
                                            onChange={onProfileChange}
                                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                                            placeholder={isAdminUser ? t.emailPlaceholderAdmin : t.emailPlaceholderClient}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme === "light" ? "border-sky-300/50 bg-sky-100 text-sky-700 hover:bg-sky-200" : "border-sky-400/20 bg-sky-500/15 text-sky-100 hover:border-sky-300/40 hover:bg-sky-500/25"}`}
                                        >
                                            {t.saveProfile}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className={`rounded-[28px] border p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${theme === "light" ? "border-slate-200 bg-white" : "border-white/8 bg-white/[0.03]"}`}>
                                <h2 className={`text-xl font-semibold ${theme === "light" ? "text-slate-900" : "text-white"}`}>{t.changePassword}</h2>
                                <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                                    {t.passwordSubtitle}
                                </p>

                                <form className="mt-6 grid gap-4" onSubmit={handlePasswordSubmit}>
                                    <div>
                                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>{t.currentPassword}</label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordForm.current_password}
                                            onChange={onPasswordChange}
                                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>{t.newPassword}</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={passwordForm.password}
                                            onChange={onPasswordChange}
                                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className={`mb-2 block text-sm font-medium ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>{t.confirmPassword}</label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            value={passwordForm.password_confirmation}
                                            onChange={onPasswordChange}
                                            className={`w-full rounded-2xl border px-4 py-2.5 placeholder-slate-500 focus:border-sky-400/40 focus:outline-none ${theme === "light" ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.03] text-slate-100"}`}
                                            minLength={8}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme === "light" ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"}`}
                                        >
                                            {t.updatePassword}
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
