import "../css/Pre-Sessao.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="container">

      {/* HEADER */}
      <header className="top">
        <div>
          <h2>SÃO CAMILO</h2>
          <p>Nutri - Esportiva</p>
        </div>
        <div className="session">● SESSÃO ATIVA</div>
      </header>

       {/* CLIMA */}
      <section className="clima">
        <div><strong>Temperatura</strong><br />31°C</div>
        <div><strong>Umidade</strong><br />68%</div>
        <div><strong>Radiação</strong><br />Alta</div>
        <div><strong>Vento</strong><br />12%</div>
      </section>

      {/* BOAS-VINDAS */}
      <section className="welcome">
        <h1>Olá, Atleta!</h1>
        <p>Pronto para iniciar uma nova avaliação?</p>
      </section>

      {/* ETAPAS */}
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

      {/* CHECKLIST */}
      <section className="box">
        <h2>Checklist de Padronização</h2>

        <label><input type="checkbox" /> Bexiga esvaziada antes das pesagens?</label>
        <label><input type="checkbox" /> Mesma balança e superfície nivelada?</label>
        <label><input type="checkbox" /> Vestimenta mínima e padronizada?</label>
        <label><input type="checkbox" /> Pesagem no horário relativo ao treino?</label>
      </section>

      {/* HIDRATAÇÃO */}
      <section className="box">
        <h2>Coloração da urina</h2>

        <div className="scale">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className="scale-box">{n}</div>
          ))}
        </div>

        <p className="alert red">ATENÇÃO: BEBA ÁGUA! VOCÊ ESTÁ MUITO DESIDRATADO</p>
      </section>

      {/* INPUT PESO */}
      <section className="box">
        <h2>Peso (kg)</h2>
        <input type="text" placeholder="Ex: 73,6" className="input" />
      </section>

      {/* BOTÃO */}
      <button className="start" onClick={() => navigate("/sessao")}>
        INICIAR SESSÃO DE TREINO
      </button>

    </div>
  );
}