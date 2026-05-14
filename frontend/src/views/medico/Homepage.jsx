import "../../css/Homepage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { relatoriosApi } from "../../services/api";
import {
  AiOutlineUser, AiOutlineBell, AiFillBell,
  AiOutlineExclamationCircle, AiFillHome,
} from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";

export default function Homepage() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await relatoriosApi.dashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const temDados = stats && (stats.total_atletas > 0 || stats.total_sessoes > 0);

  return (
    <div className="homepage-page">
      <div className="phone-screen">
        <header className="homepage-header">
          <img src="/R.png" alt="Logo São Camilo" />
          <h1>SÃO CAMILO</h1>
          <p>Nutri - Esportiva</p>
          <span className="active">● SESSÃO ATIVA</span>
          <button className="header-icon">
            <AiOutlineBell className="notificacao-vazia" />
          </button>
        </header>

        <main className="homepage-main">
          <section className={temDados ? "medico-area" : "medico-area vazio"}>
            <img
              className="medico-icon"
              src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png"
              alt="silhueta medicina"
            />
            <div>
              <h2>Olá, {usuario?.nome?.split(" ")[0] || "Doutor"}!</h2>
              <p>
                {loading
                  ? "Carregando dados..."
                  : temDados
                  ? "Aqui está o panorama geral dos atletas."
                  : "Quando atletas forem vinculados e sessões forem concluídas, os indicadores aparecerão aqui."}
              </p>
            </div>
          </section>

          {!loading && temDados && (
            <>
              {/* Stats reais */}
              <section>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3 className="stat-label">ATLETAS</h3>
                    <strong>{stats.total_atletas}</strong>
                    <p className="stat-growth">Ativos</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-label">SESSÕES</h3>
                    <strong>{stats.total_sessoes}</strong>
                    <p className="stat-growth">Concluídas</p>
                  </div>
                </div>
              </section>

              {/* Resumo hidratação */}
              <section className="section-title">
                <h2>RESUMO HIDRATAÇÃO <span>(MÉDIA)</span></h2>
              </section>

              <section className="hydration-grid">
                <div className="hydration-card">
                  <p>Taxa média</p>
                  <strong>{stats.taxa_media_l_h ? `${stats.taxa_media_l_h} L/h` : "--"}</strong>
                  <span>{stats.taxa_media_l_h > 1.5 ? "Excelente" : "Regular"}</span>
                </div>
                <div className="hydration-card">
                  <p>Perda média</p>
                  <strong>{stats.perda_media_pct ? `${stats.perda_media_pct}%` : "--"}</strong>
                  <span>{stats.perda_media_pct <= 2 ? "Dentro da meta" : "Atenção"}</span>
                </div>
                {stats.por_modalidade?.slice(0, 1).map((m) => (
                  <div className="hydration-card" key={m.modalidade}>
                    <p>{m.modalidade}</p>
                    <strong>{m.taxa_media} L/h</strong>
                    <span>Taxa modal.</span>
                  </div>
                ))}
              </section>

              {/* Alertas reais */}
              {stats.alertas?.length > 0 && (
                <section className="insights-box">
                  <h2>ALERTAS</h2>
                  {stats.alertas.slice(0, 3).map((a, i) => (
                    <div className="insight-item danger" key={i}>
                      <AiOutlineExclamationCircle />
                      <p>
                        {a.atleta_nome} — perda de {a.variacao_pct?.toFixed(1)}% de massa
                      </p>
                    </div>
                  ))}
                </section>
              )}

              <button className="atletas-btn" onClick={() => navigate("/atletas")}>
                <span>VER ATLETAS INDIVIDUALMENTE</span>
              </button>
            </>
          )}
        </main>

        <nav className="bottom-nav">
          <div className="nav-item active-nav">
            <span className="nav-icon"><AiFillHome /></span>
            <p>INÍCIO</p>
          </div>
          <div className="nav-item" onClick={() => navigate("/atletas")}>
            <span className="nav-icon vazio"><HiOutlineUserGroup /></span>
            <p>ATLETAS</p>
          </div>
          <div className="nav-item">
            <span className="nav-icon vazio"><AiOutlineBell /></span>
            <p>ALERTAS</p>
          </div>
          <div className="nav-item" onClick={() => logout(navigate)}>
            <span className="nav-icon vazio"><AiOutlineUser /></span>
            <p>PERFIL</p>
          </div>
        </nav>
      </div>
    </div>
  );
}