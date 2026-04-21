
const API_BASE = "http://127.0.0.1:8000/api";
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
    const response = await fetch(`${API_BASE}/users`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getUserById = async (id) => {
    const response = await fetch(`${API_BASE}/users/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createUser = async (data) => {
    const response = await fetch(`${API_BASE}/users`, {
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
    const response = await fetch(`${API_BASE}/users/${id}`, {
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
    const response = await fetch(`${API_BASE}/users/${id}`, {
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
    const response = await fetch(`${API_BASE}/roles`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

// =============== CAMIONS (TRUCKS) MANAGEMENT ===============
export const getCamions = async () => {
    const response = await fetch(`${API_BASE}/camions`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getCamionById = async (id) => {
    const response = await fetch(`${API_BASE}/camions/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createCamion = async (data) => {
    const response = await fetch(`${API_BASE}/camions`, {
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
    const response = await fetch(`${API_BASE}/camions/${id}`, {
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
    const response = await fetch(`${API_BASE}/camions/${id}`, {
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
    const response = await fetch(`${API_BASE}/clients`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

// =============== COMMANDES (ORDERS) MANAGEMENT ===============
export const getCommandes = async () => {
    const response = await fetch(`${API_BASE}/commandes`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const getCommandeById = async (id) => {
    const response = await fetch(`${API_BASE}/commandes/${id}`, {
        headers: { ...authHeaders() },
    });
    return parseResponse(response);
};

export const createCommande = async (data) => {
    const response = await fetch(`${API_BASE}/commandes`, {
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
    const response = await fetch(`${API_BASE}/commandes/${id}`, {
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
    const response = await fetch(`${API_BASE}/commandes/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to delete order');
    }
    return response.status === 204 ? {} : response.json();
};