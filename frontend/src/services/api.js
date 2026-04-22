const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
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

    return parseResponse(response);
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

    return parseResponse(response);
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