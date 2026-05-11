import "../../css/Relatorios.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Relatorios() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("resultado_sessao");
    if (raw) {
      setResultado(JSON.parse(raw));
    }
  }, []);

  const taxa = resultado?.taxa_sudorese?.toFixed(2) ?? "--";
  const variacao = resultado?.variacao_peso_pct?.toFixed(1) ?? "--";
  const rec = resultado?.recomendacao;
  const textoRec = rec?.texto_ia || rec?.texto || null;
  const mlH = rec?.ingestao_recomendada_ml_h ?? "--";
  const intervalo = rec?.intervalo_minutos ?? "--";

  return (
    <div className="rel-container">
      <header className="top">
        <h2>SÃO CAMILO</h2>
        <p>Nutri - Esportiva</p>
        <span className="active">● RELATÓRIO</span>
      </header>

      <section className="titulo">
        <h1>RELATÓRIO FINAL DA SESSÃO</h1>
      </section>

      {/* Métricas principais */}
      <section className="box">
        <h2>Resultados da Sessão</h2>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={cardStyle}>
            <p style={{ fontSize: "11px", color: "#888" }}>Taxa de Sudorese</p>
            <strong style={{ fontSize: "22px", color: "#0A7C59" }}>{taxa}</strong>
            <span style={{ fontSize: "11px" }}>L/h</span>
          </div>
          <div style={{ ...cardStyle, borderColor: variacao > 2 ? "#c0392b" : "#0A7C59" }}>
            <p style={{ fontSize: "11px", color: "#888" }}>Variação de Massa</p>
            <strong style={{ fontSize: "22px", color: variacao > 2 ? "#c0392b" : "#0A7C59" }}>
              {variacao}%
            </strong>
            {variacao > 2 && (
              <span style={{ fontSize: "10px", color: "#c0392b" }}>⚠ Atenção</span>
            )}
          </div>
        </div>
      </section>

      {/* Recomendação da IA */}
      {textoRec && (
        <section className="box">
          <h2>🤖 Recomendação Personalizada</h2>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#333", marginBottom: "12px" }}>
            {textoRec}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={cardStyle}>
              <p style={{ fontSize: "11px", color: "#888" }}>Ingestão recomendada</p>
              <strong style={{ fontSize: "18px" }}>{mlH}</strong>
              <span style={{ fontSize: "11px" }}>ml/h</span>
            </div>
            <div style={cardStyle}>
              <p style={{ fontSize: "11px", color: "#888" }}>Intervalo</p>
              <strong style={{ fontSize: "18px" }}>{intervalo}</strong>
              <span style={{ fontSize: "11px" }}>min</span>
            </div>
          </div>
        </section>
      )}

      {/* Recomendações fixas */}
      <section className="box">
        <h2>Recomendações Pós-Treino</h2>
        <ul>
          <li>Reidrate com {mlH !== "--" ? `~${mlH} ml/h` : "fluidos adequados"}</li>
          <li>Priorize água e isotônicos</li>
          <li>Adicione sódio e potássio à dieta</li>
        </ul>
      </section>

      {/* Dados da sessão */}
      <section className="box">
        <h2>Dados da Sessão</h2>
        <p>Taxa de sudorese: {taxa} L/h</p>
        <p>Variação de massa: -{variacao}%</p>
        {resultado && (
          <p>Sessão ID: {resultado.sessao_id}</p>
        )}
      </section>

      <button className="btn">COMPARTILHAR COM O STAFF</button>

      <button className="btn-sair" onClick={() => {
        localStorage.removeItem("resultado_sessao");
        navigate("/home");
      }}>
        Sair
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

const cardStyle = {
  flex: 1,
  background: "#f9f9f9",
  border: "1px solid #e0e0e0",
  borderRadius: "10px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  textAlign: "center",
};