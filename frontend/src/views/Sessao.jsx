import "../css/Sessao.css";
import { useNavigate } from "react-router-dom";

export default function Sessao() {
  const navigate = useNavigate();

  return (
    <div className="sessao-container">

      {/* HEADER */}
      <header className="top">
        <h2>SÃO CAMILO</h2>
        <p>Nutri - Esportiva</p>
        <span className="active">● SESSÃO ATIVA</span>
      </header>

      {/* TEMPO */}
      <section className="tempo">
        <h1>00 : 38 : 15</h1>
        <p>TEMPO DA SESSÃO</p>
      </section>

      {/* CLIMA */}
      <section className="clima">
        <div><strong>Temperatura</strong><span>28°C</span></div>
        <div><strong>Umidade</strong><span>75%</span></div>
        <div><strong>Radiação</strong><span>Alta</span></div>
        <div><strong>Vento</strong><span>8%</span></div>
      </section>

      {/* INGESTÃO */}
      <section className="box">
        <h2>Registro de Ingestão</h2>

        <div className="ingestao">
          <div>
            <p>250 mL</p>
            <span>(Copo)</span>
          </div>

          <div>
            <p>500 mL</p>
            <span>(Garrafa)</span>
          </div>

          <div>
            <p>Outros</p>
          </div>
        </div>
      </section>

      {/* ALERTA */}
      <section className="alerta">
        ⚠️ Beba 200 mL a cada 15 min
      </section>

      {/* ALIMENTAÇÃO */}
      <section className="box">
        <h2>(Sólidos / Gel)</h2>
        <p>Gel de carboidrato / isotônico / barra / fruta</p>

        <textarea placeholder="Obs: conteúdo ingerido, quantidade, marca..." />
      </section>

      {/* BOTÃO */}
      <button 
        className="encerrar"
        onClick={() => navigate("/possessao")}
      >
        ENCERRAR SESSÃO DE TREINO
      </button>

    </div>
  );
}