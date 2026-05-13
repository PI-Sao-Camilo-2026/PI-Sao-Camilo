// src/views/medico/RelatoriosProf.jsx
import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { usuariosApi, sessoesApi, relatoriosApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function RelatoriosProf() {
    const [atletas, setAtletas] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [statsGlobal, setStatsGlobal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSessoes, setLoadingSessoes] = useState(false);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        async function init() {
            try {
                setLoading(true);
                const [atletasRes, statsRes] = await Promise.all([
                    usuariosApi.listarAtletas(),
                    relatoriosApi.dashboardStats(),
                ]);
                setAtletas(atletasRes);
                setStatsGlobal(statsRes);
            } catch (e) {
                console.error("Erro RelatoriosProf:", e);
                setErro("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    async function selecionarAtleta(atleta) {
        setSelecionado(atleta);
        setSessoes([]);
        try {
            setLoadingSessoes(true);
            const res = await sessoesApi.sessoesAtleta(atleta.id);
            setSessoes(res);
        } catch (e) {
            console.error("Erro sessões atleta:", e);
        } finally {
            setLoadingSessoes(false);
        }
    }

    const fmt = (v, unit = "") =>
        v != null ? `${Number(v).toFixed(2)}${unit}` : "—";

    const nivelDesidratacao = (pct) => {
        if (pct == null) return { label: "—", cls: "" };
        if (pct < 1) return { label: "Ótimo", cls: "chip-green" };
        if (pct < 2) return { label: "Atenção", cls: "chip-yellow" };
        return { label: "Crítico", cls: "chip-red" };
    };

    const mediaSessoes = (campo) => {
        const vals = sessoes.map((s) => s[campo]).filter((v) => v != null);
        if (!vals.length) return null;
        return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    if (loading) {
        return (
            <div className="prof-layout">
                <Sidebar active="relatorios" />
                <main className="prof-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "var(--text-3)" }}>Carregando relatórios...</p>
                </main>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="prof-layout">
                <Sidebar active="relatorios" />
                <main className="prof-main" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <p style={{ color: "var(--red)" }}>{erro}</p>
                    <button className="btn-red" onClick={() => window.location.reload()}>Tentar novamente</button>
                </main>
            </div>
        );
    }

    return (
        <div className="prof-layout">
            <Sidebar active="relatorios" />
            <main className="prof-main">

                {/* Header */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Relatórios</h1>
                        <p>Análise detalhada por atleta</p>
                    </div>
                </div>

                {/* Stats globais */}
                {statsGlobal && (
                    <div className="stats-row" style={{ marginBottom: 24 }}>
                        <div className="stat-card">
                            <div className="stat-card-icon">👥</div>
                            <label>Atletas</label>
                            <div className="stat-val">{statsGlobal.total_atletas ?? atletas.length}</div>
                            <div className="stat-sub">vinculados</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon">📅</div>
                            <label>Sessões totais</label>
                            <div className="stat-val">{statsGlobal.total_sessoes ?? "—"}</div>
                            <div className="stat-sub">registradas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon">💧</div>
                            <label>Taxa média</label>
                            <div className="stat-val">
                                {statsGlobal.taxa_media_l_h ? fmt(statsGlobal.taxa_media_l_h, " L/h") : "—"}
                            </div>
                            <div className="stat-sub">de sudorese</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-icon">⚖️</div>
                            <label>Maior perda</label>
                            <div className="stat-val" style={{ color: statsGlobal.perda_media_pct > 2 ? "var(--red)" : "inherit" }}>
                                {statsGlobal.perda_media_pct ? fmt(statsGlobal.perda_media_pct, "%") : "—"}
                            </div>
                            <div className="stat-sub">de massa</div>
                        </div>
                    </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>

                    {/* Lista de atletas */}
                    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                            Atletas
                        </div>
                        {atletas.length === 0 ? (
                            <p style={{ padding: 20, color: "var(--text-3)", fontSize: 13 }}>Nenhum atleta vinculado.</p>
                        ) : (
                            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                                {atletas.map((a) => (
                                    <li
                                        key={a.id}
                                        onClick={() => selecionarAtleta(a)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 12,
                                            padding: "14px 20px", cursor: "pointer",
                                            borderBottom: "1px solid var(--border)",
                                            background: selecionado?.id === a.id ? "var(--red-faint, #fdeaed)" : "#fff",
                                            borderLeft: selecionado?.id === a.id ? "3px solid var(--red)" : "3px solid transparent",
                                            transition: "background 0.15s",
                                        }}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: "50%",
                                            background: selecionado?.id === a.id ? "var(--red)" : "#f0f0f0",
                                            color: selecionado?.id === a.id ? "#fff" : "var(--text-2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontWeight: 800, fontSize: 15, flexShrink: 0,
                                        }}>
                                            {(a.nome?.[0] ?? "?").toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.nome}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-3)" }}>{a.modalidade || "Modalidade não informada"}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Detalhe do atleta */}
                    <div>
                        {!selecionado ? (
                            <div style={{
                                background: "#fff", border: "1px solid var(--border)",
                                borderRadius: "var(--radius)", padding: "60px 40px",
                                textAlign: "center", color: "var(--text-3)",
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>👈</div>
                                <p>Selecione um atleta para ver o relatório detalhado.</p>
                            </div>
                        ) : (
                            <>
                                {/* Cabeçalho do atleta */}
                                <div style={{
                                    background: "linear-gradient(135deg, var(--sidebar-bg, #1E2A4A), var(--red, #9B1C2E))",
                                    borderRadius: "var(--radius)", padding: "20px 24px",
                                    display: "flex", alignItems: "center", gap: 16,
                                    color: "#fff", marginBottom: 16,
                                }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: "50%",
                                        background: "rgba(255,255,255,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontWeight: 800, fontSize: 22,
                                    }}>
                                        {(selecionado.nome?.[0] ?? "?").toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{selecionado.nome}</h2>
                                        <p style={{ fontSize: 12, opacity: 0.75 }}>{selecionado.email}</p>
                                        <p style={{ fontSize: 12, opacity: 0.75 }}>{selecionado.modalidade || "Modalidade não informada"}</p>
                                    </div>
                                    <a
                                        href={relatoriosApi.pdfUrl(selecionado.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                                            color: "#fff", padding: "8px 16px", borderRadius: 8,
                                            fontSize: 12, fontWeight: 600, textDecoration: "none",
                                        }}
                                    >
                                        📄 Exportar PDF
                                    </a>
                                </div>

                                {loadingSessoes ? (
                                    <p style={{ color: "var(--text-3)", padding: 20 }}>Carregando sessões...</p>
                                ) : sessoes.length === 0 ? (
                                    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 40, textAlign: "center", color: "var(--text-3)" }}>
                                        Nenhuma sessão encontrada para este atleta.
                                    </div>
                                ) : (
                                    <>
                                        {/* Médias rápidas */}
                                        <div className="stats-row" style={{ marginBottom: 16 }}>
                                            <div className="stat-card">
                                                <div className="stat-card-icon">📅</div>
                                                <label>Sessões</label>
                                                <div className="stat-val">{sessoes.length}</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card-icon">💧</div>
                                                <label>Taxa média</label>
                                                <div className="stat-val">{fmt(mediaSessoes("taxa_sudorese"), " L/h")}</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card-icon">🥤</div>
                                                <label>Ingestão média</label>
                                                <div className="stat-val">{fmt(mediaSessoes("ingestao_ml"), " ml")}</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card-icon">⚖️</div>
                                                <label>Perda média</label>
                                                <div className="stat-val" style={{ color: mediaSessoes("variacao_peso_pct") > 2 ? "var(--red)" : "inherit" }}>
                                                    {fmt(mediaSessoes("variacao_peso_pct"), "%")}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tabela */}
                                        <div className="atletas-table-wrap">
                                            <div className="table-toolbar">
                                                <span style={{ fontWeight: 700 }}>Histórico de sessões</span>
                                            </div>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Data</th>
                                                        <th>Ingestão</th>
                                                        <th>Taxa sudorese</th>
                                                        <th>Variação peso</th>
                                                        <th>Hidratação</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sessoes.map((s) => {
                                                        const nivel = nivelDesidratacao(s.variacao_peso_pct);
                                                        return (
                                                            <tr key={s.id}>
                                                                <td>{s.criado_em ? new Date(s.criado_em).toLocaleDateString("pt-BR") : "—"}</td>
                                                                <td>{s.ingestao_ml != null ? `${s.ingestao_ml} ml` : "—"}</td>
                                                                <td><strong style={{ color: "var(--red)" }}>{s.taxa_sudorese ? `${Number(s.taxa_sudorese).toFixed(2)} L/h` : "—"}</strong></td>
                                                                <td>{s.variacao_peso_pct ? `${Number(s.variacao_peso_pct).toFixed(2)}%` : "—"}</td>
                                                                <td><span className={`chip ${nivel.cls}`}>{nivel.label}</span></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <div className="table-footer">
                                                <span>{sessoes.length} sessão(ões)</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}