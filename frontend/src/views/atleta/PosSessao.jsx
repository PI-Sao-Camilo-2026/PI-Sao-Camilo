import "../../css/Pos-Sessao.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PosSessao() {
  const navigate = useNavigate();

  const [tempoFinal, setTempoFinal] = useState("00 : 00 : 00");
  const [tempoSegundos, setTempoSegundos] = useState(0);

  const [totalIngerido, setTotalIngerido] = useState(0);
  const [volumeUrina, setVolumeUrina] = useState(0);

  // pesos
  const [pesoPre, setPesoPre] = useState(73.6);
  const [pesoPos, setPesoPos] = useState(72.9);

  useEffect(() => {
    const tempoSalvo = Number(localStorage.getItem("tempoFinalSessao") || 0);
    const totalSalvo = Number(localStorage.getItem("totalIngerido") || 0);
    const urinaSalva = Number(localStorage.getItem("volumeUrina") || 0);

    setTempoSegundos(tempoSalvo);
    setTempoFinal(formatarTempo(tempoSalvo));

    setTotalIngerido(totalSalvo);
    setVolumeUrina(urinaSalva);

    // pega peso salvo no pré
    const dadosPre = JSON.parse(
      localStorage.getItem("dadosPreSessao") || "{}"
    );

    if (dadosPre.peso) {
      setPesoPre(Number(dadosPre.peso));
    }
  }, []);

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const seg = segundos % 60;

    return `${String(horas).padStart(2, "0")} : ${String(
      minutos
    ).padStart(2, "0")} : ${String(seg).padStart(2, "0")}`;
  };

  // cálculo da perda %
  const perdaPct = Number(
    (((pesoPre - pesoPos) / pesoPre) * 100).toFixed(2)
  );

  async function finalizarSessao() {
    try {
      const sessaoId = localStorage.getItem("sessao_id");

      const payload = {
        tempo_total_segundos: tempoSegundos,

        agua_ml: totalIngerido,
        isotonicos_ml: 0,
        outros_ml: 0,

        volume_urinario_ml: volumeUrina,

        peso_pre: pesoPre,
        peso_pos: pesoPos,

        perda_pct: perdaPct,

        gasto_energetico_kcal: 840,
        ingestao_energetica_kcal: 210,
        saldo_energetico_kcal: -630,
      };

      console.log("PAYLOAD PÓS-SESSÃO:");
      console.log(payload);

      const res = await fetch(
        `http://127.0.0.1:8000/sessoes/${sessaoId}/finalizar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const erro = await res.text();
        console.error(erro);
        throw new Error(erro);
      }

      const data = await res.json();

      console.log("RESPOSTA BACKEND:");
      console.log(data);

      navigate("/relatorios");
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar sessão");
    }
  }

  return (
    <div className="pos-page">
      <header className="pos-header">
        <div className="brand-area">
          <div className="brand-logo">
            <img
              className="brand-logo-img"
              src="/R.png"
              alt="São Camilo"
            />
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
        <img
          className="athlete-icon"
          src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png"
          alt="Atleta"
        />

        <div>
          <h2>Sessão finalizada</h2>
          <p>Resumo geral da hidratação e indicadores da sessão.</p>
        </div>

        <span className="athlete-code">SC / ATL - 0000</span>
      </section>

      <section className="steps-line">
        <div className="step-item complete">
          <span>1</span>
          <p>PRÉ</p>
        </div>

        <div className="line complete-line"></div>

        <div className="step-item complete">
          <span>2</span>
          <p>DURANTE</p>
        </div>

        <div className="line complete-line"></div>

        <div className="step-item active">
          <span>3</span>
          <p>PÓS</p>
        </div>

        <div className="line"></div>

        <div className="step-item">
          <span>4</span>
          <p>RELATÓRIO</p>
        </div>
      </section>

      <section className="tempo-card">
        <p>TEMPO TOTAL DA SESSÃO</p>
        <h1>{tempoFinal}</h1>
      </section>

      <section className="summary-card">
        <div className="card-title">
          <span>💧</span>
          <h3>Resumo de Ingestão</h3>
        </div>

        <div className="summary-grid">
          <div>
            <strong>Água</strong>
            <span>{totalIngerido} mL</span>
          </div>

          <div>
            <strong>Isotônico</strong>
            <span>0 mL</span>
          </div>

          <div>
            <strong>Outros</strong>
            <span>0 mL</span>
          </div>
        </div>

        <p className="summary-total">
          TOTAL INGERIDO: {totalIngerido} mL
        </p>

        <div className="summary-grid">
          <div>
            <strong>Urina</strong>
            <span>{volumeUrina} mL</span>
          </div>

          <div>
            <strong>Gel</strong>
            <span>0 g</span>
          </div>

          <div>
            <strong>Fruta</strong>
            <span>0 g</span>
          </div>
        </div>

        <p className="summary-total">
          VOLUME URINÁRIO: {volumeUrina} mL
        </p>
      </section>

      <section className="summary-card">
        <div className="card-title">
          <span>⚖️</span>
          <h3>Peso corporal</h3>
        </div>

        <div className="peso-grid">
          <div>
            <small>Pré</small>
            <strong>{pesoPre} kg</strong>
          </div>

          <div>
            <small>Pós</small>

            <input
              type="number"
              step="0.1"
              value={pesoPos}
              onChange={(e) =>
                setPesoPos(Number(e.target.value))
              }
            />
          </div>
        </div>

        <p className="normal-info">
          Perda de {perdaPct}%
        </p>
      </section>

      <section className="summary-card">
        <div className="card-title">
          <span>📊</span>
          <h3>Indicadores</h3>
        </div>

        <div className="indicator">
          <span>Gasto energético</span>
          <strong>840 kcal</strong>
        </div>

        <div className="indicator">
          <span>Ingestão energética</span>
          <strong>210 kcal</strong>
        </div>

        <div className="indicator deficit">
          <span>Saldo</span>
          <strong>-630 kcal</strong>
        </div>
      </section>

      <button className="finalizar" onClick={finalizarSessao}>
        GERAR RELATÓRIO <span>➜</span>
      </button>
    </div>
  );
}