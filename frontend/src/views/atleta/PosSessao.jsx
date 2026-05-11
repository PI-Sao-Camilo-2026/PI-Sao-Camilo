import "../../css/Pos-Sessao.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sessoesApi } from "../../services/api";

export default function PosSessao() {
  const navigate = useNavigate();

  const [tempoFinal, setTempoFinal] = useState("00 : 00 : 00");
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [totalIngerido, setTotalIngerido] = useState(0);
  const [volumeUrina, setVolumeUrina] = useState(0);
  const [pesoPre, setPesoPre] = useState(0);
  const [pesoPos, setPesoPos] = useState("");
  const [vestimenta, setVestimenta] = useState("umido");
  const [duracao, setDuracao] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tempoSalvo = Number(localStorage.getItem("tempoFinalSessao") || 0);
    const totalSalvo = Number(localStorage.getItem("totalIngerido") || 0);
    const urinaSalva = Number(localStorage.getItem("volumeUrina") || 0);
    const pesoPre = Number(localStorage.getItem("peso_pre") || 0);

    setTempoSegundos(tempoSalvo);
    setTempoFinal(formatarTempo(tempoSalvo));
    setTotalIngerido(totalSalvo);
    setVolumeUrina(urinaSalva);
    setPesoPre(pesoPre);

    setDuracao(String(Math.round(tempoSalvo / 60)));
  }, []);

  const formatarTempo = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const seg = s % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(seg).padStart(2, "0")}`;
  };

  const perdaPct = pesoPre && pesoPos
    ? Number((((pesoPre - Number(pesoPos)) / pesoPre) * 100).toFixed(2))
    : 0;

  async function finalizarSessao() {
    if (!pesoPos || isNaN(Number(pesoPos)) || Number(pesoPos) <= 0) {
      alert("Digite o peso pós-sessão");
      return;
    }

    const duracaoMin = Number(duracao);
    if (!duracaoMin || duracaoMin <= 0) {
      alert("Duração inválida");
      return;
    }

    const sessaoId = localStorage.getItem("sessao_id");
    if (!sessaoId) { alert("Sessão não encontrada"); return; }

    try {
      setLoading(true);

      const res = await sessoesApi.finalizarPosTreino({
        sessao_id: Number(sessaoId),
        peso_pos: Number(pesoPos),
        condicao_vestimenta: vestimenta,
        duracao_minutos: duracaoMin,
        total_ingerido_ml: totalIngerido,
        volume_urina_ml: volumeUrina,
      });

      localStorage.setItem("resultado_sessao", JSON.stringify(res));
      localStorage.removeItem("sessao_id");
      localStorage.removeItem("peso_pre");
      localStorage.removeItem("tempoFinalSessao");
      localStorage.removeItem("totalIngerido");
      localStorage.removeItem("volumeUrina");
      localStorage.removeItem("climaSessao");

      navigate("/relatorios");
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar sessão: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pos-page">
      <header className="pos-header">
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
          <span className="status-pill">● PÓS-SESSÃO</span>
          <span className="bell">🔔</span>
          <span className="menu">☰</span>
        </div>
      </header>

      <section className="athlete-area">
        <img className="athlete-icon" src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png" alt="Atleta" />
        <div>
          <h2>Sessão finalizada</h2>
          <p>Resumo geral da hidratação e indicadores da sessão.</p>
        </div>
        <span className="athlete-code">SC / ATL - 0000</span>
      </section>

      <section className="steps-line">
        <div className="step-item complete"><span>1</span><p>PRÉ</p></div>
        <div className="line complete-line"></div>
        <div className="step-item complete"><span>2</span><p>DURANTE</p></div>
        <div className="line complete-line"></div>
        <div className="step-item active"><span>3</span><p>PÓS</p></div>
        <div className="line"></div>
        <div className="step-item"><span>4</span><p>RELATÓRIO</p></div>
      </section>

      <section className="tempo-card">
        <p>TEMPO TOTAL DA SESSÃO</p>
        <h1>{tempoFinal}</h1>
      </section>

      <section className="summary-card">
        <div className="card-title"><span>💧</span><h3>Resumo de Ingestão</h3></div>
        <div className="summary-grid">
          <div><strong>Água</strong><span>{totalIngerido} mL</span></div>
          <div><strong>Isotônico</strong><span>0 mL</span></div>
          <div><strong>Outros</strong><span>0 mL</span></div>
        </div>
        <p className="summary-total">TOTAL INGERIDO: {totalIngerido} mL</p>
        <div className="summary-grid">
          <div><strong>Urina</strong><span>{volumeUrina} mL</span></div>
          <div><strong>Gel</strong><span>0 g</span></div>
          <div><strong>Fruta</strong><span>0 g</span></div>
        </div>
        <p className="summary-total">VOLUME URINÁRIO: {volumeUrina} mL</p>
      </section>

      <section className="summary-card">
        <div className="card-title"><span>⚖️</span><h3>Peso corporal</h3></div>
        <div className="peso-grid">
          <div><small>Pré</small><strong>{pesoPre} kg</strong></div>
          <div>
            <small>Pós</small>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 72,5"
              value={pesoPos}
              onChange={(e) => setPesoPos(e.target.value)}
            />
          </div>
        </div>
        {perdaPct > 0 && <p className="normal-info">Perda de {perdaPct}%</p>}

        {/* Duração e vestimenta */}
        <div style={{ marginTop: "12px" }}>
          <label style={{ fontSize: "12px", color: "#666" }}>Duração real (min)</label>
          <input
            type="number"
            value={duracao}
            onChange={(e) => setDuracao(e.target.value)}
            style={{ width: "100%", marginTop: "4px", padding: "6px", border: "1px solid #ddd", borderRadius: "6px" }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label style={{ fontSize: "12px", color: "#666" }}>Condição da vestimenta</label>
          <select
            value={vestimenta}
            onChange={(e) => setVestimenta(e.target.value)}
            style={{ width: "100%", marginTop: "4px", padding: "6px", border: "1px solid #ddd", borderRadius: "6px" }}
          >
            <option value="seco">Seco</option>
            <option value="umido">Úmido</option>
            <option value="encharcado">Encharcado</option>
          </select>
        </div>
      </section>

      <button
        className="finalizar"
        onClick={finalizarSessao}
        disabled={loading}
      >
        {loading ? "PROCESSANDO..." : "GERAR RELATÓRIO"} <span>➜</span>
      </button>
    </div>
  );
}