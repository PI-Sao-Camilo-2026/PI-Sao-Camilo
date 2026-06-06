import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { usuariosApi, sessoesApi } from "../../services/api";

function GarrafaAgua({ totalMl, metaMl = 1500 }) {
  const pct = Math.min((totalMl / metaMl) * 100, 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0 24px" }}>
      <div style={{ position: "relative", width: 90, height: 160 }}>
        <svg viewBox="0 0 90 160" width="90" height="160">
          <rect x="10" y="30" width="70" height="120" rx="12" fill="#f0f4ff" stroke="#dde3f0" strokeWidth="2" />
          <rect x="28" y="12" width="34" height="22" rx="4" fill="#e8edf8" stroke="#dde3f0" strokeWidth="2" />
          <rect x="32" y="6" width="26" height="12" rx="4" fill="#9B1C2E" />
          <defs>
            <clipPath id="garrafa-clip">
              <rect x="10" y="30" width="70" height="120" rx="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#garrafa-clip)">
            <rect
              x="10"
              y={30 + 120 - (pct / 100) * 120}
              width="70"
              height={(pct / 100) * 120}
              fill="#fdeaed"
              style={{ transition: "y 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
            <path
              d={`M10,${30 + 120 - (pct / 100) * 120} q17.5,-8 35,0 q17.5,8 35,0`}
              fill="none"
              stroke="#9B1C2E"
              strokeWidth="2.5"
              opacity="0.6"
              style={{ transition: "all 0.8s ease" }}
            />
          </g>
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1E2A4A" }}>{totalMl}</div>
          <div style={{ fontSize: 11, color: "#9B1C2E", fontWeight: 600 }}>ml</div>
        </div>
      </div>
      <div style={{ width: 200, height: 4, background: "#f0f0f0", borderRadius: 2, marginTop: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#9B1C2E", borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>Meta: {metaMl} ml</div>
    </div>
  );
}

export default function Sessao() {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [urina, setUrina] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const intervalRef = useRef(null);

  const calcularTempo = () => {
    const inicio = Number(localStorage.getItem("inicioSessao") || 0);
    const pausadoTempo = Number(localStorage.getItem("tempoPausado") || 0);
    return Math.floor((Date.now() - inicio - pausadoTempo) / 1000);
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!pausado) setTempo(calcularTempo());
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [pausado]);

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  function pausar() {
    if (!pausado) {
      localStorage.setItem("inicioPausa", String(Date.now()));
      setPausado(true);
    } else {
      const ini = Number(localStorage.getItem("inicioPausa") || 0);
      const ant = Number(localStorage.getItem("tempoPausado") || 0);
      localStorage.setItem("tempoPausado", String(ant + Date.now() - ini));
      localStorage.removeItem("inicioPausa");
      setPausado(false);
    }
  }

  async function adicionarFluido(ml) {
    if (registrando) return;
    const sessaoId = localStorage.getItem("sessao_id");
    if (!sessaoId) return;

    const novoTotalLocal = Math.max(0, total + ml);
    try {
      setRegistrando(true);
      // Chamada corrigida: passa apenas o número, não um objeto
      const res = await sessoesApi.registrarFluido(sessaoId, ml);
      setTotal(res.ingestao_total_ml ?? novoTotalLocal);
    } catch (err) {
      console.error("Erro ao registrar fluido:", err);
      setTotal(novoTotalLocal);
    } finally {
      setRegistrando(false);
    }
  }

  async function encerrar() {
    const sessaoId = localStorage.getItem("sessao_id");
    if (!sessaoId) {
      alert("Sessão não encontrada");
      return;
    }
    try {
      const tempoFinal = calcularTempo();
      const duracao_minutos = tempoFinal / 60;
      await sessoesApi.finalizarSessao(sessaoId, {
        tempo_total_segundos: tempoFinal,
        ingestao_ml: total,
        volume_urina_ml: urina,
      });
      localStorage.setItem("tempoFinalSessao", String(tempoFinal));
      localStorage.setItem("totalIngerido", String(total));
      localStorage.setItem("volumeUrina", String(urina));
      localStorage.removeItem("inicioSessao");
      localStorage.removeItem("inicioPausa");
      localStorage.removeItem("tempoPausado");
      navigate("/possessao");
    } catch (err) {
      alert("Erro ao encerrar: " + err.message);
    }
  }

  const botoesFluido = [
    { label: "+200ml", ml: 200 },
    { label: "+500ml", ml: 500 },
    { label: "+750ml", ml: 750 },
  ];

  return (
    <div className="atleta-page">
      <div className="atleta-screen">
        <div className="atleta-hero">
          <button className="atleta-hero-back" onClick={() => navigate("/presessao")}>←</button>
          <h1>Novo Registro</h1>
          <p>Acompanhe sua hidratação</p>
          <div className="progress-dots">
            <span className="done" />
            <span className="active" />
            <span /><span />
          </div>
        </div>

        <div className="atleta-body">
          <div className="a-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}></div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1E2A4A", marginBottom: 4 }}>Durante o Treino</h2>
            <p style={{ fontSize: 13, color: "#999", marginBottom: 0 }}>Registre sua ingestão de líquidos</p>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#9B1C2E", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2, margin: "12px 0 0" }}>
              {fmt(tempo)}
            </div>
            <div style={{ fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: 1 }}>
              {pausado ? "PAUSADO" : "EM ANDAMENTO"}
            </div>
            <GarrafaAgua totalMl={total} />
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {botoesFluido.map(({ label, ml }) => (
                <button
                  key={ml}
                  onClick={() => adicionarFluido(ml)}
                  disabled={registrando}
                  style={{ flex: 1, padding: "14px 0", border: "1.5px solid #fdeaed", borderRadius: 12, background: "#fff", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 13, color: "#9B1C2E", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "background 0.15s" }}
                >
                  <span style={{ fontSize: 18 }}></span>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setTotal((p) => Math.max(0, p - 50))} style={{ flex: 1, padding: "8px 0", border: "1px solid #eee", borderRadius: 8, background: "#fafafa", fontSize: 12, fontWeight: 600, color: "#888", cursor: "pointer" }}>-50 mL</button>
              <button onClick={() => adicionarFluido(50)} style={{ flex: 1, padding: "8px 0", border: "1px solid #eee", borderRadius: 8, background: "#fafafa", fontSize: 12, fontWeight: 600, color: "#888", cursor: "pointer" }}>+50 mL</button>
            </div>
          </div>

          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#8a6400", fontWeight: 600, marginBottom: 14 }}>⚠️ Beba ~200 mL a cada 15 minutos</div>

          <div className="a-card">
            <div className="a-card-title">
              <div className="a-card-icon"></div>
              <h3>Volume Urinário</h3>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[-50, 50, 100].map((ml) => (
                <button key={ml} onClick={() => setUrina((p) => Math.max(0, p + ml))} style={{ flex: 1, padding: "12px 0", border: "1.5px solid #eee", borderRadius: 10, background: "#fafafa", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: 12, fontWeight: 700, color: "#555" }}>{ml > 0 ? `+${ml} mL` : `${ml} mL`}</button>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#666", fontWeight: 600 }}>Total: {urina} mL</p>
          </div>

          <button className="btn-secondary" onClick={encerrar}>Finalizar Treino <span>✓</span></button>
          <button onClick={pausar} style={{ width: "100%", padding: "12px", marginTop: 8, background: "transparent", border: "1.5px solid #eee", borderRadius: 14, fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 600, color: "#888", cursor: "pointer" }}>
            {pausado ? "▶ Retomar" : "⏸ Pausar sessão"}
          </button>
        </div>
        <BottomNav active="registro" />
      </div>
    </div>
  );
}