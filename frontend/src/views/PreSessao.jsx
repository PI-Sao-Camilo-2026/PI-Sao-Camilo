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

    try {
      const res = await fetch("http://127.0.0.1:5000/pre-sessao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      console.log("Resposta:", data);

      navigate("/sessao");
    } catch (err) {
      console.error("Erro ao enviar:", err);
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

        <input name="peso" className="input" onChange={handleChange} />

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

        <input name="temperatura" className="input" onChange={handleChange} />
        <input name="umidade" className="input" onChange={handleChange} />
        <input name="sensacaoTermica" className="input" onChange={handleChange} />
        <input name="vento" className="input" onChange={handleChange} />

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

        <input name="modalidade" className="input" onChange={handleChange} />
        <input name="duracao" className="input" onChange={handleChange} />

        <select name="intensidade" className="input" onChange={handleChange}>
          <option value="">Intensidade</option>
          <option>Leve</option>
          <option>Moderada</option>
          <option>Alta</option>
        </select>
      </section>

      {/* VESTIMENTA */}
      <section className="box">
        <input name="vestimenta" className="input" onChange={handleChange} />
      </section>

      {/* ESTADO */}
      <section className="box">
        <p>Urina</p>
        <div className="scale">
          {[1,2,3,4,5,6,7,8].map(n => (
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

        <textarea name="sintomas" className="input" onChange={handleChange} />
        <textarea name="hidratacao" className="input" onChange={handleChange} />
      </section>

      {/* BOTÃO */}
      <button className="start" onClick={handleSubmit}>
        INICIAR SESSÃO DE TREINO
      </button>

    </div>
  );
}