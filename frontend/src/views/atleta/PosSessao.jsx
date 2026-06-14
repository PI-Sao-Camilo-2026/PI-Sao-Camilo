// src/views/atleta/PosSessao.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
// import { usuariosApi } from "../../services/api";
import BottomNav from "../../components/BottomNav";
import { usuariosApi, sessoesApi } from "../../services/api";

const vestimentaOpts = [
  { value: "seco", label: "Sem alteração (seco)" },
  { value: "umido", label: "Pouca alteração (úmido)" },
  { value: "encharcado", label: "Muita alteração (encharcado)" },
];

const sintomasGIOpts = [
  "Náusea",
  "Enjoo",
  "Vômito",
  "Azia",
  "Refluxo",
  "Dor abdominal",
  "Distensão abdominal",
  "Diarreia",
  "Desconforto gastrointestinal",
];

export default function PosSessao() {
  const navigate = useNavigate();

  const [pesoPos, setPesoPos] = useState("");
  const [vestimenta, setVestimenta] = useState("");
  const [vestimentaPre, setVestimentaPre] = useState("");
  const [fadiga, setFadiga] = useState(5);
  const [sede, setSede] = useState(3);
  const [sintomasGI, setSintomasGI] = useState([]);
  const [observacaoGI, setObservacaoGI] = useState("");
  const [duracao, setDuracao] = useState("");
  const [pesoPre, setPesoPre] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setPesoPre(Number(localStorage.getItem("peso_pre") || 0));
    const tempoSeg = Number(localStorage.getItem("tempoFinalSessao") || 0);
    setDuracao(String(Math.max(1, Math.round(tempoSeg / 60))));
    setVestimentaPre(localStorage.getItem("vestimenta_pre") || "");
  }, []);

  const perdaPct = pesoPre && pesoPos
    ? (((pesoPre - Number(pesoPos)) / pesoPre) * 100).toFixed(1)
    : null;

  const vestimentaPreLabel = {
    leve: "Leve (short, camiseta)",
    medio: "Médio (calça, manga longa)",
    pesado: "Pesado (agasalho, impermeável)",
  }[vestimentaPre];

  function toggleSintoma(sintoma) {
  setSintomasGI((prev) =>
    prev.includes(sintoma)
      ? prev.filter((s) => s !== sintoma)
      : [...prev, sintoma]
  );
}

  async function handleFinalizar() {
    if (!pesoPos || isNaN(Number(pesoPos))) { setErro("Informe a massa corporal final"); return; }
    if (!vestimenta) { setErro("Selecione a condição da vestimenta"); return; }
    const duracaoMin = Number(duracao);
    if (!duracaoMin || duracaoMin <= 0) { setErro("Duração inválida"); return; }
    const sessaoId = localStorage.getItem("sessao_id");
    if (!sessaoId) { setErro("Sessão não encontrada"); return; }
    setErro("");

    try {
      setLoading(true);
      const res = await sessoesApi.finalizarPosTreino({
        sessao_id: Number(sessaoId),
        peso_pos: Number(pesoPos),
        condicao_vestimenta: vestimenta,
        duracao_minutos: duracaoMin,
        total_ingerido_ml: Number(localStorage.getItem("totalIngerido") || 0),
        volume_urina_ml: Number(localStorage.getItem("volumeUrina") || 0),
        sintomas:
          sintomasGI.length > 0
            ? `${sintomasGI.join(", ")}${observacaoGI
              ? ` | Observação: ${observacaoGI}`
              : ""
            }`
            : observacaoGI,
      });

      localStorage.setItem("resultado_sessao", JSON.stringify(res));
      // Limpa dados de sessão
      ["sessao_id", "peso_pre", "tempoFinalSessao", "totalIngerido", "volumeUrina", "climaSessao", "inicioSessao", "vestimenta_pre"]
        .forEach(k => localStorage.removeItem(k));

      navigate("/relatorios");
    } catch (err) {
      setErro(err.message || "Erro ao finalizar sessão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atleta-page">
      <div className="atleta-screen">

        {/* Hero */}
        <div className="atleta-hero">
          <button className="atleta-hero-back" onClick={() => navigate("/sessao")}>←</button>
          <h1>Novo Registro</h1>
          <p>Acompanhe sua hidratação</p>
          <div className="progress-dots">
            <span className="done" />
            <span className="done" />
            <span className="active" />
            <span />
          </div>
        </div>

        <div className="atleta-body">

          {/* Peso pós */}
          <div className="a-card">
            <div className="a-card-title">
              <h3>Pós-Treino</h3>
            </div>

            <div className="a-label">Massa Corporal Final (kg)</div>
            <input
              className="a-input"
              type="number"
              step="0.1"
              placeholder="00.0"
              value={pesoPos}
              onChange={(e) => setPesoPos(e.target.value)}
            />

            {perdaPct !== null && (
              <div style={{
                textAlign: "center", padding: "8px 12px",
                background: Number(perdaPct) > 2 ? "#fef0f0" : "#e6f5f1",
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: Number(perdaPct) > 2 ? "#9B1C2E" : "#0A7C59",
                marginTop: -6, marginBottom: 14,
              }}>
                {Number(perdaPct) > 0 ? `Perda de ${perdaPct}%` : `Ganho de ${Math.abs(Number(perdaPct))}%`}
                {Number(perdaPct) > 2 && "Aviso: "}
              </div>
            )}
          </div>

          {/* Vestimenta */}
          <div className="a-card">
            <div className="a-card-title">
              <h3>Condição da Vestimenta</h3>
            </div>

            {vestimentaPreLabel && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f7f7f7", borderRadius: 8,
                padding: "8px 12px", marginBottom: 12,
                fontSize: 12, color: "#666",
              }}>
                <span>Você iniciou com: <strong style={{ color: "#1a1a1a" }}>{vestimentaPreLabel}</strong></span>
              </div>
            )}

            <div className="a-label" style={{ marginBottom: 10 }}>Como está a roupa agora?</div>
            {vestimentaOpts.map((opt) => (
              <div
                key={opt.value}
                className={`radio-option ${vestimenta === opt.value ? "selected" : ""}`}
                onClick={() => setVestimenta(opt.value)}
              >
                <div className="radio-circle" />
                <span>{opt.icon} {opt.label}</span>
              </div>
            ))}
          </div>

          {/* Fadiga */}
          <div className="a-card">
            <div className="a-card-title">
              <h3>Percepção de Esforço</h3>
            </div>

            <div className="a-label">Nível de Fadiga (0–10)</div>
            <div className="slider-wrap">
              <div className="slider-value">
                <strong>{fadiga}</strong>
                <span>{fadiga <= 3 ? "Leve" : fadiga <= 6 ? "Moderada" : fadiga <= 8 ? "Alta" : "Máxima"}</span>
              </div>
              <input
                type="range" min="0" max="10" value={fadiga}
                onChange={(e) => setFadiga(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 4 }}>
                <span>Sem esforço</span><span>Máximo</span>
              </div>
            </div>

            <div className="a-label" style={{ marginTop: 12 }}>Nível de Sede (0–5)</div>
            <div className="slider-wrap">
              <div className="slider-value">
                <strong>{sede}</strong>
                <span>{sede === 0 ? "Sem sede" : sede <= 2 ? "Pouca" : sede <= 4 ? "Moderada" : "Muita sede"}</span>
              </div>
              <input
                type="range" min="0" max="5" value={sede}
                onChange={(e) => setSede(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Sintomas */}
          <div className="a-card">
            <div className="a-card-title">
              <h3>Sintomas Gastrointestinais</h3>
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 12,
              }}
            >
              Marque qualquer desconforto ocorrido durante ou após o treino.
            </div>

            {sintomasGIOpts.map((sintoma) => (
              <div
                key={sintoma}
                className={`radio-option ${sintomasGI.includes(sintoma) ? "selected" : ""
                  }`}
                onClick={() => toggleSintoma(sintoma)}
                
              >
                <div className="radio-circle" />
                <span>{sintoma}</span>
              </div>
            ))}

            <div
              style={{
                marginTop: 16,
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Observações adicionais
            </div>

            <textarea
              value={observacaoGI}
              onChange={(e) => setObservacaoGI(e.target.value)}
              placeholder="Descreva detalhes do desconforto, se desejar..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #ebebeb",
                borderRadius: 10,
                fontFamily: "'Barlow', sans-serif",
                fontSize: 14,
                color: "#333",
                resize: "none",
                outline: "none",
                background: "#fafafa",
              }}
            />
          </div>

          {erro && <div className="a-erro">{erro}</div>}

          <button className="btn-primary" onClick={handleFinalizar} disabled={loading}>
            {loading ? "Processando..." : "Ver Resultados"}{" "}
            {!loading && <span style={{ fontSize: 16 }}>〜</span>}
          </button>
        </div>

        <BottomNav active="registro" />
      </div>
    </div>
  );
}