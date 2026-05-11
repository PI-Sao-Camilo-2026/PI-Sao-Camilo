// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { authApi, getUsuario, setUsuario, setToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [usuario, setUsuarioState] = useState(null);
const [carregando, setCarregando] = useState(true);

useEffect(() => {
    const u = getUsuario();
    if (u) setUsuarioState(u);
    setCarregando(false);
}, []);

async function login(email, senha) {
    const data = await authApi.login(email, senha);
    const u = { id: data.usuario_id, nome: data.nome, tipo: data.tipo_usuario };
    setUsuarioState(u);
    return u;
}

function logout(navigate) {
    authApi.logout();
    setUsuarioState(null);
    if (navigate) navigate("/");
}

return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
    {children}
    </AuthContext.Provider>
);
}

export function useAuth() {
const ctx = useContext(AuthContext);
if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
return ctx;
}