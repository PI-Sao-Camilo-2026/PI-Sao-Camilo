import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { sessoesApi } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const isProfissional = usuario?.tipo === "profissional";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessoesApi.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout(navigate);
    navigate("/");
  }

  if (isProfissional) {
    return (
      <div className="home-root profissional">
        <header className="home-header">
          <div className="header-brand">
            <span className="brand-drop">💧</span>
            <span className="brand-name">HydroTrack</span>
            <span className="brand-badge prof">Profissional</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </header>

        <section className="home-hero prof-hero">
          <h1>Painel do Profissional</h1>
          <p>Monitore e analise a hidratação dos seus atletas em tempo real.</p>
        </section>

        <div className="home-grid">
          <button className="home-card card-atletas" onClick={() => navigate("/atletas")}>
            <span className="card-icon">👥</span>
            <div className="card-info">
              <strong>Meus Atletas</strong>
              <small>Gerencie e acompanhe cada atleta</small>
            </div>
            <span className="card-arrow">→</span>
          </button>

          <button className="home-card card-relatorios" onClick={() => navigate("/relatorios-prof")}>
            <span className="card-icon">📊</span>
            <div className="card-info">
              <strong>Relatórios</strong>
              <small>Análises e gráficos de desempenho</small>
            </div>
            <span className="card-arrow">→</span>
          </button>

          <button className="home-card card-historico" onClick={() => navigate("/historico-prof")}>
            <span className="card-icon">📅</span>
            <div className="card-info">
              <strong>Histórico</strong>
              <small>Sessões detalhadas por atleta</small>
            </div>
            <span className="card-arrow">→</span>
          </button>

          <button className="home-card card-config" onClick={() => navigate("/configuracoes")}>
            <span className="card-icon">⚙️</span>
            <div className="card-info">
              <strong>Configurações</strong>
              <small>Perfil e preferências</small>
            </div>
            <span className="card-arrow">→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-root atleta">
      <header className="home-header">
        <div className="header-brand">
          <span className="brand-drop">💧</span>
          <span className="brand-name">HydroTrack</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      <section className="home-hero atleta-hero">
        <h1>Pronto para treinar?</h1>
        <p>Registre sua hidratação e acompanhe sua evolução.</p>
        <button className="btn-cta" onClick={() => navigate("/presessao")}>
          Iniciar Treino
        </button>
      </section>

      {!loading && stats && (
        <section className="home-stats">
          <h2>Seu resumo</h2>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{stats.total_sessoes ?? 0}</span>
              <span className="stat-label">Sessões</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {stats.taxa_media ? Number(stats.taxa_media).toFixed(2) : "—"}
              </span>
              <span className="stat-label">Taxa média (L/h)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {stats.maior_perda_pct ? `${Number(stats.maior_perda_pct).toFixed(1)}%` : "—"}
              </span>
              <span className="stat-label">Maior perda</span>
            </div>
          </div>
        </section>
      )}

      <div className="home-grid">
        <button className="home-card card-historico" onClick={() => navigate("/historico")}>
          <span className="card-icon">📅</span>
          <div className="card-info">
            <strong>Histórico</strong>
            <small>Veja suas sessões anteriores</small>
          </div>
          <span className="card-arrow">→</span>
        </button>

        <button className="home-card card-guia" onClick={() => navigate("/guia")}>
          <span className="card-icon">💡</span>
          <div className="card-info">
            <strong>Guia de Hidratação</strong>
            <small>Dicas e recomendações</small>
          </div>
          <span className="card-arrow">→</span>
        </button>

        <button className="home-card card-perfil" onClick={() => navigate("/perfil")}>
          <span className="card-icon">👤</span>
          <div className="card-info">
            <strong>Meu Perfil</strong>
            <small>Edite seus dados</small>
          </div>
          <span className="card-arrow">→</span>
        </button>
      </div>
    </div>
  );
}