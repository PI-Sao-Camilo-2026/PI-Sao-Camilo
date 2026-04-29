import "../css/Relatorios.css";
import { useNavigate } from "react-router-dom";

export default function Relatorios() {
    const navigate = useNavigate();
  return (
    <div className="rel-container">

      {/* HEADER */}
      <header className="top">
        <h2>SÃO CAMILO</h2>
        <p>Nutri - Esportiva</p>
        <span className="active">● RELATÓRIO</span>
      </header>

      {/* TÍTULO */}
      <section className="titulo">
        <h1>RELATÓRIO FINAL DA SESSÃO</h1>
      </section>

      {/* RESUMO PERFORMANCE */}
      <section className="box">
        <h2>Resumo de Performance</h2>

        <p><strong>Saldo metabólico:</strong> -630 kcal</p>

        <div className="grafico">
          <div className="bar perdido" style={{ height: "60%" }}>
            <span>Perdido</span>
          </div>
          <div className="bar ingerido" style={{ height: "40%" }}>
            <span>Ingerido</span>
          </div>
        </div>

        <p className="legenda">Balanço hídrico (mL)</p>
      </section>

      {/* INGESTÃO */}
      <section className="box">
        <h2>Ingestão Nutricional</h2>

        <div className="progress">
          <div className="p1">Sódio 69%</div>
        </div>

        <div className="progress">
          <div className="p2">Açúcares 31%</div>
        </div>
      </section>

      {/* RECOMENDAÇÕES */}
      <section className="box">
        <h2>Recomendações Pós-Treino</h2>

        <ul>
          <li>Reidratação: ingerir 1,8L de líquidos</li>
          <li>Priorizar água e isotônicos</li>
          <li>Adicionar sódio e potássio</li>
        </ul>
      </section>

      {/* DADOS */}
      <section className="box">
        <h2>Dados da Sessão</h2>

        <p>Variação de massa: -1,6%</p>
        <p>Taxa de sudorese: --</p>
        <p>Esforço (Borg): 15</p>
        <p>Tipo de atividade: Treino</p>
        <p>Tempo: 01:25:54</p>
        <p>Data: --</p>
      </section>

      {/* BOTÃO */}
      <button className="btn">
        COMPARTILHAR COM O STAFF
      </button>

<button className="btn-sair" onClick={() => navigate("/home")}>
  Sair
</button>
    </div>
  );
}