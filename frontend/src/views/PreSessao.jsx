import "../css/Pre-Sessao.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
    carregarClimaLocal();
  }, []);

  function traduzirCondicao(codigo) {
    const mapa = {
      0: "Céu limpo",
      1: "Predominantemente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina com geada",
      51: "Garoa leve",
      53: "Garoa moderada",
      55: "Garoa forte",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva forte",
      80: "Pancadas leves",
      81: "Pancadas moderadas",
      82: "Pancadas fortes",
      95: "Trovoada",
    };

    return mapa[codigo] || "Condição não identificada";
  }

  function classificarRadiacao(valor) {
    if (valor === "" || valor === null || valor === undefined) return "";

    const radiacao = Number(valor);

    if (radiacao < 250) return "Baixa";
    if (radiacao < 600) return "Moderada";
    return "Alta";
  }

  async function buscarClimaPorCoordenadas(latitude, longitude) {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,shortwave_radiation` +
      `&timezone=auto`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Erro ao buscar clima");
    }

    const data = await res.json();
    const atual = data.current;

    const climaFormatado = {
      temperatura: atual.temperature_2m ?? "",
      umidade: atual.relative_humidity_2m ?? "",
      sensacaoTermica: atual.apparent_temperature ?? "",
      vento: atual.wind_speed_10m ?? "",
      radiacao: atual.shortwave_radiation ?? "",
      condicao: traduzirCondicao(atual.weather_code),
      sol: classificarRadiacao(atual.shortwave_radiation),
      latitude,
      longitude,
    };

    localStorage.setItem("climaSessao", JSON.stringify(climaFormatado));

    setForm((prev) => ({
      ...prev,
      temperatura: climaFormatado.temperatura,
      umidade: climaFormatado.umidade,
      sensacaoTermica: climaFormatado.sensacaoTermica,
      vento: climaFormatado.vento,
      radiacao: climaFormatado.radiacao,
      condicao: climaFormatado.condicao,
      sol: climaFormatado.sol,
    }));
  }

  function carregarClimaLocal() {
    setCarregandoClima(true);

    if (!navigator.geolocation) {
      buscarClimaPorCoordenadas(-23.5505, -46.6333)
        .catch(() => alert("Não foi possível buscar o clima."))
        .finally(() => setCarregandoClima(false));

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        try {
          const { latitude, longitude } = posicao.coords;
          await buscarClimaPorCoordenadas(latitude, longitude);
        } catch (err) {
          console.error(err);
          alert("Erro ao buscar clima local.");
        } finally {
          setCarregandoClima(false);
        }
      },
      async () => {
        try {
          await buscarClimaPorCoordenadas(-23.5505, -46.6333);
        } catch (err) {
          console.error(err);
          alert("Erro ao buscar clima padrão de São Paulo.");
        } finally {
          setCarregandoClima(false);
        }
      }
    );
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

    async function handleSubmit() {
    if (!form.peso || isNaN(form.peso)) {
      alert("Digite um peso válido");
      return;
    }

    if (!form.urina) {
      alert("Selecione a cor da urina");
      return;
    }

    try {
      const payload = {
        peso_pre: Number(form.peso),
        temp_celsius: Number(form.temperatura) || 25,
        umidade_pct: Number(form.umidade) || 60,
        cor_urina_basal: Number(form.urina) || 2,
      };

      const res = await fetch("http://127.0.0.1:8001/sessoes/pre-treino", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();

      localStorage.setItem("sessao_id", data.id);
      localStorage.setItem("inicioSessao", Date.now().toString());
      localStorage.removeItem("tempoPausado");
      localStorage.removeItem("inicioPausa");

      navigate("/sessao");
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao conectar com o servidor");
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
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div>
            <h1>SÃO CAMILO</h1>
            <p>Nutri - Esportiva</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="status-pill">● SESSÃO ATIVA</span>
          <span className="bell">🔔</span>
          <span className="menu">☰</span>
        </div>
      </header>

      <section className="atleta-area">
        <img className="atleta-icon" src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png" alt="silhueta atleta"></img>

        <div>
          <h2>Olá, Atleta!</h2>
          <p>Pronto para iniciar uma nova avaliação?</p>
        </div>

        <span className="atleta-codigo">SC / ATL - 0000</span>
      </section>

      <section className="steps-line">
        <div className="step-item complete">
          <span>1</span>
          <p>ATLETA</p>
        </div>

        <div className="line complete-line"></div>

        <div className="step-item active">
          <span>2</span>
          <p>PRÉ-SESSÃO</p>
        </div>

        <div className="line"></div>

        <div className="step-item">
          <span>3</span>
          <p>DURANTE</p>
        </div>

        <div className="line"></div>

        <div className="step-item">
          <span>4</span>
          <p>PÓS-SESSÃO</p>
        </div>

        <div className="line"></div>

        <div className="step-item">
          <span>5</span>
          <p>RELATÓRIO</p>
        </div>
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

      <button type="button" className="weather-refresh" onClick={carregarClimaLocal}>
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
          <input
            type="checkbox"
            name="vestimentaPadrao"
            onChange={handleChange}
          />
          <span>Mesma balança e superfície nivelada?</span>
        </label>

        <div className="peso-area">
          <label>
            Peso (kg)
          </label>

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
              className={`urina-box urina-${n} ${form.urina === String(n) ? "selected" : ""
                }`}
            >
              <input
                type="radio"
                name="urina"
                value={n}
                onChange={handleChange}
              />
              {n}
            </label>
          ))}
        </div>

        <div className="urina-texts">
          {mensagemUrina && (
            <p className={classeMensagem}>
              {mensagemUrina}
            </p>
          )}
        </div>
      </section>

      <section className="extra-fields">
        <details>
          <summary>Dados adicionais do treino</summary>

          <input
            name="modalidade"
            placeholder="Modalidade"
            onChange={handleChange}
          />

          <input
            name="duracao"
            placeholder="Duração (min)"
            onChange={handleChange}
          />

          <select name="intensidade" onChange={handleChange}>
            <option value="">Intensidade</option>
            <option>Leve</option>
            <option>Moderada</option>
            <option>Alta</option>
          </select>

          <input
            name="vestimenta"
            placeholder="Vestimenta"
            onChange={handleChange}
          />

          <select name="sede" onChange={handleChange}>
            <option value="">Sede</option>
            <option>Leve</option>
            <option>Moderada</option>
            <option>Alta</option>
          </select>

          <textarea
            name="sintomas"
            placeholder="Sintomas"
            onChange={handleChange}
          />

          <textarea
            name="hidratacao"
            placeholder="Histórico de hidratação"
            onChange={handleChange}
          />
        </details>
      </section>

      <button className="start-prototype" onClick={handleSubmit}>
        INICIAR SESSÃO DE TREINO <span>➜</span>
      </button>
    </div>
  );
}