import "../../css/Pre-Sessao.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { sessoesApi, climaApi } from "../../services/api";
import {
  AiOutlineUser, AiOutlineBell, AiFillBell,
  AiFillHome, AiOutlineHeart
} from "react-icons/ai";
import { LuClipboardList } from "react-icons/lu";

export default function PreSessao() {
  const navigate = useNavigate();
  const [carregandoClima, setCarregandoClima] = useState(true);

  const [form, setForm] = useState({
    peso: "",
    bexiga: false,
    vestimentaPadrao: false,
    temperatura: "",
    umidade: "",
    sensacaoTermica: "",
    vento: "",
    radiacao: "",
    condicao: "",
    sol: "",
    modalidade: "",
    duracao: "",
    intensidade: "",
    vestimenta: "",
    urina: "",
    sede: "",
    sintomas: "",
    hidratacao: "",
  });

  useEffect(() => {
    carregarClima();
  }, []);

  async function carregarClima() {
    setCarregandoClima(true);
    try {
      const dados = await climaApi.buscarAutomatico();
      setForm((prev) => ({ ...prev, ...dados }));
    } catch (err) {
      console.error("Erro ao buscar clima:", err);
    } finally {
      setCarregandoClima(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit() {
    const pesoConvertido = Number(form.peso.replace(",", "."));

    if (isNaN(pesoConvertido) || pesoConvertido <= 0) {
      alert("Digite um peso válido");
      return;
    }

    if (!form.urina) {
      alert("Selecione a cor da urina");
      return;
    }

    try {
      const payload = {
        peso_pre: pesoConvertido,
        temp_celsius: form.temperatura !== "" ? Number(form.temperatura) : null,
        umidade_pct: form.umidade !== "" ? Number(form.umidade) : null,
        cor_urina_basal: form.urina !== "" ? Number(form.urina) : null,
        sensacao_termica: form.sensacaoTermica !== "" ? Number(form.sensacaoTermica) : null,
        vento: form.vento !== "" ? Number(form.vento) : null,
        radiacao: form.radiacao !== "" ? Number(form.radiacao) : null,
        condicao: form.condicao || null,
        sol: form.sol || null,
        bexiga_esvaziada: form.bexiga,
        vestimenta_padrao: form.vestimentaPadrao,
        modalidade: form.modalidade || null,
        duracao: form.duracao !== "" ? Number(form.duracao) : null,
        intensidade: form.intensidade || null,
        vestimenta: form.vestimenta || null,
        sede: form.sede || null,
        sintomas: form.sintomas || null,
        hidratacao: form.hidratacao || null,
      };

      const data = await sessoesApi.iniciarPreTreino(payload);

      localStorage.setItem("sessao_id", data.id);
      localStorage.setItem("peso_pre", String(pesoConvertido));
      localStorage.setItem("inicioSessao", Date.now().toString());
      localStorage.removeItem("tempoPausado");
      localStorage.removeItem("inicioPausa");

      localStorage.setItem("climaSessao", JSON.stringify({
        temperatura: form.temperatura,
        umidade: form.umidade,
        vento: form.vento,
        sol: form.sol,
        condicao: form.condicao,
      }));

      navigate("/sessao");
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao iniciar sessão: " + err.message);
    }
  }

  const nivelUrina = Number(form.urina);
  let mensagemUrina = "";
  let classeMensagem = "";
  if (nivelUrina >= 1 && nivelUrina <= 3) {
    mensagemUrina = "VOCÊ ESTÁ HIDRATADO, PARABÉNS!";
    classeMensagem = "good";
  } else if (nivelUrina >= 4 && nivelUrina <= 5) {
    mensagemUrina = "VOCÊ NÃO ESTÁ BEM HIDRATADO, BEBA ÁGUA!";
    classeMensagem = "medium";
  } else if (nivelUrina >= 6 && nivelUrina <= 8) {
    mensagemUrina = "ATENÇÃO: BEBA ÁGUA! VOCÊ ESTÁ MUITO DESIDRATADO";
    classeMensagem = "bad";
  }

  return (
    <div className="pre-page">
      <header className="pre-header">
        <div className="brand-area">
          <div className="brand-logo">
            <img className="brand-logo" src="/R.png" alt="logo_sao_camilo" />
          </div>
          <div>
            <h1>SÃO CAMILO</h1>
            <p>Nutri - Esportiva</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="status-pill">SESSÃO ATIVA</span>
          <span className="bell">🔔</span>
          <span className="menu">☰</span>
        </div>
      </header>

      <section className="atleta-area">
        <img className="atleta-icon" src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png" alt="silhueta atleta" />
        <div>
          <h2>Olá, Atleta!</h2>
          <p>Pronto para iniciar uma nova avaliação?</p>
        </div>
        <span className="atleta-codigo">SC / ATL - 0000</span>
      </section>

      <section className="steps-line">
        <div className="step-item complete"><span>1</span><p>ATLETA</p></div>
        <div className="line complete-line"></div>
        <div className="step-item active"><span>2</span><p>PRÉ-SESSÃO</p></div>
        <div className="line"></div>
        <div className="step-item"><span>3</span><p>DURANTE</p></div>
        <div className="line"></div>
        <div className="step-item"><span>4</span><p>PÓS-SESSÃO</p></div>
        <div className="line"></div>
        <div className="step-item"><span>5</span><p>RELATÓRIO</p></div>
      </section>

      <section className="sessao-titulo">
        <span></span>
        <h2>DADOS PRÉ - SESSÃO</h2>
      </section>

      <section className="weather-grid">
        <div className="weather-card">
          <div className="weather-icon red">☀</div>
          <small>TEMPERATURA</small>
          <strong>{form.temperatura ? `${form.temperatura}°C` : "--"}</strong>
        </div>
        <div className="weather-card">
          <div className="weather-icon blue">💧</div>
          <small>UMIDADE</small>
          <strong>{form.umidade ? `${form.umidade}%` : "--"}</strong>
        </div>
        <div className="weather-card">
          <div className="weather-icon yellow">☀</div>
          <small>RADIAÇÃO</small>
          <strong>{form.sol || "--"}</strong>
        </div>
        <div className="weather-card">
          <div className="weather-icon green">🍃</div>
          <small>VENTO</small>
          <strong>{form.vento ? `${form.vento} km/h` : "--"}</strong>
        </div>
      </section>

      {carregandoClima && (
        <p className="weather-loading">Buscando clima da sua localização...</p>
      )}

      <button type="button" className="weather-refresh" onClick={carregarClima}>
        Atualizar clima
      </button>

      <section className="check-card">
        <div className="check-title">
          <span>✓</span>
          <h3>Checklist de Padronização</h3>
        </div>
        <label className="check-row">
          <input type="checkbox" name="bexiga" onChange={handleChange} />
          <span>Bexiga esvaziada antes das pesagens?</span>
        </label>
        <label className="check-row">
          <input type="checkbox" name="vestimentaPadrao" onChange={handleChange} />
          <span>Mesma balança e superfície nivelada?</span>
        </label>
        <div className="peso-area">
          <label>Peso (kg)</label>
          <input
            name="peso"
            placeholder="Exemplo: 73,6"
            value={form.peso}
            onChange={handleChange}
          />
        </div>
      </section>

      <section className="urina-area">
        <h3>COLORAÇÃO DA URINA</h3>
        <div className="urina-scale">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <label
              key={n}
              className={`urina-box urina-${n} ${form.urina === String(n) ? "selected" : ""}`}
            >
              <input type="radio" name="urina" value={n} onChange={handleChange} />
              {n}
            </label>
          ))}
        </div>
        <div className="urina-texts">
          {mensagemUrina && <p className={classeMensagem}>{mensagemUrina}</p>}
        </div>
      </section>

      <section className="extra-fields">
        <details>
          <summary>Dados adicionais do treino</summary>
          <input name="modalidade" placeholder="Modalidade" onChange={handleChange} />
          <input name="duracao" placeholder="Duração (min)" onChange={handleChange} />
          <select
            name="intensidade"
            value={form.intensidade}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Intensidade
            </option>
            <option value="Leve">Leve</option>
            <option value="Moderada">Moderada</option>
            <option value="Alta">Alta</option>
          </select>
          <input name="vestimenta" placeholder="Vestimenta" onChange={handleChange} />
          <select
            name="sede"
            value={form.sede}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Sede
            </option>
            <option value="Leve">Leve</option>
            <option value="Moderada">Moderada</option>
            <option value="Alta">Alta</option>
          </select>
          <textarea name="sintomas" placeholder="Sintomas" onChange={handleChange} />
          <textarea name="hidratacao" placeholder="Histórico de hidratação" onChange={handleChange} />
        </details>
      </section>

      <button className="start-prototype" onClick={handleSubmit}>
        INICIAR SESSÃO DE TREINO <span>➜</span>
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