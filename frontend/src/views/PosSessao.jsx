import "../css/Pos-Sessao.css";
import { useNavigate } from "react-router-dom";

export default function PosSessao() {
  const navigate = useNavigate();

  return (
    <div className="pos-container">

      {/* HEADER */}
      <header className="top">
        <h2>SÃO CAMILO</h2>
        <p>Nutri - Esportiva</p>
        <span className="active">● PÓS-SESSÃO</span>
      </header>

      {/* TEMPO */}
      <section className="tempo">
        <h1>01 : 25 : 54</h1>
        <p>TEMPO TOTAL DA SESSÃO</p>
      </section>

      {/* RESUMO DE INGESTÃO */}
      <section className="box">
        <h2>Resumo de Ingestão</h2>

        <div className="grid">
          <div>
            <strong>Água</strong>
            <span>750 mL</span>
          </div>

          <div>
            <strong>Isotônico</strong>
            <span>200 mL</span>
          </div>

          <div>
            <strong>Outros</strong>
            <span>0 mL</span>
          </div>
        </div>

        <p className="total">TOTAL: 950 mL</p>

        <div className="grid">
          <div>
            <strong>Gel</strong>
            <span>0 g</span>
          </div>

          <div>
            <strong>Fruta</strong>
            <span>90 g</span>
          </div>

          <div>
            <strong>Outros</strong>
            <span>0 g</span>
          </div>
        </div>

        <p className="total">TOTAL: 90 g</p>
      </section>

      {/* PESO */}
      <section className="box">
        <h2>Peso (kg)</h2>

        <div className="peso">
          <div>
            <span>Pré</span>
            <strong>73,6 kg</strong>
          </div>

          <div>
            <span>Pós</span>
            <strong>72,9 kg</strong>
          </div>
        </div>

        <p className="info">(NORMAL) Perda de 1,6%</p>
      </section>

      {/* ENERGIA */}
      <section className="box">
        <h2>Indicadores</h2>

        <p>Gasto energético: <strong>840 kcal</strong></p>
        <p>Ingestão energética: <strong>210 kcal</strong></p>
        <p className="alert">Saldo: -630 kcal (Déficit)</p>
      </section>

      {/* BOTÃO */}
      <button 
        className="finalizar"
        onClick={() => navigate("/relatorios")}
      >
        GERAR RELATÓRIO DA SESSÃO
      </button>

    </div>
  );
}