import "../css/Pre-Sessao.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    peso: "",
    bexiga: false,
    vestimentaPadrao: false,
    temperatura: "",
    umidade: "",
    sensacaoTermica: "",
    vento: "",
    sol: "",
    modalidade: "",
    duracao: "",
    intensidade: "",
    vestimenta: "",
    urina: "",
    sede: "",
    sintomas: "",
    hidratacao: ""
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSubmit() {
    console.log("Enviando:", form);

    // 🔥 VALIDAÇÃO
    if (!form.peso || isNaN(form.peso)) {
      alert("Digite um peso válido");
      return;
    }

    if (!form.urina) {
      alert("Selecione a cor da urina");
      return;
    }

    try {
      // 🔥 MAPEAMENTO CORRETO PRO BACKEND
      const payload = {
        peso_pre: Number(form.peso),
        temp_celsius: Number(form.temperatura) || 25,
        umidade_pct: Number(form.umidade) || 60,
        cor_urina_basal: Number(form.urina) || 2
      };

      const res = await fetch("http://127.0.0.1:8000/sessoes/pre-treino", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // ⚠️ só usa se tiver login/token
        // credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();
      console.log("Sessão criada:", data);

      // 🔥 salva sessão
      localStorage.setItem("sessao_id", data.id);

      navigate("/sessao");

    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao conectar com o servidor");
    }
  }

  return (
    <div className="container">

      <header className="top">
        <div>
          <h2>SÃO CAMILO</h2>
          <p>Nutri - Esportiva</p>
        </div>
        <div className="session">● SESSÃO ATIVA</div>
      </header>

      <section className="welcome">
        <h1>Pré-Sessão</h1>
        <p>Preencha os dados antes do treino</p>
      </section>

      {/* MASSA */}
      <section className="box">
        <h2>Massa corporal</h2>

        <input
          name="peso"
          className="input"
          placeholder="Ex: 73.6"
          onChange={handleChange}
        />

        <label>
          <input type="checkbox" name="bexiga" onChange={handleChange} />
          Bexiga esvaziada
        </label>

        <label>
          <input type="checkbox" name="vestimentaPadrao" onChange={handleChange} />
          Vestimenta padronizada
        </label>
      </section>

      {/* AMBIENTE */}
      <section className="box">
        <h2>Condições ambientais</h2>

        <input name="temperatura" placeholder="Temperatura (°C)" className="input" onChange={handleChange} />
        <input name="umidade" placeholder="Umidade (%)" className="input" onChange={handleChange} />
        <input name="sensacaoTermica" placeholder="Sensação térmica" className="input" onChange={handleChange} />
        <input name="vento" placeholder="Vento" className="input" onChange={handleChange} />

        <select name="sol" className="input" onChange={handleChange}>
          <option value="">Exposição solar</option>
          <option>Baixa</option>
          <option>Moderada</option>
          <option>Alta</option>
        </select>
      </section>

      {/* TREINO */}
      <section className="box">
        <h2>Treino</h2>

        <input name="modalidade" placeholder="Modalidade" className="input" onChange={handleChange} />
        <input name="duracao" placeholder="Duração (min)" className="input" onChange={handleChange} />

        <select name="intensidade" className="input" onChange={handleChange}>
          <option value="">Intensidade</option>
          <option>Leve</option>
          <option>Moderada</option>
          <option>Alta</option>
        </select>
      </section>

      {/* VESTIMENTA */}
      <section className="box">
        <input name="vestimenta" placeholder="Vestimenta" className="input" onChange={handleChange} />
      </section>

      {/* ESTADO */}
      <section className="box">
        <p>Urina</p>
        <div className="scale">
          {[1,2,3,4,5,6,7].map(n => (  // 🔥 corrigido (1–7)
            <label key={n} className="scale-box">
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

        <select name="sede" className="input" onChange={handleChange}>
          <option value="">Sede</option>
          <option>Leve</option>
          <option>Moderada</option>
          <option>Alta</option>
        </select>

        <textarea name="sintomas" placeholder="Sintomas" className="input" onChange={handleChange} />
        <textarea name="hidratacao" placeholder="Histórico de hidratação" className="input" onChange={handleChange} />
      </section>

      <button className="start" onClick={handleSubmit}>
        INICIAR SESSÃO DE TREINO
      </button>

    </div>
  );
}