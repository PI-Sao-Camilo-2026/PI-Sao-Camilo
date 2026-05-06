import "../css/Historicos.css";
import { useNavigate } from "react-router-dom";

export default function Historico() {
  const navigate = useNavigate();

  return (
    <div className="historico-page">
      <div className="phone-screen">
        <header className="historico-header">
          <img src="/R.png" alt="Logo São Camilo" />
          <h1>SÃO CAMILO</h1>
          <p>Nutri - Esportiva</p>
          <span className="active">● SESSÃO ATIVA</span>
        </header>

        <main>
          <section className="titulo">
            <h1>Dashboard de Sessões</h1>
          </section>

          <section>
            <div className="cards-topo">
              <div className="card-estatistica">
                <div className="icone">⏱</div>
                <p className="periodo">PERÍODO</p>
                <h3 className="valor">24</h3>
                <p className="periodo-tempo">Este Mês</p>
                <span>12% vs mês anterior</span>
              </div>
              <div className="card-estatistica">
                <div className="icone">⏱</div>
                <p className="tempo">TEMPO TOTAL</p>
                <h3 className="valor">18h 45m 29s</h3>
                <p className="periodo-tempo">Este mês</p>
                <span>8% vs mês anterior</span>
              </div>
              <div className="card-estatistica">
                <div className="icone">⏱</div>
                <p className="energia">ENERGIA GASTA</p>
                <h3 className="valor">18.750 kcal</h3>
                <p className="periodo-tempo">Este mês</p>
                <span>15% vs mês anterior</span>
              </div>
              <div className="card-estatistica">
                <div className="icone">⏱</div>
                <p className="hidratacao">HIDRATAÇÃO</p>
                <h3 className="valor">28,6 L</h3>
                <p className="periodo-tempo">Este mês</p>
                <span>10% vs mês anterior</span>
              </div>
            </div>
          </section>

          <section className="secao-sessoes">
            <div className="titulo-sessoes">
              <span className="icone-sessoes"></span>
              <h2>ÚLTIMAS SESSÕES</h2>
            </div>

            <div className="cards-sessao">
              <div className="esquerda">
                <div className="icone-futebol"></div>
                <div className="informacoes">
                  <div></div>
                </div>
              </div>
              <p><strong>Data:</strong> 12/05/2026</p>
              <p><strong>Duração:</strong> 01:20:30</p>
              <p><strong>Déficit:</strong> -500 kcal</p>
            </div>

            <div className="item">
              <p><strong>Data:</strong> 10/05/2026</p>
              <p><strong>Duração:</strong> 00:58:10</p>
              <p><strong>Déficit:</strong> -320 kcal</p>
            </div>

            <div className="item">
              <p><strong>Data:</strong> 08/05/2026</p>
              <p><strong>Duração:</strong> 01:35:00</p>
              <p><strong>Déficit:</strong> -710 kcal</p>
            </div>
          </section>

          <button
            className="btn-voltar"
            onClick={() => navigate("/")}
          >
            Voltar para Home
          </button>
        </main>

        <nav className="bottom-nav">
          <div>
            <span>⌂</span>
            <p>INÍCIO</p>
          </div>

          <div>
            <span>▤</span>
            <p>HISTÓRICO</p>
          </div>

          <div>
            <span>♡</span>
            <p>OBSERVAÇÕES</p>
          </div>

          <div>
            <span>♙</span>
            <p>PERFIL</p>
          </div>
        </nav>
      </div>
    </div>
  );
}