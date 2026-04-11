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

export const getCommandes = async () => {
    const response = await fetch(`${API_BASE}/commandes`, {
        headers: {
            ...authHeaders(),
        },
    });

    return parseResponse(response);
};