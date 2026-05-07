import "../../css/Homepage.css";
import {
  AiOutlineUser,
  AiOutlineBell,
  AiFillBell,
  AiOutlineExclamationCircle,
  AiOutlineTeam,
} from "react-icons/ai";
import { FaHome } from "react-icons/fa";

export default function Homepage() {
  const temNotificacao = false;

  const atletas = [];
  const sessoes = [];

  const mostrarDashboard = atletas.length > 0 || sessoes.length > 0;

  return (
    <div className="homepage-page">
      <div className="phone-screen">
        <header className="homepage-header">
          <img src="/R.png" alt="Logo São Camilo" />
          <h1>SÃO CAMILO</h1>
          <p>Nutri - Esportiva</p>
          <span className="active">● SESSÃO ATIVA</span>
          <button className="header-icon">
            {temNotificacao ? (
              <AiFillBell className="notificacao-ativa" />
            ) : (
              <AiOutlineBell className="notificacao-vazia" />
            )}

            {temNotificacao && <span className="notification-dot"></span>}
          </button>
        </header>
        <main className="homepage-main">
          <section
            className={mostrarDashboard ? "medico-area" : "medico-area vazio"}
          >
            <img
              className="medico-icon"
              src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png"
              alt="silhueta medicina"
            />

            <div>
              <h2>Olá, Doutor!</h2>
              <p>
                {mostrarDashboard
                  ? "Aqui está o panorama geral dos atletas."
                  : "Quando atletas forem vinculados e sessões forem concluídas, os relatórios e indicadores aparecerão aqui."}
              </p>
            </div>
          </section>
          {mostrarDashboard ? (
            <>
              <div className="select-wrapper">
                <select className="filter-select">
                  <option>Todos os Atletas</option>
                  <option>Atletas de Basquete</option>
                  <option>Atletas de Corrida</option>
                  <option>Atletas de Futebol</option>
                  <option>Atletas de Natação</option>
                </select>

                <span className="seta-filtro">▾</span>
              </div>
              <section>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3 className="stat-label">ATLETAS</h3>
                    <strong>24</strong>
                    <p className="stat-growth">Ativos</p>
                  </div>

                  <div className="stat-card">
                    <h3 className="stat-label">SESSÕES</h3>
                    <strong>48</strong>
                    <p className="stat-growth">↑ 8% vs mês anterior</p>
                  </div>
                </div>
              </section>
              <section className="section-title">
                <h2>
                  RESUMO HIDRATAÇÃO <span>(MÉDIA)</span>
                </h2>
              </section>
              <section className="hydration-grid">
                <div className="hydration-card">
                  <p>Hidratação</p>
                  <strong>1,7 L/h</strong>
                  <span>Excelente</span>
                </div>

                <div className="hydration-card">
                  <p>Perda de peso</p>
                  <strong>1,6%</strong>
                  <span>Dentro da meta</span>
                </div>

                <div className="hydration-card">
                  <p>Taxa de suor</p>
                  <strong>1,5 L/h</strong>
                  <span>Adequada</span>
                </div>
              </section>

              <section className="insights-box">
                <h2>INSIGHTS PRINCIPAIS</h2>
                <div className="insight-item danger">
                  <AiOutlineExclamationCircle />
                  <p>2 atletas com risco de desidratação elevada</p>
                </div>

                <div className="insight-item warning">
                  <AiOutlineExclamationCircle />
                  <p>
                    1 atleta com possível hiponatremia associada ao exercício
                  </p>
                </div>

                <div className="insight-item success">
                  <AiOutlineExclamationCircle />
                  <p>Aumento da taxa de sudorese em clima quente (+19%)</p>
                </div>
              </section>

              <button className="atletas-btn">
                <span>VER TODOS OS ATLETAS</span>
              </button>
            </>
          ) : null}
        </main>
        <nav className="bottom-nav">
          <div className="nav-item active-nav">
            <span className="nav-icon vazio">
              <FaHome />
            </span>
            <p>INÍCIO</p>
          </div>

          <div className="nav-item">
            <span className="nav-icon">
              <AiOutlineTeam />
            </span>
            <p>ATLETAS</p>
          </div>

          <div className="nav-item">
            <span className="nav-icon vazio">
              <AiOutlineBell />
            </span>
            <p>ALERTAS</p>
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
