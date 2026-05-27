// src/views/atleta/Historico.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessoesApi } from "../../services/api";
import BottomNav from "../../components/BottomNav";

// Ícone de modalidade
function iconeModalidade(m) {
  if (!m) return "🏃";
  const k = m.toLowerCase();
  if (k.includes("futebol")) return "⚽";
  if (k.includes("corrida") || k.includes("atletismo")) return "🏃";
  if (k.includes("natação") || k.includes("natacao")) return "🏊";
  if (k.includes("ciclismo") || k.includes("bicicleta")) return "🚴";
  if (k.includes("musculação") || k.includes("musculacao") || k.includes("academia")) return "🏋️";
  if (k.includes("basquete") || k.includes("basket")) return "🏀";
  if (k.includes("vôlei") || k.includes("volei")) return "🏐";
  return "🏃";
}

function formatarData(iso) {
  if (!iso) return { mes: "—", dia: "—", hora: "" };
  const d = new Date(iso);
  const mes = d.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
  const dia = d.getDate();
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return { mes, dia, hora };
}

export default function Historico() {
  const navigate = useNavigate();
  const [sessoes, setSessoes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [hist, st] = await Promise.all([
          sessoesApi.historico(20, 0),
          sessoesApi.stats(),
        ]);
        setSessoes(hist);
        setStats(st);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  // Gráfico simplificado de barras (últimas 6 sessões)
  const sessoesGrafico = [...sessoes]
    .filter(s => s.taxa_sudorese)
    .slice(0, 6)
    .reverse();

  const maxTaxa = sessoesGrafico.length
    ? Math.max(...sessoesGrafico.map(s => s.taxa_sudorese))
    : 1;

  return (
    <div className="atleta-page">
      <div className="atleta-screen">

        {/* Hero */}
        <div className="atleta-hero">
          <h1>Meu Histórico</h1>
          <p>Resumo da sua hidratação</p>
        </div>

        <div className="atleta-body">

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ fontSize: 13 }}>Carregando histórico...</p>
            </div>
          ) : sessoes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>
                Nenhuma sessão concluída
              </h3>
              <p style={{ fontSize: 13, color: "#999", marginBottom: 24 }}>
                Conclua sua primeira sessão de treino para ver seu histórico aqui.
              </p>
              <button className="btn-primary" onClick={() => navigate("/presessao")}>
                Iniciar primeira sessão
              </button>
            </div>
          ) : (
            <>
              {/* Stats cards */}
              {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <StatCard
                    label="Média Mensal"
                    value={stats.taxa_media ? `${stats.taxa_media}` : "—"}
                    unit="L/h"
                    icon="💧"
                    destaque
                  />
                  <StatCard
                    label="Maior Perda"
                    value={stats.maior_perda_pct ? `-${stats.maior_perda_pct}%` : "—"}
                    unit="de massa"
                    icon="⚖️"
                    alerta={stats.maior_perda_pct > 2}
                  />
                </div>
              )}

              {/* Gráfico de barras simples */}
              {sessoesGrafico.length > 1 && (
                <div className="a-card" style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                    Taxa de Sudorese Mensal
                  </div>
                  <div style={{ fontSize: 10, color: "#bbb", marginBottom: 16 }}>L/h</div>

                  {/* Barras */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, marginBottom: 8 }}>
                    {sessoesGrafico.map((s, i) => {
                      const pct = (s.taxa_sudorese / maxTaxa) * 100;
                      const { dia, mes } = formatarData(s.criado_em);
                      return (
                        <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{
                            width: "100%", height: `${pct}%`,
                            minHeight: 4,
                            background: i === sessoesGrafico.length - 1
                              ? "#9B1C2E"
                              : "rgba(155,28,46,0.25)",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.6s ease",
                          }} />
                          <span style={{ fontSize: 9, color: "#bbb" }}>{dia}/{mes}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lista de sessões */}
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 12,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Últimas Sessões
                  </span>
                  <span style={{ fontSize: 12, color: "#9B1C2E", fontWeight: 600 }}>
                    {stats?.total_sessoes || sessoes.length} total
                  </span>
                </div>

                {sessoes.map(s => {
                  const { mes, dia, hora } = formatarData(s.criado_em);
                  return (
                    <div key={s.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "#fff", border: "1px solid #ebebeb",
                      borderRadius: 12, padding: "14px 14px",
                      marginBottom: 10,
                    }}>
                      {/* Data */}
                      <div style={{
                        textAlign: "center", minWidth: 36, flexShrink: 0,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9B1C2E", letterSpacing: 0.5 }}>{mes}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>{dia}</div>
                      </div>

                      {/* Ícone */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "#fdeaed",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, flexShrink: 0,
                      }}>
                        {iconeModalidade(s.modalidade)}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                          {s.modalidade || "Treino"}
                        </div>
                        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                          {hora && `${hora} · `}
                          {s.duracao_minutos ? `${s.duracao_minutos.toFixed(0)} min` : ""}
                          {s.intensidade ? ` · Intensidade ${s.intensidade}` : ""}
                        </div>
                      </div>

                      {/* Taxa */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#9B1C2E" }}>
                          {s.taxa_sudorese ? s.taxa_sudorese.toFixed(1) : "—"}
                        </div>
                        <div style={{ fontSize: 10, color: "#bbb", fontWeight: 600 }}>L/h</div>
                        <div style={{
                          fontSize: 10, fontWeight: 700, marginTop: 4,
                          color: "#0A7C59", background: "#e6f5f1",
                          padding: "2px 6px", borderRadius: 4,
                          display: "inline-block",
                        }}>
                          CONCLUÍDA
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {stats?.sessoes_por_mes?.length > 0 && (
                <button className="btn-outline" style={{ marginTop: 4 }}>
                  Ver todas as sessões ›
                </button>
              )}
            </>
          )}
        </div>

        <BottomNav active="historico" />
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon, destaque, alerta }) {
  return (
    <div style={{
      background: destaque ? "#9B1C2E" : "#fff",
      border: `1px solid ${destaque ? "#9B1C2E" : "#ebebeb"}`,
      borderRadius: 14, padding: "16px 14px",
    }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: destaque ? "rgba(255,255,255,0.7)" : "#999", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: destaque ? "#fff" : alerta ? "#9B1C2E" : "#1a1a1a", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: destaque ? "rgba(255,255,255,0.6)" : "#bbb", marginTop: 3 }}>
        {unit}
      </div>
    </div>
  );
}