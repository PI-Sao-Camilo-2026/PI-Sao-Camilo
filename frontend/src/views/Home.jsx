import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  return (
    <div className="home-container">
      <h1 className="home-title">SÃO CAMILO</h1>
      <p className="home-sub">Nutrição Esportiva</p>

      {usuario && (
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "8px" }}>
          Olá, {usuario.nome?.split(" ")[0]}!
        </p>
      )}

      <div className="home-buttons">
        <button className="home-btn" onClick={() => navigate("/presessao")}>
          Iniciar Sessão
        </button>

        <button className="home-btn secondary" onClick={() => navigate("/historico")}>
          Ver Histórico
        </button>

        <button
          className="home-btn"
          style={{ background: "#888", marginTop: "24px", fontSize: "13px" }}
          onClick={() => logout(navigate)}
        >
          Sair
        </button>
      </div>
    </div>
  );
}