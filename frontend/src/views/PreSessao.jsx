import "../css/Pre-Sessao.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

<<<<<<< HEAD
  const iniciarSessao = () => {
    const inicio = Date.now();
    localStorage.setItem("inicioSessao", inicio);
    navigate("/sessao");
  };
=======
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
>>>>>>> 6374a67620f7bfc93addc9122bc62671861cc1dd

  return (
    <div className="container">

      <header className="top">
        <div>
          <h2>SÃO CAMILO</h2>
          <p>Nutri - Esportiva</p>
        </div>
        <div className="session">● PRÉ-SESSÃO</div>
      </header>

<<<<<<< HEAD
      <section className="clima">
        <div><strong>Temperatura</strong><br />31°C</div>
        <div><strong>Umidade</strong><br />68%</div>
        <div><strong>Radiação</strong><br />Alta</div>
        <div><strong>Vento</strong><br />12%</div>
      </section>

=======
>>>>>>> 6374a67620f7bfc93addc9122bc62671861cc1dd
      <section className="welcome">
        <h1>Pré-Sessão</h1>
        <p>Preencha os dados antes do treino</p>
      </section>

<<<<<<< HEAD
      <section className="steps">
        <div className="step active">
          <span>1</span>
          <p>PRÉ</p>
        </div>

        <div className="step">
          <span>2</span>
          <p>DURANTE</p>
        </div>

        <div className="step">
          <span>3</span>
          <p>PÓS</p>
        </div>
      </section>

=======
      {/* MASSA */}
>>>>>>> 6374a67620f7bfc93addc9122bc62671861cc1dd
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

<<<<<<< HEAD
=======
      {/* AMBIENTE */}
>>>>>>> 6374a67620f7bfc93addc9122bc62671861cc1dd
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
<<<<<<< HEAD
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="scale-box">{n}</div>
          ))}
        </div>

        <p className="alert red">
          ATENÇÃO: BEBA ÁGUA! VOCÊ ESTÁ MUITO DESIDRATADO
        </p>
      </section>

      <section className="box">
        <h2>Peso pré-sessão (kg)</h2>
        <input type="text" placeholder="Ex: 73,6" className="input" />
      </section>

      <button className="start" onClick={iniciarSessao}>
=======
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
>>>>>>> 6374a67620f7bfc93addc9122bc62671861cc1dd
        INICIAR SESSÃO DE TREINO
      </button>

    </div>
  );
}