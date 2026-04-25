const STORAGE_KEY = "akrt.preferences";
export const PREFERENCES_EVENT = "akrt:preferences-changed";

const DEFAULT_PREFERENCES = {
    theme: "dark",
    lang: "en",
};

export function getStoredPreferences() {
    if (typeof window === "undefined") {
        return DEFAULT_PREFERENCES;
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return DEFAULT_PREFERENCES;
        }

        const parsed = JSON.parse(raw);
        return {
            theme: parsed.theme === "light" ? "light" : "dark",
            lang: parsed.lang === "fr" ? "fr" : "en",
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export function setStoredPreferences(preferences) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT, { detail: preferences }));
}

export function applyDocumentTheme(theme) {
    if (typeof document === "undefined") {
        return;
    }

    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
}

export function getDefaultPreferences() {
    return DEFAULT_PREFERENCES;
}
