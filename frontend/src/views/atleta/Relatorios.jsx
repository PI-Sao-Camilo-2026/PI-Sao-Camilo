import "../../css/Relatorios.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Relatorios() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("resultado_sessao");
    if (raw) setResultado(JSON.parse(raw));
  }, []);

  const taxa = resultado?.taxa_sudorese?.toFixed(2) ?? "--";
  const variacao = resultado?.variacao_peso_pct?.toFixed(1) ?? "--";
  const rec = resultado?.recomendacao;
  const textoRec = rec?.texto_ia || rec?.texto || null;
  const mlH = rec?.ingestao_recomendada_ml_h ?? "--";
  const intervalo = rec?.intervalo_minutos ?? "--";
  const variacaoNumero = Number(variacao);
  const variacaoAlta = variacaoNumero > 2;

  return (
    <div className="rel-container">
      <header className="rel-header">
        <div className="brand-area">
          <div className="brand-logo">
            <img className="brand-logo-img" src="/R.png" alt="São Camilo" />
          </div>
          <div>
            <h1>SÃO CAMILO</h1>
            <p>Nutri - Esportiva</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="status-pill">● RELATÓRIO</span>
          <span className="bell">🔔</span>
          <span className="menu">☰</span>
        </div>
      </header>

      <section className="rel-atleta-area">
        <img
          className="atleta-icon"
          src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png"
          alt="Atleta"
        />
        <div>
          <h2>Relatório final</h2>
          <p>Resumo da hidratação, sudorese e recomendações pós-sessão.</p>
        </div>
        <span className="atleta-codigo">SC / ATL - 0000</span>
      </section>

      <section className="steps-line">
        <div className="step-item complete"><span>1</span><p>PRÉ</p></div>
        <div className="line complete-line"></div>
        <div className="step-item complete"><span>2</span><p>DURANTE</p></div>
        <div className="line complete-line"></div>
        <div className="step-item complete"><span>3</span><p>PÓS</p></div>
        <div className="line complete-line"></div>
        <div className="step-item active"><span>4</span><p>RELATÓRIO</p></div>
      </section>

      <section className="rel-titulo">
        <span></span>
        <h2>RELATÓRIO FINAL DA SESSÃO</h2>
      </section>

      <section className="rel-card">
        <div className="card-title">
          <span>📊</span>
          <h3>Resultados da Sessão</h3>
        </div>

        <div className="metric-grid">
          <div className="metric-card">
            <p>Taxa de Sudorese</p>
            <strong>{taxa}</strong>
            <span>L/h</span>
          </div>

          <div className={variacaoAlta ? "metric-card danger" : "metric-card success"}>
            <p>Variação de Massa</p>
            <strong>{variacao}%</strong>
            <span>{variacaoAlta ? "⚠ Atenção" : "Adequado"}</span>
          </div>
        </div>
      </section>

      {textoRec && (
        <section className="rel-card">
          <div className="card-title blue">
            <span>🤖</span>
            <h3>Recomendação Personalizada</h3>
          </div>

          <p className="rel-text">{textoRec}</p>

          <div className="metric-grid">
            <div className="metric-card">
              <p>Ingestão recomendada</p>
              <strong>{mlH}</strong>
              <span>ml/h</span>
            </div>

            <div className="metric-card">
              <p>Intervalo</p>
              <strong>{intervalo}</strong>
              <span>min</span>
            </div>
          </div>
        </section>
      )}

      <section className="rel-card">
        <div className="card-title">
          <span>💧</span>
          <h3>Recomendações Pós-Treino</h3>
        </div>

        <ul className="rel-list">
          <li>Reidrate com {mlH !== "--" ? `~${mlH} ml/h` : "fluidos adequados"}</li>
          <li>Priorize água e isotônicos</li>
          <li>Adicione sódio e potássio à dieta</li>
        </ul>
      </section>

      <section className="rel-card">
        <div className="card-title blue">
          <span>📝</span>
          <h3>Dados da Sessão</h3>
        </div>

        <div className="data-list">
          <p><strong>Taxa de sudorese:</strong> {taxa} L/h</p>
          <p><strong>Variação de massa:</strong> -{variacao}%</p>
          {resultado && <p><strong>Sessão ID:</strong> {resultado.sessao_id}</p>}
        </div>
      </section>

      <button className="btn">COMPARTILHAR COM O STAFF</button>

      <button
        className="btn-sair"
        onClick={() => {
          localStorage.removeItem("resultado_sessao");
          navigate("/home");
        }}
      >
        SAIR
      </button>

      <nav className="bottom-nav">
        <div onClick={() => navigate("/home")}><span>⌂</span><p>INÍCIO</p></div>
        <div onClick={() => navigate("/historico")}><span>▤</span><p>HISTÓRICO</p></div>
        <div><span>♡</span><p>OBSERVAÇÕES</p></div>
        <div><span>♙</span><p>PERFIL</p></div>
      </nav>
    </div>
  );
}