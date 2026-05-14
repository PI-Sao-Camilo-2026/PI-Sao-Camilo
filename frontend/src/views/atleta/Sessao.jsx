import "../../css/Sessao.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sessoesApi } from "../../services/api";
import {
  AiOutlineUser, AiOutlineBell, AiFillBell,
  AiFillHome, AiOutlineHeart
} from "react-icons/ai";
import { LuClipboardList } from "react-icons/lu";

export default function Sessao() {
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [urina, setUrina] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  const [clima, setClima] = useState({
    temperatura: "", umidade: "", vento: "", sol: "", condicao: "",
  });

  useEffect(() => {
    const climaSalvo = localStorage.getItem("climaSessao");
    if (climaSalvo) setClima(JSON.parse(climaSalvo));

    let inicio = localStorage.getItem("inicioSessao");
    if (!inicio) {
      inicio = Date.now().toString();
      localStorage.setItem("inicioSessao", inicio);
    }

    const intervalo = setInterval(() => {
      if (!pausado) setTempo(calcularTempoAtual());
    }, 1000);

    return () => clearInterval(intervalo);
  }, [pausado]);

  const calcularTempoAtual = () => {
    const inicio = Number(localStorage.getItem("inicioSessao"));
    const tempoPausado = Number(localStorage.getItem("tempoPausado") || 0);
    if (!inicio) return 0;
    return Math.floor((Date.now() - inicio - tempoPausado) / 1000);
  };

  const pausarOuContinuar = () => {
    if (!pausado) {
      localStorage.setItem("inicioPausa", Date.now().toString());
      setPausado(true);
    } else {
      const inicioPausa = Number(localStorage.getItem("inicioPausa"));
      const anterior = Number(localStorage.getItem("tempoPausado") || 0);
      localStorage.setItem("tempoPausado", (anterior + Date.now() - inicioPausa).toString());
      localStorage.removeItem("inicioPausa");
      setPausado(false);
    }
  };

  const formatarTempo = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`;
  };

  async function adicionarFluido(ml) {
    if (registrando) return;
    const sessaoId = localStorage.getItem("sessao_id");
    if (!sessaoId) { alert("Sessão não encontrada"); return; }

    try {
      setRegistrando(true);
      const res = await sessoesApi.registrarFluido(sessaoId, ml);
      setTotal(res.ingestao_total_ml);
    } catch (err) {
      console.error("Erro ao registrar fluido:", err);
      setTotal((prev) => prev + ml);
    } finally {
      setRegistrando(false);
    }
  }

  const alterarUrina = (ml) => setUrina((prev) => Math.max(0, prev + ml));

  const encerrarSessao = async () => {
    const sessaoId = localStorage.getItem("sessao_id");
    if (!sessaoId) { alert("Sessão não encontrada"); return; }

    try {
      const tempoFinal = pausado ? tempo : calcularTempoAtual();

      localStorage.setItem("tempoFinalSessao", tempoFinal.toString());
      localStorage.setItem("totalIngerido", total.toString());
      localStorage.setItem("volumeUrina", urina.toString());

      await sessoesApi.finalizarSessao(sessaoId, {
        tempo_total_segundos: tempoFinal,
        ingestao_ml: total,
        volume_urina_ml: urina,
      });

      localStorage.removeItem("inicioSessao");
      localStorage.removeItem("inicioPausa");
      localStorage.removeItem("tempoPausado");

      navigate("/possessao");
    } catch (err) {
      console.error(err);
      alert("Erro ao encerrar sessão: " + err.message);
    }
  };

  return (
    <div className="sessao-page">
      <header className="sessao-header">
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
          <span className={pausado ? "status-pill paused" : "status-pill"}>
            ● {pausado ? "SESSÃO PAUSADA" : "SESSÃO ATIVA"}
          </span>
          <span className="bell">🔔</span>
          <span className="menu">☰</span>
        </div>
      </header>

      <section className="atleta-area">
        <img className="atleta-icon" src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png" alt="Atleta" />
        <div>
          <h2>Sessão em andamento</h2>
          <p>Registre hidratação e volume urinário durante o treino.</p>
        </div>
        <span className="atleta-codigo">SC / ATL - 0000</span>
      </section>

      <section className="steps-line">
        <div className="step-item complete"><span>1</span><p>PRÉ</p></div>
        <div className="line complete-line"></div>
        <div className="step-item active"><span>2</span><p>DURANTE</p></div>
        <div className="line"></div>
        <div className="step-item"><span>3</span><p>PÓS</p></div>
        <div className="line"></div>
        <div className="step-item"><span>4</span><p>RELATÓRIO</p></div>
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
          <img className="weather-icon red" src="/temperatura-removebg-preview.png" alt="temperatura imagem"></img>
          <small>TEMPERATURA</small>
          <strong>{clima.temperatura ? `${clima.temperatura}°C` : "--"}</strong>
        </div>

        <div className="weather-card">
          <div className="weather-icon blue">💧</div>
          <small>UMIDADE</small>
          <strong>{clima.umidade ? `${clima.umidade}%` : "--"}</strong>
        </div>

        <div className="weather-card">
          <div className="weather-icon yellow">☀</div>
          <small>RADIAÇÃO</small>
          <strong>{clima.sol || "--"}</strong>
        </div>

        <div className="weather-card">
          <img className="weather-icon green" src="/imaa-removebg-preview.png" alt="vento imagem"></img>
          <small>VENTO</small>
          <strong>{clima.vento ? `${clima.vento} km/h` : "--"}</strong>
        </div>
      </section>

      <section className="session-card">
        <div className="card-title">
          <span>💧</span>
          <h3>Ingestão de Fluidos</h3>
        </div>

        <p className="subtitle">Registre por evento simples</p>

        <div className="quick-grid">
          {[250, 500, 750].map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => adicionarFluido(ml)}
              disabled={registrando}
            >
              <strong>{ml} mL</strong>
              <span>{ml === 250 ? "Copo" : ml === 500 ? "Garrafa" : "Squeeze"}</span>
            </button>
          ))}
        </div>

        <p className="total">Total ingerido: {total} mL</p>

        <div className="adjust-actions">
          <button
            type="button"
            onClick={() => adicionarFluido(-50)}
            disabled={registrando}
          >
            -50 mL
          </button>

          <button
            type="button"
            onClick={() => adicionarFluido(50)}
            disabled={registrando}
          >
            +50 mL
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
          {[100, 250, 500].map((ml) => (
            <button
              key={ml}
              type="button"
              onClick={() => alterarUrina(ml)}
            >
              <strong>{ml} mL</strong>
              <span>{ml === 100 ? "Pouco" : ml === 250 ? "Médio" : "Alto"}</span>
            </button>
          ))}
        </div>

        <p className="total">
          Volume urinário: {urina} mL
        </p>

        <div className="adjust-actions">
          <button
            type="button"
            onClick={() => alterarUrina(-50)}
          >
            -50 mL
          </button>

          <button
            type="button"
            onClick={() => alterarUrina(50)}
          >
            +50 mL
          </button>
        </div>
      </section>

      <button className="encerrar" onClick={encerrarSessao}>
        ENCERRAR SESSÃO <span>➜</span>
      </button>

      <button
        type="button"
        className={pausado ? "floating-btn paused" : "floating-btn"}
        onClick={pausarOuContinuar}
      >
        {pausado ? "▶" : "⏸"}
      </button>
      <nav className="bottom-nav">
        <div className="nav-item active-nav" onClick={() => navigate("/home")}>
          <span className="nav-icon"><AiFillHome /></span>
          <p>INÍCIO</p>
        </div>
        <div className="nav-item">
          <span className="nav-icon vazio"><LuClipboardList /> /</span>
          <p>HISTÓRICO</p>
        </div>
        <div className="nav-item">
          <span className="nav-icon vazio"><AiOutlineHeart /></span>
          <p>OBSERVAÇÕES</p>
        </div>
        <div className="nav-item">
          <span className="nav-icon vazio"><AiOutlineUser /></span>
          <p>PERFIL</p>
        </div>
      </nav>
    </div>
  );
}