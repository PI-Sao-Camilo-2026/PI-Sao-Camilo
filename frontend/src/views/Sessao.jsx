import "../css/Sessao.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sessao() {
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [urina, setUrina] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    let inicio = localStorage.getItem("inicioSessao");

    if (!inicio) {
      inicio = Date.now().toString();
      localStorage.setItem("inicioSessao", inicio);
    }

    const intervalo = setInterval(() => {
      if (!pausado) {
        const agora = Date.now();
        const tempoPausado = Number(localStorage.getItem("tempoPausado") || 0);
        const segundos = Math.floor(
          (agora - Number(inicio) - tempoPausado) / 1000
        );

        setTempo(segundos);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pausado]);

  const pausarOuContinuar = () => {
    if (!pausado) {
      localStorage.setItem("inicioPausa", Date.now().toString());
      setPausado(true);
    } else {
      const inicioPausa = Number(localStorage.getItem("inicioPausa"));
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
    const minutos = Math.floor((segundos % 3600) / 60);
    const seg = segundos % 60;

    return `${String(horas).padStart(2, "0")} : ${String(minutos).padStart(
      2,
      "0"
    )} : ${String(seg).padStart(2, "0")}`;
  };

  const alterarValor = (setState, ml) => {
    setState((prev) => Math.max(0, prev + ml));
  };

  const encerrarSessao = () => {
    localStorage.setItem("tempoFinalSessao", tempo.toString());
    localStorage.removeItem("inicioSessao");
    localStorage.removeItem("inicioPausa");
    localStorage.removeItem("tempoPausado");
    navigate("/possessao");
  };

  return (
    <div className="sessao-container">
      <header className="top">
        <h2>SÃO CAMILO</h2>
        <p>Nutri - Esportiva</p>

        <div className={pausado ? "session paused" : "session"}>
          ● {pausado ? "SESSÃO PAUSADA" : "SESSÃO ATIVA"}
        </div>
      </header>

      <section className="tempo">
        <h1>{formatarTempo(tempo)}</h1>
        <p>TEMPO DA SESSÃO</p>
      </section>

      <section className="steps">
        <div className="step done">
          <span>1</span>
          <p>PRÉ</p>
        </div>

        <div className="step active">
          <span>2</span>
          <p>DURANTE</p>
        </div>

        <div className="step">
          <span>3</span>
          <p>PÓS</p>
        </div>
      </section>

      <section className="clima">
        <div>
          <strong>Temperatura</strong>
          <br />
          28°C
        </div>

        <div>
          <strong>Umidade</strong>
          <br />
          75%
        </div>

        <div>
          <strong>Radiação</strong>
          <br />
          Alta
        </div>

        <div>
          <strong>Vento</strong>
          <br />
          8%
        </div>
      </section>

      <section className="box">
        <h2>Ingestão de Fluidos</h2>
        <p className="subtitle">Registre por evento simples</p>

        <div className="ingestao">
          <button type="button" onClick={() => alterarValor(setTotal, 250)}>
            <strong>250 mL</strong>
            <span>Copo</span>
          </button>

          <button type="button" onClick={() => alterarValor(setTotal, 500)}>
            <strong>500 mL</strong>
            <span>Garrafa</span>
          </button>

          <button type="button" onClick={() => alterarValor(setTotal, 750)}>
            <strong>750 mL</strong>
            <span>Squeeze</span>
          </button>
        </div>

        <p className="total">Total ingerido: {total} mL</p>

        <div className="acoes-fluido">
          <button type="button" onClick={() => alterarValor(setTotal, -100)}>
            -100 mL
          </button>

          <button type="button" onClick={() => alterarValor(setTotal, 100)}>
            +100 mL
          </button>
        </div>
      </section>

      <section className="alerta">⚠️ Beba 200 mL a cada 15 min</section>

      <section className="box">
        <h2>Volume urinário</h2>
        <p className="subtitle">Quando aplicável</p>

        <div className="ingestao">
          <button type="button" onClick={() => alterarValor(setUrina, 100)}>
            <strong>100 mL</strong>
            <span>Pouco</span>
          </button>

          <button type="button" onClick={() => alterarValor(setUrina, 250)}>
            <strong>250 mL</strong>
            <span>Médio</span>
          </button>

          <button type="button" onClick={() => alterarValor(setUrina, 500)}>
            <strong>500 mL</strong>
            <span>Alto</span>
          </button>
        </div>

        <p className="total">Volume urinário: {urina} mL</p>

        <div className="acoes-fluido">
          <button type="button" onClick={() => alterarValor(setUrina, -100)}>
            -100 mL
          </button>

          <button type="button" onClick={() => alterarValor(setUrina, 100)}>
            +100 mL
          </button>
        </div>

        <p className="hint">Registrar apenas se houver micção durante a sessão.</p>
      </section>

      <button className="encerrar" onClick={encerrarSessao}>
        ENCERRAR SESSÃO
      </button>

      <button
        type="button"
        className={pausado ? "floating-btn paused" : "floating-btn"}
        onClick={pausarOuContinuar}
      >
        {pausado ? "▶" : "⏸"}
      </button>
    </div>
  );
}