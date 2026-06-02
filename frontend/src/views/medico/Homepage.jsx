// src/views/medico/Homepage.jsx
import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { relatoriosApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function Homepage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30");

  useEffect(() => {
    relatoriosApi.dashboardStats(periodo)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [periodo]);

  const totalAtletas = stats?.total_atletas ?? 0;
  const totalAtletasSub = stats?.total_atletas_sub ?? "—";
  
  const taxaMedia = stats?.taxa_media_l_h ?? null;
  const taxaMediaSub = stats?.taxa_media_sub ?? "—";
  
  const perdaMedia = stats?.perda_media_pct ?? null;
  const perdaMediaSub = stats?.perda_media_sub ?? "—";
  
  const totalSessoes = stats?.total_sessoes ?? 0;
  const totalSessoesSub = stats?.total_sessoes_sub ?? "—";

  const dadosGrafico = stats?.evolucao_sudorese ?? [];
  const porMod = stats?.por_modalidade ?? [];
  const alertas = stats?.alertas ?? [];

  const handleGerarRelatorio = () => {
    alert("Gerando relatório consolidado dos atletas...");
  };

  return (
    <div className="prof-layout">
      <Sidebar active="dashboard" />
      <main className="prof-main">

        {/* Header idêntico ao protótipo */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Visão Geral</h1>
            <p>Acompanhamento de hidratação e performance da equipe</p>
          </div>
          <div className="page-header-right">
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              className="periodo-select"
            >
              <option value="30">Últimos 30 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="7">Últimos 7 dias</option>
            </select>
            <button className="btn-gerar-relatorio" onClick={handleGerarRelatorio}>
              <span className="btn-icon"></span> Gerar Relatório
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas principais */}
        <div className="stats-row">
          <StatCard
            icon=""
            iconClass="icon-blue"
            label="TOTAL DE ATLETAS"
            value={loading ? "..." : totalAtletas}
            sub={totalAtletasSub}
            subClass="trend-danger" 
          />
          <StatCard
            icon=""
            iconClass="icon-pink"
            label="TAXA MÉDIA DE SUDORESE"
            value={loading ? "..." : taxaMedia ? `${taxaMedia} L/h` : "—"}
            sub={taxaMediaSub}
            subClass="trend-neutral"
          />
          <StatCard
            icon=""
            iconClass="icon-pink-dark"
            label="PERDA MÉDIA DE MASSA"
            value={loading ? "..." : perdaMedia ? `${perdaMedia}%` : "—"}
            sub={perdaMediaSub}
            subClass="trend-success"
          />
          <StatCard
            icon=""
            iconClass="icon-red"
            label="SESSÕES REGISTRADAS"
            value={loading ? "..." : totalSessoes}
            sub={totalSessoesSub}
            subClass="trend-danger"
          />
        </div>

        {/* Seção Central: Gráficos lado a lado */}
        <div className="dashboard-charts-grid">
          
          {/* Gráfico de Evolução (Esquerda) */}
          <div className="chart-container main-chart">
            <div className="chart-header-row">
              <div>
                <h3>Evolução da Sudorese</h3>
                <p className="chart-sub">Comparação média entre as principais equipes (L/h)</p>
              </div>
              <button className="btn-more-options">•••</button>
            </div>

            <div className="recharts-wrapper-box" style={{ width: "100%", height: 240, marginTop: 16 }}>
              {loading ? (
                <div className="chart-loading">Carregando dados...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#991b1f" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#991b1f" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis domain={[0, 1.8]} ticks={[0, 0.45, 0.9, 1.35, 1.8]} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="equipe_principal" stroke="#991b1f" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrincipal)" name="Equipe Principal" />
                    <Area type="monotone" dataKey="equipe_base" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBase)" name="Equipe Base" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legenda Customizada idêntica à imagem */}
            <div className="custom-chart-legend">
              <span className="legend-item"><span className="bullet principal"></span> Equipe Principal</span>
              <span className="legend-item"><span className="bullet base"></span> Equipe Base</span>
            </div>
          </div>

          {/* Gráfico Por Modalidade (Direita) */}
          <div className="chart-container side-chart">
            <h3>Por Modalidade</h3>
            <p className="chart-sub" style={{ marginBottom: 24 }}>Média (L/h)</p>
            
            <div className="modalidades-list">
              {porMod.map((m) => {
                const maxTaxa = Math.max(...porMod.map(x => x.taxa_media), 1);
                const pct = (m.taxa_media / maxTaxa) * 100;
                return (
                  <div key={m.modalidade} className="mod-row">
                    <span className="mod-name">{m.modalidade}</span>
                    <div className="mod-bar-bg">
                      <div className="mod-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Alertas Recentes */}
        <div className="alertas-section-wrapper">
          <div className="alertas-header-row">
            <h3>Alertas Recentes</h3>
            <button className="btn-ver-todos">Ver todos ↗</button>
          </div>

          <div className="alertas-grid">
            {alertas.slice(0, 3).map((alerta, i) => {
              // Mapeamento dinâmico de cores dos ícones de acordo com o tipo
              let badgeClass = "badge-red";
              let badgeIcon = "";
              if (alerta.tipo === "incompleto") { badgeClass = "badge-yellow"; badgeIcon = ""; }
              if (alerta.tipo === "melhora") { badgeClass = "badge-pink"; badgeIcon = ""; }

              return (
                <div key={i} className="alerta-card-novo">
                  <div className="alerta-card-header">
                    <div className={`alerta-badge-icon ${badgeClass}`}>{badgeIcon}</div>
                    <div className="alerta-meta">
                      <h4>{alerta.titulo}</h4>
                      <span className="alerta-time">{alerta.tempo}</span>
                    </div>
                  </div>
                  <p className="alerta-desc" dangerouslySetInnerHTML={{ __html: alerta.descricao }} />
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ icon, iconClass, label, value, sub, subClass = "" }) {
  return (
    <div className="stat-card-novo">
      <div className={`stat-icon-circle ${iconClass}`}>{icon}</div>
      <span className="stat-label-text">{label}</span>
      <h2 className="stat-value-text">{value}</h2>
      <div className={`stat-sub-text ${subClass}`}>{sub}</div>
    </div>
  );
}