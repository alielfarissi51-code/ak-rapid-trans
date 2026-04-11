const API="http://localhost:8080";
export const login = (data)=>fetch(`${API}/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
});
export const getCommandes = () => fetch(`${API}/commandes`).then(res => res.json());