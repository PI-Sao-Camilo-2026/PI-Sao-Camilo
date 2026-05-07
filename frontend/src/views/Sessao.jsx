
import "../css/Sessao.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sessao() {
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [urina, setUrina] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [pausado, setPausado] = useState(false);

  const [clima, setClima] = useState({
    temperatura: "",
    umidade: "",
    vento: "",
    sol: "",
    condicao: "",
  });

  useEffect(() => {
    const climaSalvo = localStorage.getItem("climaSessao");

    if (climaSalvo) {
      setClima(JSON.parse(climaSalvo));
    }

    let inicio = localStorage.getItem("inicioSessao");

    if (!inicio) {
      inicio = Date.now().toString();
      localStorage.setItem("inicioSessao", inicio);
    }

    const intervalo = setInterval(() => {
      if (!pausado) {
        setTempo(calcularTempoAtual());
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pausado]);

  const calcularTempoAtual = () => {
    const inicio = Number(localStorage.getItem("inicioSessao"));

    const tempoPausado = Number(
      localStorage.getItem("tempoPausado") || 0
    );

    if (!inicio) return 0;

    return Math.floor(
      (Date.now() - inicio - tempoPausado) / 1000
    );
  };

  const pausarOuContinuar = () => {
    if (!pausado) {
      localStorage.setItem(
        "inicioPausa",
        Date.now().toString()
      );

      setPausado(true);

    } else {
      const inicioPausa = Number(
        localStorage.getItem("inicioPausa")
      );

      const tempoPausadoAnterior = Number(
        localStorage.getItem("tempoPausado") || 0
      );

      const novaPausa = Date.now() - inicioPausa;

      localStorage.setItem(
        "tempoPausado",
        (tempoPausadoAnterior + novaPausa).toString()
      );

      localStorage.removeItem("inicioPausa");

      setPausado(false);
    }
  };

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);

    const minutos = Math.floor(
      (segundos % 3600) / 60
    );

    const seg = segundos % 60;

    return `${String(horas).padStart(2, "0")} : ${String(
      minutos
    ).padStart(2, "0")} : ${String(seg).padStart(2, "0")}`;
  };

  const alterarValor = (setState, ml) => {
    setState((prev) => Math.max(0, prev + ml));
  };

  const encerrarSessao = async () => {
    try {
      const tempoFinal = pausado
        ? tempo
        : calcularTempoAtual();

      localStorage.setItem(
        "tempoFinalSessao",
        tempoFinal.toString()
      );

      localStorage.setItem(
        "totalIngerido",
        total.toString()
      );

      localStorage.setItem(
        "volumeUrina",
        urina.toString()
      );

      const sessaoId = localStorage.getItem("sessao_id");

      const payload = {
        tempo_total_segundos: tempoFinal,

        ingestao_ml: total,

        volume_urina_ml: urina,
      };

      console.log("PAYLOAD DURANTE:");
      console.log(payload);
console.log("sessaoId:", sessaoId);
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

        console.error("ERRO BACKEND:");
        console.error(erro);

        throw new Error(erro);
      }

      const data = await res.json();

      console.log("RESPOSTA BACKEND:");
      console.log(data);

      localStorage.removeItem("inicioSessao");
      localStorage.removeItem("inicioPausa");
      localStorage.removeItem("tempoPausado");

      navigate("/possessao");

    } catch (err) {
      console.error(err);

      alert("Erro ao encerrar sessão");
    }
  };

  return (
    <div className="sessao-page">
      <header className="sessao-header">
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
          <span
            className={
              pausado
                ? "status-pill paused"
                : "status-pill"
            }
          >
            ● {pausado
              ? "SESSÃO PAUSADA"
              : "SESSÃO ATIVA"}
          </span>

          <span className="bell">🔔</span>
          <span className="menu">☰</span>
        </div>
      </header>

      <section className="atleta-area">
        <img
          className="atleta-icon"
          src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png"
          alt="Atleta"
        />

        <div>
          <h2>Sessão em andamento</h2>

          <p>
            Registre hidratação e volume urinário
            durante o treino.
          </p>
        </div>

        <span className="atleta-codigo">
          SC / ATL - 0000
        </span>
      </section>

      <section className="steps-line">
        <div className="step-item complete">
          <span>1</span>
          <p>PRÉ</p>
        </div>

        <div className="line complete-line"></div>

        <div className="step-item active">
          <span>2</span>
          <p>DURANTE</p>
        </div>

        <div className="line"></div>

        <div className="step-item">
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
        <p>TEMPO DA SESSÃO</p>
        <h1>{formatarTempo(tempo)}</h1>
      </section>

      <section className="sessao-titulo">
        <span></span>
        <h2>CONDIÇÕES DE TEMPO</h2>
      </section>

      <section className="weather-grid">
        <div className="weather-card">
          <div className="weather-icon red">☀</div>

          <small>TEMPERATURA</small>

          <strong>
            {clima.temperatura
              ? `${clima.temperatura}°C`
              : "--"}
          </strong>
        </div>

        <div className="weather-card">
          <div className="weather-icon blue">💧</div>

          <small>UMIDADE</small>

          <strong>
            {clima.umidade
              ? `${clima.umidade}%`
              : "--"}
          </strong>
        </div>

        <div className="weather-card">
          <div className="weather-icon yellow">☀</div>

          <small>RADIAÇÃO</small>

          <strong>{clima.sol || "--"}</strong>
        </div>

        <div className="weather-card">
          <div className="weather-icon green">🍃</div>

          <small>VENTO</small>

          <strong>
            {clima.vento
              ? `${clima.vento} km/h`
              : "--"}
          </strong>
        </div>
      </section>

      <section className="session-card">
        <div className="card-title">
          <span>💧</span>
          <h3>Ingestão de Fluidos</h3>
        </div>

        <p className="subtitle">
          Registre por evento simples
        </p>

        <div className="quick-grid">
          <button
            type="button"
            onClick={() => alterarValor(setTotal, 250)}
          >
            <strong>250 mL</strong>
            <span>Copo</span>
          </button>

          <button
            type="button"
            onClick={() => alterarValor(setTotal, 500)}
          >
            <strong>500 mL</strong>
            <span>Garrafa</span>
          </button>

          <button
            type="button"
            onClick={() => alterarValor(setTotal, 750)}
          >
            <strong>750 mL</strong>
            <span>Squeeze</span>
          </button>
        </div>

        <p className="total">
          Total ingerido: {total} mL
        </p>

        <div className="adjust-actions">
          <button
            type="button"
            onClick={() => alterarValor(setTotal, -100)}
          >
            -100 mL
          </button>

          <button
            type="button"
            onClick={() => alterarValor(setTotal, 100)}
          >
            +100 mL
          </button>
        </div>
      </section>

      <section className="alerta">
        ⚠️ Beba 200 mL a cada 15 min
      </section>

      <section className="session-card">
        <div className="card-title">
          <span>🚻</span>
          <h3>Volume urinário</h3>
        </div>

        <p className="subtitle">
          Registrar apenas se houver micção
        </p>

        <div className="quick-grid">
          <button
            type="button"
            onClick={() => alterarValor(setUrina, 100)}
          >
            <strong>100 mL</strong>
            <span>Pouco</span>
          </button>

          <button
            type="button"
            onClick={() => alterarValor(setUrina, 250)}
          >
            <strong>250 mL</strong>
            <span>Médio</span>
          </button>

          <button
            type="button"
            onClick={() => alterarValor(setUrina, 500)}
          >
            <strong>500 mL</strong>
            <span>Alto</span>
          </button>
        </div>

        <p className="total">
          Volume urinário: {urina} mL
        </p>

        <div className="adjust-actions">
          <button
            type="button"
            onClick={() => alterarValor(setUrina, -100)}
          >
            -100 mL
          </button>

          <button
            type="button"
            onClick={() => alterarValor(setUrina, 100)}
          >
            +100 mL
          </button>
        </div>
      </section>

      <button
        className="encerrar"
        onClick={encerrarSessao}
      >
        ENCERRAR SESSÃO <span>➜</span>
      </button>

      <button
        type="button"
        className={
          pausado
            ? "floating-btn paused"
            : "floating-btn"
        }
        onClick={pausarOuContinuar}
      >
        {pausado ? "▶" : "⏸"}
      </button>
    </div>
  );
}