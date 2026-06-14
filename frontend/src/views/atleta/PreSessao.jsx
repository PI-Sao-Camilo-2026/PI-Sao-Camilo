// src/views/atleta/PreSessao.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { climaApi, sessoesApi } from "../../services/api";


const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const vestimentaOpts = [
  { value: "leve",    label: "Leve (short, camiseta)" },
  { value: "medio",   label: "Médio (calça, manga longa)" },
  { value: "pesado",  label: "Pesado (agasalho, impermeável)" },
];

export default function PreSessao() {
  const navigate = useNavigate();

  const [peso, setPeso] = useState("");
  const [urina, setUrina] = useState("");
  const [vestimenta, setVestimenta] = useState("");
  const [temp, setTemp] = useState("");
  const [umidade, setUmidade] = useState("");
  const [clima, setClima] = useState(null);
  const [loading, setLoading] = useState(false);
  const [climaLoading, setClimaLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    climaApi.buscarAutomatico()
      .then((c) => {
        if (!ativo) return;
        setClima(c);
        setTemp(String(c.temperatura ?? ""));
        setUmidade(String(c.umidade ?? ""));
      })
      .catch(() => {
        setTemp("25");
        setUmidade("60");
      })
      .finally(() => setClimaLoading(false));

    return () => { ativo = false; };
  }, []);

  const nivelUrina = Number(urina);
  const msgUrina =
    nivelUrina >= 1 && nivelUrina <= 3 ? { texto: "Hidratado ", cor: "#0A7C59" } :
      nivelUrina >= 4 && nivelUrina <= 5 ? { texto: "Atenção — beba água", cor: "#E68A10" } :
        nivelUrina >= 6 ? { texto: "Desidratado — beba água agora!", cor: "#9B1C2E" } : null;

  async function handleIniciar() {
    const pesoNum = Number(peso.replace(",", "."));
    if (!peso || isNaN(pesoNum) || pesoNum <= 0) { setErro("Informe sua massa corporal"); return; }
    if (!urina) { setErro("Selecione a cor da urina"); return; }
    if (!vestimenta) { setErro("Selecione a condição da vestimenta"); return; }
    setErro("");

    try {
      setLoading(true);
      const data = await sessoesApi.iniciarPreTreino({
        peso_pre: pesoNum,
        temp_celsius: temp ? Number(temp) : null,
        umidade_pct: umidade ? Number(umidade) : null,
        cor_urina_basal: Number(urina),
        sensacao_termica: clima?.sensacaoTermica ? Number(clima.sensacaoTermica) : null,
        vento: clima?.vento ? Number(clima.vento) : null,
        condicao: clima?.condicao || null,
        sol: clima?.sol || null,
        bexiga_esvaziada: true,
        vestimenta_pre: vestimenta,
      });

      localStorage.setItem("sessao_id", String(data.id));
      localStorage.setItem("peso_pre", String(pesoNum));
      localStorage.setItem("inicioSessao", String(Date.now()));
      localStorage.setItem("climaSessao", JSON.stringify(clima || {}));
      localStorage.setItem("vestimenta_pre", vestimenta);
      localStorage.removeItem("tempoPausado");

      navigate("/sessao");
    } catch (err) {
      setErro(err.message || "Erro ao iniciar sessão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atleta-page">
      <div className="atleta-screen">

        {/* Hero */}
        <div className="atleta-hero">
          <h1>Novo Registro</h1>
          <p>Acompanhe sua hidratação</p>
          <div className="progress-dots">
            <span className="active" />
            <span /><span /><span />
          </div>
        </div>

        <div className="atleta-body">

          {/* Card Pré-Treino */}
          <div className="a-card">
            <div className="a-card-title">
              {/* <div className="a-card-icon"></div> */}
              <h3>Pré-Treino</h3>
            </div>

            <div className="a-label">
              Massa Corporal (kg) <InfoIcon />
            </div>
            <input
              className="a-input"
              type="number"
              step="0.1"
              placeholder="00.0"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />

            <div className="a-input-row">
              <div className="a-input-half">
                <div className="a-label">Temp (°C)</div>
                <input
                  className="a-input-sm"
                  type="number"
                  placeholder={climaLoading ? "..." : "25"}
                  value={temp}
                  readOnly
                  disabled
                />
              </div>
              <div className="a-input-half">
                <div className="a-label">Umidade (%)</div>
                <input
                  className="a-input-sm"
                  type="number"
                  placeholder={climaLoading ? "..." : "60"}
                  value={umidade}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Clima chips */}
            {clima && (
              <div className="weather-chips" style={{ marginBottom: 16 }}>
                <div className="weather-chip">
                  <span className="w-icon">☀️</span>
                  <small>Sensação</small>
                  <strong>{clima.sensacaoTermica ? `${clima.sensacaoTermica}°` : "--"}</strong>
                </div>
                <div className="weather-chip">
                  <span className="w-icon">💨</span>
                  <small>Vento</small>
                  <strong>{clima.vento ? `${clima.vento}km/h` : "--"}</strong>
                </div>
                <div className="weather-chip">
                  <span className="w-icon">☁️</span>
                  <small>Condição</small>
                  <strong style={{ fontSize: 9 }}>{clima.condicao?.slice(0, 10) || "--"}</strong>
                </div>
                <div className="weather-chip">
                  <span className="w-icon">🌤️</span>
                  <small>Radiação</small>
                  <strong>{clima.sol || "--"}</strong>
                </div>
              </div>
            )}

            {/* Urina */}
            <div className="a-label">Cor da Urina Basal</div>
            <div className="urina-scale">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <label
                  key={n}
                  className={`urina-box urina-${n} ${urina === String(n) ? "selected" : ""}`}
                >
                  <input type="radio" name="urina" value={n} onChange={() => setUrina(String(n))} />
                  {n}
                </label>
              ))}
            </div>
            <div className="urina-labels">
              <span>Hidratado</span>
              <span>Desidratado</span>
            </div>

            {msgUrina && (
              <div style={{ fontSize: 12, fontWeight: 600, color: msgUrina.cor, marginBottom: 8, textAlign: "center" }}>
                {msgUrina.texto}
              </div>
            )}
          </div>

          {/* Card Vestimenta */}
          <div className="a-card">
            <div className="a-card-title">
              <h3>Vestimenta</h3>
            </div>
            <div className="a-label" style={{ marginBottom: 10 }}>Tipo de roupa utilizada</div>
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

          {erro && <div className="a-erro">{erro}</div>}

          <button className="btn-primary" onClick={handleIniciar} disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Treino"} <span style={{ fontSize: 18 }}>›</span>
          </button>
        </div>

        <BottomNav active="registro" />
      </div>
    </div>
  );
}