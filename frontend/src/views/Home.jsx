import "../css/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">

      <h1 className="home-title">SÃO CAMILO</h1>
      <p className="home-sub">Nutrição Esportiva</p>

      <div className="home-buttons">
  <button 
    className="home-btn"
    onClick={() => navigate("/presessao")}
  >
    Iniciar Sessão
  </button>

  <button 
    className="home-btn secondary"
    onClick={() => navigate("/historicos")}
  >
    Ver Históricos
  </button>

  <button 
    className="home-btn medico"
    onClick={() => navigate("/homepage")}
  >
    Entrar
  </button>

    <button 
    className="atletas-btn medico"
    onClick={() => navigate("/atletas")}
  >
    Entrar Atletas
  </button>
</div>

    </div>
  );
}