// src/views/medico/Homepage.jsx
import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { relatoriosApi, usuariosApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Homepage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    relatoriosApi.dashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const taxaMedia = stats?.taxa_media_l_h ?? null;
  const perdaMedia = stats?.perda_media_pct ?? null;
  const totalAtletas = stats?.total_atletas ?? 0;
  const totalSessoes = stats?.total_sessoes ?? 0;
  const alertas = stats?.alertas ?? [];
  const porMod = stats?.por_modalidade ?? [];

  return (
    <div className="prof-layout">
      <Sidebar active="dashboard" />
      <main className="prof-main">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Visão Geral</h1>
            <p>Acompanhamento de hidratação e performance da equipe</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-row">
          <StatCard
            icon="👤"
            label="Total de Atletas"
            value={loading ? "..." : totalAtletas}
            sub={totalAtletas > 0 ? "Ativos" : "Nenhum vinculado"}
          />
          <StatCard
            icon="💧"
            label="Taxa Média de Sudorese"
            value={loading ? "..." : taxaMedia ? `${taxaMedia} L/h` : "—"}
            sub={taxaMedia ? (taxaMedia >= 1.5 ? "Excelente" : "Regular") : "Sem dados"}
            subClass={taxaMedia && taxaMedia < 1 ? "warn" : ""}
          />
          <StatCard
            icon="⚖️"
            label="Perda Média de Massa"
            value={loading ? "..." : perdaMedia ? `${perdaMedia}%` : "—"}
            sub={perdaMedia ? (perdaMedia <= 2 ? "Adequado (< 2%)" : "Atenção") : "Sem dados"}
            subClass={perdaMedia && perdaMedia > 2 ? "danger" : ""}
          />
          <StatCard
            icon="📊"
            label="Sessões Registradas"
            value={loading ? "..." : totalSessoes}
            sub="Total acumulado"
          />
        </div>

        {/* Por modalidade */}
        {porMod.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>
              Taxa de Sudorese por Modalidade
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {porMod.map((m) => {
                const maxTaxa = Math.max(...porMod.map(x => x.taxa_media));
                const pct = maxTaxa > 0 ? (m.taxa_media / maxTaxa) * 100 : 0;
                return (
                  <div key={m.modalidade} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 90, fontSize: 12, color: "var(--text-2)", flexShrink: 0 }}>
                      {m.modalidade}
                    </span>
                    <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--red)", borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", width: 60, textAlign: "right" }}>
                      {m.taxa_media} L/h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alertas */}
        {alertas.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Alertas Recentes</h3>
            </div>
            <div className="alertas-grid">
              {alertas.slice(0, 3).map((a, i) => (
                <div key={i} className="alerta-card">
                  <div className="alerta-card-header">
                    <div className="alerta-icon">⚠️</div>
                    <div>
                      <h4>Desidratação Grave</h4>
                      <div className="alerta-time">
                        {a.data ? new Date(a.data).toLocaleDateString("pt-BR") : "—"}
                      </div>
                    </div>
                  </div>
                  <p>
                    Atleta <strong>{a.atleta_nome}</strong> registrou perda de massa de{" "}
                    <strong>{a.variacao_pct?.toFixed(1)}%</strong> na sessão.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && totalSessoes === 0 && (
          <div style={{
            background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "40px", textAlign: "center", color: "var(--text-3)"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-2)", marginBottom: 6 }}>
              Nenhuma sessão registrada ainda
            </h3>
            <p style={{ fontSize: 13 }}>
              Quando seus atletas concluírem sessões, os dados aparecerão aqui.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, subClass = "" }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ fontSize: 16 }}>{icon}</div>
      <label>{label}</label>
      <div className="stat-val">{value}</div>
      {sub && <div className={`stat-sub ${subClass}`}>{sub}</div>}
    </div>
  );
}