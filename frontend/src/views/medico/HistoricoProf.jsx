// src/views/medico/HistoricoProf.jsx
import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { usuariosApi, sessoesApi, exportacaoApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function HistoricoProf() {
    const [atletas, setAtletas] = useState([]);
    const [atletaSelecionado, setAtletaSelecionado] = useState("");
    const [sessoes, setSessoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAtletas, setLoadingAtletas] = useState(true);
    const [exportando, setExportando] = useState(false);
    const [erroExport, setErroExport] = useState("");

    useEffect(() => {
        usuariosApi.listarAtletas()
            .then(setAtletas)
            .catch(console.error)
            .finally(() => setLoadingAtletas(false));
    }, []);

    useEffect(() => {
        if (!atletaSelecionado) { setSessoes([]); return; }
        setLoading(true);
        sessoesApi.sessoesAtleta(atletaSelecionado)
            .then(setSessoes)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [atletaSelecionado]);

    const atleta = atletas.find(a => String(a.id) === String(atletaSelecionado));
    const taxas = sessoes.map(s => s.taxa_sudorese).filter(Boolean);
    const perdas = sessoes.map(s => s.variacao_peso_pct).filter(Boolean);
    const taxaMedia = taxas.length ? (taxas.reduce((a, b) => a + b, 0) / taxas.length).toFixed(2) : null;
    const maiorPerda = perdas.length ? Math.max(...perdas).toFixed(1) : null;

    // Exportação Individual
    const exportarIndividual = async () => {
        if (!atletaSelecionado) return;
        setExportando(true);
        setErroExport("");
        try {
            const blob = await exportacaoApi.exportarHistorico({
                tipo: "atleta",
                id: atletaSelecionado,
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `historico_${atleta?.nome || "atleta"}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setErroExport("Falha ao gerar PDF individual.");
        } finally {
            setExportando(false);
        }
    };

    // Exportação por Equipe (todos os atletas do profissional)
    const exportarEquipe = async () => {
        setExportando(true);
        setErroExport("");
        try {
            const blob = await exportacaoApi.exportarHistorico({
                tipo: "equipe",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `historico_equipe_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setErroExport("Falha ao gerar PDF da equipe.");
        } finally {
            setExportando(false);
        }
    };

    return (
        <div className="prof-layout">
            <Sidebar active="historico" />
            <main className="prof-main">
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Histórico Avançado</h1>
                        <p>Análise detalhada das sessões por atleta</p>
                    </div>
                    {/* Botões de exportação responsivos */}
                    {atletaSelecionado && (
                        <div className="page-header-actions" style={{ gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button
                                className="btn-ghost"
                                onClick={exportarIndividual}
                                disabled={exportando}
                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                                PDF Individual
                            </button>
                            <button
                                className="btn-red"
                                onClick={exportarEquipe}
                                disabled={exportando}
                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                                PDF da Equipe
                            </button>
                        </div>
                    )}
                </div>

                {erroExport && (
                    <div className="prof-erro" style={{ marginBottom: 16 }}>{erroExport}</div>
                )}

                {/* Seletor de atleta */}
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
                        Selecionar Atleta
                    </label>
                    <select
                        className="form-input"
                        value={atletaSelecionado}
                        onChange={e => setAtletaSelecionado(e.target.value)}
                        style={{ maxWidth: "100%", width: "100%", maxWidth: 360 }}
                    >
                        <option value="">-- Escolha um atleta --</option>
                        {atletas.map(a => (
                            <option key={a.id} value={a.id}>{a.nome} {a.modalidade ? `(${a.modalidade})` : ""}</option>
                        ))}
                    </select>
                </div>

                {/* Restante do conteúdo igual ao original... */}
                {atletaSelecionado && (
                    <>
                        <div className="stats-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
                            <div className="stat-card">
                                <div className="stat-card-icon">📅</div>
                                <label>Sessões</label>
                                <div className="stat-val">{loading ? "..." : sessoes.length}</div>
                                <div className="stat-sub">Total registradas</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon">💧</div>
                                <label>Taxa Média</label>
                                <div className="stat-val">{loading ? "..." : taxaMedia ? `${taxaMedia} L/h` : "—"}</div>
                                <div className="stat-sub">de sudorese</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon">⚖️</div>
                                <label>Maior Perda</label>
                                <div className={`stat-val`} style={{ color: maiorPerda > 2 ? "var(--red)" : "inherit" }}>
                                    {loading ? "..." : maiorPerda ? `${maiorPerda}%` : "—"}
                                </div>
                                <div className={`stat-sub ${maiorPerda > 2 ? "danger" : ""}`}>
                                    {maiorPerda > 2 ? "Atenção" : "de massa corporal"}
                                </div>
                            </div>
                        </div>

                        <div className="atletas-table-wrap">
                            <div className="table-toolbar">
                                <span style={{ fontWeight: 700, color: "var(--text)" }}>
                                    Sessões de {atleta?.nome || "atleta"}
                                </span>
                            </div>
                            <table className="responsive-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Modalidade</th>
                                        <th>Duração</th>
                                        <th>Peso Pré</th>
                                        <th>Peso Pós</th>
                                        <th>Ingestão</th>
                                        <th>Taxa Sudorese</th>
                                        <th>Variação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>Carregando sessões...</td></tr>
                                    ) : sessoes.length === 0 ? (
                                        <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px" }}>Nenhuma sessão encontrada</td></tr>
                                    ) : (
                                        sessoes.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.criado_em ? new Date(s.criado_em).toLocaleDateString("pt-BR") : "—"}</td>
                                                <td>{s.modalidade || "—"}</td>
                                                <td>{s.duracao_minutos ? `${s.duracao_minutos.toFixed(0)} min` : "—"}</td>
                                                <td>{s.peso_pre ? `${s.peso_pre} kg` : "—"}</td>
                                                <td>{s.peso_pos ? `${s.peso_pos} kg` : "—"}</td>
                                                <td>{s.ingestao_ml ? `${s.ingestao_ml.toFixed(0)} mL` : "—"}</td>
                                                <td><strong style={{ color: "var(--red)" }}>{s.taxa_sudorese ? `${s.taxa_sudorese} L/h` : "—"}</strong></td>
                                                <td>
                                                    <span className={`chip ${s.variacao_peso_pct > 2 ? "chip-red" : "chip-green"}`}>
                                                        {s.variacao_peso_pct ? `${s.variacao_peso_pct.toFixed(1)}%` : "—"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="table-footer">
                                <span>{sessoes.length} sessão(ões) encontrada(s)</span>
                            </div>
                        </div>
                    </>
                )}

                {!atletaSelecionado && !loadingAtletas && atletas.length === 0 && (
                    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "40px", textAlign: "center", color: "var(--text-3)" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                        <p>Nenhum atleta vinculado ainda. Vá para Atletas e adicione o primeiro.</p>
                    </div>
                )}
            </main>
        </div>
    );
}