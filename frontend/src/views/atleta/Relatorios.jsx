// src/views/atleta/Relatorios.jsx
import "../../css/Relatorios.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

import { useAuth } from "../../contexts/AuthContext";
import { usuariosApi } from "../../services/api";

export default function Relatorios() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("resultado_sessao");
    if (raw) setResultado(JSON.parse(raw));
  }, []);

  const taxa = resultado?.taxa_sudorese;
  const variacao = resultado?.variacao_peso_pct;
  const rec = resultado?.recomendacao;
  const textoIA = rec?.texto_ia || rec?.texto;
  const mlH = rec?.ingestao_recomendada_ml_h;
  const intervalo = rec?.intervalo_minutos;

  // Classificação da variação de massa
  const classificarVariacao = (v) => {
    if (!v) return { label: "—", cor: "#999", bg: "#f5f5f5" };
    if (v <= 1) return { label: "Excelente", cor: "#0A7C59", bg: "#e6f5f1" };
    if (v <= 2) return { label: "Adequado", cor: "#B45309", bg: "#fef3c7" };
    return { label: "Atenção", cor: "#9B1C2E", bg: "#fdeaed" };
  };

  const varClass = classificarVariacao(variacao);

  function novoRegistro() {
    localStorage.removeItem("resultado_sessao");
    navigate("/presessao");
  }

  return (
    <div className="atleta-page">
      <div className="atleta-screen">

        {/* Hero */}
        <div className="atleta-hero">
          <h1>Novo Registro</h1>
          <p>Acompanhe sua hidratação</p>
          <div className="progress-dots">
            <span className="done" />
            <span className="done" />
            <span className="done" />
            <span className="active" />
          </div>
        </div>

        <div className="atleta-body">

          {/* Badge análise concluída */}
          <div style={{
            textAlign: "center", marginBottom: 4,
          }}>
            <span style={{
              background: "#fdeaed", color: "#9B1C2E",
              fontSize: 10, fontWeight: 800, letterSpacing: 1.2,
              padding: "4px 12px", borderRadius: 20,
              textTransform: "uppercase",
            }}>
              Análise Concluída
            </span>
          </div>

          <h2 style={{
            textAlign: "center", fontSize: 22, fontWeight: 800,
            color: "#1a1a1a", marginBottom: 20,
          }}>
            Seu Relatório
          </h2>

          {/* Métricas principais */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {/* Taxa de sudorese */}
            <div style={{
              flex: 1, background: "#fff", border: "1px solid #ebebeb",
              borderRadius: 14, padding: "16px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Taxa de Sudorese
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#9B1C2E", lineHeight: 1 }}>
                {taxa ? taxa.toFixed(2) : "—"}
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>L/h</div>
            </div>

            {/* Variação de peso */}
            <div style={{
              flex: 1, background: "#fff", border: "1px solid #ebebeb",
              borderRadius: 14, padding: "16px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
                Variação de Peso
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: varClass.cor, lineHeight: 1 }}>
                {variacao ? `${variacao.toFixed(1)}%` : "—"}
              </div>
              <div style={{ fontSize: 11, color: varClass.cor, marginTop: 4, fontWeight: 600 }}>
                {varClass.label}
              </div>
            </div>
          </div>

          {/* Recomendação da IA */}
          {textoIA && (
            <div style={{
              background: "#fdeaed",
              border: "1px solid #f5c0c0",
              borderRadius: 14, padding: "18px 16px",
              marginBottom: 16,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 16 }}>〜</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#9B1C2E" }}>
                  Recomendação da IA
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#5a0a1a", lineHeight: 1.65, marginBottom: 14 }}>
                {textoIA}
              </p>

              {/* Métricas da recomendação */}
              {(mlH || intervalo) && (
                <div style={{ display: "flex", gap: 10 }}>
                  {mlH && (
                    <div style={{
                      flex: 1, background: "rgba(255,255,255,0.6)",
                      borderRadius: 10, padding: "12px 10px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 10, color: "#9B1C2E", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
                        Ingestão
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#9B1C2E", marginTop: 4 }}>
                        {mlH.toFixed(0)}
                      </div>
                      <div style={{ fontSize: 11, color: "#9B1C2E" }}>ml/h</div>
                    </div>
                  )}
                  {intervalo && (
                    <div style={{
                      flex: 1, background: "rgba(255,255,255,0.6)",
                      borderRadius: 10, padding: "12px 10px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 10, color: "#9B1C2E", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
                        Intervalo
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#9B1C2E", marginTop: 4 }}>
                        {intervalo}
                      </div>
                      <div style={{ fontSize: 11, color: "#9B1C2E" }}>min</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Alerta de variação alta */}
          {variacao > 2 && (
            <div style={{
              background: "#fff8e1", border: "1px solid #ffe082",
              borderRadius: 12, padding: "14px 16px", marginBottom: 16,
              fontSize: 13, color: "#8a6400", lineHeight: 1.5,
            }}>
              ⚠️ <strong>Perda de massa acima de 2%.</strong> Aumente a hidratação pré-treino e consulte seu profissional.
            </div>
          )}

          {/* Dicas pós-treino */}
          <div className="a-card" style={{ marginBottom: 16 }}>
            <div className="a-card-title">
              <div className="a-card-icon">💡</div>
              <h3>Dicas Pós-Treino</h3>
            </div>
            <ul style={{ paddingLeft: 16, fontSize: 13, color: "#555", lineHeight: 1.8 }}>
              <li>Reidrate com {mlH ? `~${mlH.toFixed(0)} ml` : "bastante líquido"} nas próximas horas</li>
              <li>Priorize água e isotônicos para repor eletrólitos</li>
              <li>Adicione sódio e potássio à alimentação</li>
              <li>Monitore a cor da urina para confirmar reidratação</li>
            </ul>
          </div>

          {/* Botão novo registro */}
          <button className="btn-outline" onClick={novoRegistro}>
            Novo Registro
          </button>
        </div>

        <BottomNav active="registro" />
      </div>
    </div>
  );
}