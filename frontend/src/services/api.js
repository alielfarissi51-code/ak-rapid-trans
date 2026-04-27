
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getCachedUser = () => {
    try {
        const cached = localStorage.getItem(USER_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const setCachedUser = (user) => {
    if (!user) {
        localStorage.removeItem(USER_KEY);
        return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

const authHeaders = () => {
    const token = getToken();

    return {
        Accept: 'application/json',
        ...(token
            ? {
                    Authorization: `Bearer ${token}`,
                }
            : {}),
    };
};

const parseResponse = async (response) => {
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = payload?.message || payload?.errors?.email?.[0] || 'Request failed';
        throw new Error(message);
    }

    return payload;
};

export const login = async (data) => {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(data),
    });

    const payload = await parseResponse(response);
    const roleName = payload?.user?.role_name || payload?.user?.role;

    if (!payload?.token || !roleName) {
        throw new Error('Invalid login response from server. Please try again.');
    }

    return payload;
};
export const register = async (data) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}
export const getMe = async () => {
    const response = await fetch(`${API_BASE}/me`, {
        headers: {
            ...authHeaders(),
        },
    });

    const profile = await parseResponse(response);
    setCachedUser(profile);

    return profile;
};

export const logout = async () => {
    const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse(response);
};

export const updateProfile = async (data) => {
    const response = await fetch(`${API_BASE}/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });

    return parseResponse(response);
};

export const updatePassword = async (data) => {
    const response = await fetch(`${API_BASE}/me/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });

    return parseResponse(response);
};

// =============== USERS MANAGEMENT ===============
export const getUsers = async () => {
    const response = await fetch(`${API_BASE}/admin/users`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getUserById = async (id) => {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createUser = async (data) => {
    const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const updateUser = async (id, data) => {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const deleteUser = async (id) => {
    const response = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete user');
    }
    return response.status === 204 ? {} : response.json();
};

export const getRoles = async () => {
    const response = await fetch(`${API_BASE}/admin/roles`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

// =============== CAMIONS (TRUCKS) MANAGEMENT ===============
export const getCamions = async () => {
    const response = await fetch(`${API_BASE}/admin/camions`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getCamionById = async (id) => {
    const response = await fetch(`${API_BASE}/admin/camions/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createCamion = async (data) => {
    const response = await fetch(`${API_BASE}/admin/camions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const updateCamion = async (id, data) => {
    const response = await fetch(`${API_BASE}/admin/camions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const deleteCamion = async (id) => {
    const response = await fetch(`${API_BASE}/admin/camions/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete truck');
    }
    return response.status === 204 ? {} : response.json();
};

// =============== CLIENTS MANAGEMENT ===============
export const getClients = async () => {
    const response = await fetch(`${API_BASE}/admin/clients`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getClientById = async (id) => {
    const response = await fetch(`${API_BASE}/admin/clients/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createClient = async (data) => {
    const response = await fetch(`${API_BASE}/admin/clients`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const updateClient = async (id, data) => {
    const response = await fetch(`${API_BASE}/admin/clients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const deleteClient = async (id) => {
    const response = await fetch(`${API_BASE}/admin/clients/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete client');
    }
    return response.status === 204 ? {} : response.json();
};

// =============== COMMANDES (ORDERS) MANAGEMENT ===============
export const getCommandes = async () => {
    const response = await fetch(`${API_BASE}/admin/commandes`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getCommandeById = async (id) => {
    const response = await fetch(`${API_BASE}/admin/commandes/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createCommande = async (data) => {
    const response = await fetch(`${API_BASE}/admin/commandes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const updateCommande = async (id, data) => {
    const response = await fetch(`${API_BASE}/admin/commandes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });
    return parseResponse(response);
};

export const deleteCommande = async (id) => {
    const response = await fetch(`${API_BASE}/admin/commandes/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete order');
    }
    return response.status === 204 ? {} : response.json();
};

export const getCommandeStatusLogs = async (id) => {
    const response = await fetch(`${API_BASE}/admin/commandes/${id}/status-logs`, {
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};

export const generateCommandeFacture = async (id, options = {}) => {
    const { regenerate = false } = options;

    const response = await fetch(`${API_BASE}/admin/commandes/${id}/facture/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ regenerate }),
    });

    return parseResponse(response);
};

export const downloadCommandeFacture = async (id, fallbackFileName = null) => {
    const response = await fetch(`${API_BASE}/commandes/${id}/facture/download`, {
        headers: {
            ...authHeaders(),
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to download facture');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const downloadName = fallbackFileName || `facture-commande-${id}.pdf`;

    anchor.href = url;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

// =============== REPORTING / EXCHANGE ===============
export const downloadCommandesPdf = async () => {
    const response = await fetch(`${API_BASE}/admin/reports/commandes/pdf`, {
        headers: { ...authHeaders() },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to export PDF');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `commandes-report-${Date.now()}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

export const getCommandesSummary = async () => {
    const response = await fetch(`${API_BASE}/admin/reports/commandes/summary`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const exportCommandesXml = async () => {
    const response = await fetch(`${API_BASE}/admin/reports/commandes/export-xml`, {
        headers: { ...authHeaders() },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to export XML');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `commandes-export-${Date.now()}.xml`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
};

export const importCommandesXml = async (file) => {
    const formData = new FormData();
    formData.append('xml_file', file);

    const response = await fetch(`${API_BASE}/admin/reports/commandes/import-xml`, {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
        body: formData,
    });

    return parseResponse(response);
};

export const getClientCommandes = async () => {
    const response = await fetch(`${API_BASE}/client/commandes`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getClientCommandesSummary = async () => {
    const response = await fetch(`${API_BASE}/client/commandes/summary`, {
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};

export const createClientCommande = async (data) => {
    const response = await fetch(`${API_BASE}/client/commandes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(data),
    });

    return parseResponse(response);
};

export const getClientCommandeById = async (id) => {
    const response = await fetch(`${API_BASE}/client/commandes/${id}`, {
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};

export const getClientNotifications = async () => {
    const response = await fetch(`${API_BASE}/client/notifications`, {
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};

export const markClientNotificationRead = async (id) => {
    const response = await fetch(`${API_BASE}/client/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse(response);
};

export const markAllClientNotificationsRead = async () => {
    const response = await fetch(`${API_BASE}/client/notifications/read-all`, {
        method: 'PATCH',
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse(response);
};

export const getAdminUnreadNotifications = async () => {
    const response = await fetch(`${API_BASE}/admin/notifications/unread`, {
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};

export const markAdminNotificationRead = async (id) => {
    const response = await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};

export const markAllAdminNotificationsRead = async () => {
    const response = await fetch(`${API_BASE}/admin/notifications/read-all`, {
        method: 'PATCH',
        headers: { ...authHeaders() },
    });

    return parseResponse(response);
};