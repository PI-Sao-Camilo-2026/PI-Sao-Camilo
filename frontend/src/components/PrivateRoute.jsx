import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Protege rotas que exigem login.
 * @param {string} tipo - "atleta" | "profissional" | undefined (qualquer logado)
 */
export default function PrivateRoute({ children, tipo }) {
const { usuario, carregando } = useAuth();

if (carregando) {
    return (
    <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-sm">Carregando...</span>
    </div>
    );
}

if (!usuario) return <Navigate to="/" replace />;

if (tipo && usuario.tipo !== tipo) {
    return <Navigate to={usuario.tipo === "profissional" ? "/homepage" : "/home"} replace />;
}

return children;
}