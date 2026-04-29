import "../css/Historicos.css";
import { useNavigate } from "react-router-dom";

export default function Historicos() {
  const navigate = useNavigate();

  return (
    <div className="hist-container">

      {/* HEADER */}
      <header className="top">
        <h2>SÃO CAMILO</h2>
        <p>Nutri - Esportiva</p>
        <span className="active">● HISTÓRICOS</span>
      </header>

      {/* TÍTULO */}
      <section className="titulo">
        <h1>Histórico de Sessões</h1>
      </section>

      {/* LISTA */}
      <section className="lista">

        <div className="item">
          <p><strong>Data:</strong> 12/05/2026</p>
          <p><strong>Duração:</strong> 01:20:30</p>
          <p><strong>Déficit:</strong> -500 kcal</p>
        </div>

        <div className="item">
          <p><strong>Data:</strong> 10/05/2026</p>
          <p><strong>Duração:</strong> 00:58:10</p>
          <p><strong>Déficit:</strong> -320 kcal</p>
        </div>

        <div className="item">
          <p><strong>Data:</strong> 08/05/2026</p>
          <p><strong>Duração:</strong> 01:35:00</p>
          <p><strong>Déficit:</strong> -710 kcal</p>
        </div>

      </section>

      {/* BOTÃO VOLTAR */}
      <button 
        className="btn-voltar"
        onClick={() => navigate("/")}
      >
        Voltar para Home
      </button>

    </div>
  );
}