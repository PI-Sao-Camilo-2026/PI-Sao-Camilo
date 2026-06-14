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
  CartesianGrid,
  Legend
} from "recharts";

// ── ÍCONES SVG PARA COMPLEMENTAR VISUALMENTE OS CARDS ───────────────────────
const IconAtletas = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
  </svg>
);
const IconSudorese = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
const IconMassa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L3.41 13.41a2 2 0 0 1 0-2.83l7.17-7.17a2 2 0 0 1 2.83 0l7.17 7.17a2 2 0 0 1 0 2.83z" />
  </svg>
);
const IconSessoes = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function Homepage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30");
  async function carregarDashboard() {
    setLoading(true);

    try {
      const data = await relatoriosApi.dashboardStats(periodo);
      console.log("DASHBOARD:", data);
      console.log("POR MODALIDADE:", data?.por_modalidade);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, [periodo]);

  useEffect(() => {
    const atualizarDashboard = () => {
      carregarDashboard();
    };

    window.addEventListener("dashboard-refresh", atualizarDashboard);

    return () => {
      window.removeEventListener(
        "dashboard-refresh",
        atualizarDashboard
      );
    };
  }, []);


  const totalAtletas = stats?.total_atletas ?? 0;
  const totalAtletasSub = stats?.total_atletas_sub ?? "—";

  const taxaMedia = stats?.taxa_media_l_h ?? null;
  const taxaMediaSub = stats?.taxa_media_sub ?? "—";

  const perdaMedia = stats?.perda_media_pct ?? null;
  const perdaMediaSub = stats?.perda_media_sub ?? "—";

  const totalSessoes = stats?.total_sessoes ?? 0;
  const totalSessoesSub = stats?.total_sessoes_sub ?? "—";

  const dadosGrafico = stats?.evolucao_sudorese ?? [];
  const alertas = stats?.alertas ?? [];

  // CORREÇÃO CRÍTICA: Sincronizado exatamente com a chave "por_modalidade" enviada pelo backend
  const porMod = stats?.por_modalidade ?? [];

  // Mapeamento dinâmico das modalidades presentes no eixo X para criar as linhas automaticamente
  const modalidadesChaves = dadosGrafico.length > 0
    ? Object.keys(dadosGrafico[0]).filter(key => key !== "data")
    : [];

  // Paleta de cores para aplicar sequencialmente em cada modalidade do gráfico
  const paletaCores = ["#991b1f", "#e11d48", "#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

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
            icon={<IconAtletas />}
            iconClass="icon-blue"
            label="TOTAL DE ATLETAS"
            value={loading ? "..." : totalAtletas}
            sub={totalAtletasSub}
            subClass="trend-danger"
          />
          <StatCard
            icon={<IconSudorese />}
            iconClass="icon-pink"
            label="TAXA MÉDIA DE SUDORESE"
            value={loading ? "..." : taxaMedia ? `${taxaMedia} L/h` : "—"}
            sub={taxaMediaSub}
            subClass="trend-neutral"
          />
          <StatCard
            icon={<IconMassa />}
            iconClass="icon-pink-dark"
            label="PERDA MÉDIA DE MASSA"
            value={loading ? "..." : perdaMedia ? `${perdaMedia}%` : "—"}
            sub={perdaMediaSub}
            subClass="trend-success"
          />
          <StatCard
            icon={<IconSessoes />}
            iconClass="icon-red"
            label="SESSÕES REGISTRADAS"
            value={loading ? "..." : totalSessoes}
            sub={totalSessoesSub}
            subClass="trend-danger"
          />
        </div>

        {/* Seção Central: Gráficos lado a lado */}
        <div className="dashboard-charts-grid">

          {/* Gráfico de Evolução por Data (Esquerda) */}
          <div className="chart-container main-chart">
            <div className="chart-header-row">
              <div>
                <h3>Tendência de Desidratação</h3>
                <p className="chart-sub">Média de perda de massa por data e modalidade (%)</p>
              </div>
              <button className="btn-more-options">•••</button>
            </div>

            <div className="recharts-wrapper-box" style={{ width: "100%", height: 240, marginTop: 16 }}>
              {loading ? (
                <div className="chart-loading">Carregando dados...</div>
              ) : dadosGrafico.length === 0 ? (
                <div className="chart-loading" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: 13 }}>
                  Nenhum registro encontrado no período.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      {modalidadesChaves.map((mod, i) => (
                        <linearGradient key={mod} id={`colorGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={paletaCores[i % paletaCores.length]} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={paletaCores[i % paletaCores.length]} stopOpacity={0.0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, "Perda de Massa"]} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                    {modalidadesChaves.map((mod, i) => (
                      <Area
                        key={mod}
                        type="monotone"
                        dataKey={mod}
                        stroke={paletaCores[i % paletaCores.length]}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#colorGrad-${i})`}
                        name={mod}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráfico Por Modalidade - Distribuição Real Corrigido (Direita) */}
          <div className="chart-container side-chart">
            <h3>Distribuição por Modalidade</h3>
            <p className="chart-sub" style={{ marginBottom: 24 }}>Proporção do total de avaliações feitas</p>

            <div className="modalidades-list">
              {loading ? (
                <div className="chart-loading">Carregando dados...</div>
              ) : porMod.length === 0 ? (
                <div className="chart-loading" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 150, color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>
                  Nenhuma avaliação registrada no banco de dados para este período.
                </div>
              ) : (
                porMod.map((m) => {
                  return (
                    <div key={m.modalidade} className="mod-row" style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 4, fontSize: 12, fontWeight: 700 }}>
                        <span className="mod-name" style={{ color: "var(--text)" }}>{m.modalidade}</span>
                        <span style={{ marginLeft: "auto", color: "var(--text-2)", fontSize: 11 }}>
                          {m.quantidade} {m.quantidade === 1 ? "avaliação" : "avaliações"} ({m.percentual}%)
                        </span>
                      </div>
                      <div className="mod-bar-bg" style={{ height: 6, background: "#f0f0f2", borderRadius: 4 }}>
                        <div
                          className="mod-bar-fill"
                          style={{
                            width: `${m.percentual}%`,
                            background: "var(--red)",
                            height: "100%",
                            borderRadius: 4,
                            transition: "width 0.3s ease"
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Alertas Recentes Corrigidos de acordo com as chaves do Backend */}
        <div className="alertas-section-wrapper">
          <div className="alertas-header-row">
            <h3>Alertas Recentes</h3>
            <button className="btn-ver-todos">Ver todos ↗</button>
          </div>

          <div className="alertas-grid">
            {alertas.length === 0 ? (
              <div style={{ padding: 20, color: "var(--text-3)", fontSize: 13, textAlign: "center", width: "100%" }}>
                Nenhum alerta crítico gerado para este período.
              </div>
            ) : (
              alertas.slice(0, 3).map((alerta, i) => {
                let badgeClass = "badge-red";
                let badgeIcon = (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                );

                if (alerta.tipo === "incompleto") {
                  badgeClass = "badge-yellow";
                  badgeIcon = (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  );
                }

                return (
                  <div key={i} className="alerta-card-novo">
                    <div className="alerta-card-header">
                      <div className={`alerta-badge-icon ${badgeClass}`}>{badgeIcon}</div>
                      <div className="alerta-meta">
                        {/* CORREÇÃO: Mapeado com as chaves exatas geradas pelo Python */}
                        <h4>{alerta.titulo}</h4>
                        <span className="alerta-time">{alerta.tempo}</span>
                      </div>
                    </div>
                    <p className="alerta-desc" dangerouslySetInnerHTML={{ __html: alerta.descricao }} />
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ icon, iconClass, label, value, sub, subClass = "" }) {
  return (
    <div className="stat-card-novo">
      <div className={`stat-icon-circle ${iconClass}`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <span className="stat-label-text">{label}</span>
      <h2 className="stat-value-text">{value}</h2>
      <div className={`stat-sub-text ${subClass}`}>{sub}</div>
    </div>
  );
}