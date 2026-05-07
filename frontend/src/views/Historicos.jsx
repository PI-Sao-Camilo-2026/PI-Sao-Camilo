import "../css/Historicos.css";
import { useNavigate } from "react-router-dom";
import { GiSoccerBall } from "react-icons/gi";
import { FaDumbbell, FaHeartbeat, FaClipboardList } from "react-icons/fa";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineHeart,
  AiOutlineBell,
} from "react-icons/ai";

export default function Historico() {
  const navigate = useNavigate();

  const temNotificacao = true;
  <button
    className={`header-icon ${temNotificacao ? "notificacao-ativa" : ""}`}
  >
    <AiOutlineBell />
    {temNotificacao && <span className="notification-dot"></span>}
  </button>;

  const sessoesConcluidas = [];
  const sessoesVisiveis = sessoesConcluidas.filter(
    (sessao) => sessao.compartilhada == true,
  );
  const temSessoes = sessoesVisiveis.length > 0;
  return (
    <div className="historico-page">
      <div className="phone-screen">
        <header className="historico-header">
          <img src="/R.png" alt="Logo São Camilo" />
          <h1>SÃO CAMILO</h1>
          <p>Nutri - Esportiva</p>
          <span className="active">● SESSÃO ATIVA</span>
          <button className="header-icon">
            <AiOutlineBell />
          </button>
        </header>

        <main className="historico-main">
          <section className="titulo">
            <h1>Dashboard de Sessões</h1>
          </section>

          {!temSessoes ? (
            <div className="historico-vazio">
              <h2>Nenhuma sessão concluída</h2>
              <p>
                Fala, atleta! Conclua sua primeira sessão de treino para
                aparecer no seu histórico.
              </p>
            </div>
          ) : (
            <>
              <section>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon green">📅</div>
                    <p className="stat-label">SESSÕES</p>
                    <h3>24</h3>
                    <p className="stat-period">Este mês</p>
                    <span className="stat-growth">↑ 12% vs mês anterior</span>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon blue">⏱</div>
                    <p className="stat-label">TEMPO TOTAL</p>
                    <h3>18h 45m 12s</h3>
                    <p className="stat-period">Este mês</p>
                    <span className="stat-growth">↑ 8% vs mês anterior</span>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon red">🔥</div>
                    <p className="stat-label">ENERGIA TOTAL</p>
                    <h3>
                      18.750 <small>kcal</small>
                    </h3>
                    <p className="stat-period">Este mês</p>
                    <span className="stat-growth">↑ 15% vs mês anterior</span>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon purple">💧</div>
                    <p className="stat-label">HIDRATAÇÃO</p>
                    <h3>
                      28,6 <small>L</small>
                    </h3>
                    <p className="stat-period">Este mês</p>
                    <span className="stat-growth">↑ 10% vs mês anterior</span>
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
                    <div className="informacoes">
                      <p className="data-tempo">22/04/2026 | 01:25:54</p>
                      <div className="icone-aerobico">
                        <GiSoccerBall />
                      </div>
                      <h3>Futebol</h3>
                      <div className="resumo-resultados">
                        <span>💧 1,8 L/h</span>
                        <span></span>
                        <span>🔥 840 kcal</span>
                      </div>
                    </div>
                    <div className="direita">
                      <div className="status">CONCLUÍDA</div>
                      <span className="flecha">›</span>
                    </div>
                  </div>
                </div>

                <div className="cards-sessao">
                  <div className="esquerda">
                    <div className="icone-musculacao">
                      <FaDumbbell />
                    </div>
                    <div className="informacoes">
                      <p className="data-tempo">23/04/2026 | 01:04:37</p>
                      <h3>Musculação</h3>
                      <div className="resumo-resultados">
                        <span>💧 2,4 L/h</span>
                        <span></span>
                        <span>🔥 1250 kcal</span>
                      </div>
                    </div>
                    <div className="direita">
                      <div className="status">CONCLUÍDA</div>
                      <span className="flecha">›</span>
                    </div>
                  </div>
                </div>

                <div className="cards-sessao">
                  <div className="esquerda">
                    <div className="icone-aerobico">
                      <FaHeartbeat />
                    </div>
                    <div className="informacoes">
                      <p className="data-tempo">25/04/2026 | 00:40:07</p>
                      <h3>Aeróbico</h3>
                      <div className="resumo-resultados">
                        <span>💧 0,9 L/h</span>
                        <span></span>
                        <span>🔥 650 kcal</span>
                      </div>
                    </div>
                    <div className="direita">
                      <div className="status">CONCLUÍDA</div>
                      <span className="flecha">›</span>
                    </div>
                  </div>
                </div>

                <div className="cards-sessao">
                  <div className="esquerda">
                    <div className="icone-musculacao">🏋️</div>
                    <div className="informacoes">
                      <p className="data-tempo">23/04/2026 | 01:04:37</p>
                      <h3>Musculação</h3>
                      <div className="resumo-resultados">
                        <span>💧 2,4 L/h</span>
                        <span></span>
                        <span>🔥 1250 kcal</span>
                      </div>
                    </div>
                    <div className="direita">
                      <div className="status">CONCLUÍDA</div>
                      <span className="flecha">›</span>
                    </div>
                  </div>
                </div>
              </section>

              <button className="btn-voltar" onClick={() => navigate("/")}>
                Voltar para pré-sessão
              </button>
            </>
          )}
        </main>

        <nav className="bottom-nav">
          <div className="nav-item">
            <span className="nav-icon vazio">
              <AiOutlineHome />
            </span>
            <p>INÍCIO</p>
          </div>

          <div>
            <div className="nav-item active-nav">
              <span className="nav-icon">
                <FaClipboardList />
              </span>
              <p>HISTÓRICO</p>
            </div>
          </div>

          <div className="nav-item">
            <span className="nav-icon vazio">
              <AiOutlineHeart />
            </span>
            <p>OBSERVAÇÕES</p>
          </div>

          <div className="nav-item">
            <span className="nav-icon vazio">
              <AiOutlineUser />
            </span>
            <p>PERFIL</p>
          </div>
        </nav>
      </div>
    </div>
  );
}
