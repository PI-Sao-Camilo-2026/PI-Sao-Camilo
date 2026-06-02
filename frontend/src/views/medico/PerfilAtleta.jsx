import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usuariosApi, sessoesApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

const IconArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);
const IconDroplet = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
);
const IconScale = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <path d="M12 3v18M3 9l9-6 9 6M3 15l9 6 9-6" />
    </svg>
);
const IconCalendar = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconActivity = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

function formatarData(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function iconeModalidade(m) {
    if (!m) return "";
    const k = m.toLowerCase();
    if (k.includes("futebol")) return "";
    if (k.includes("corrida") || k.includes("atletismo")) return "";
    if (k.includes("natação") || k.includes("natacao")) return "";
    if (k.includes("ciclismo")) return "";
    if (k.includes("musculação") || k.includes("academia")) return "";
    if (k.includes("basquete")) return "";
    if (k.includes("vôlei") || k.includes("volei")) return "";
    return "";
}

export default function PerfilAtleta() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [atleta, setAtleta] = useState(null);
    const [sessoes, setSessoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabAtiva, setTabAtiva] = useState("resumo");
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDesvincular, setModalDesvincular] = useState(false);
    const [desvincLoading, setDesvincLoading] = useState(false);
    const [desvincErro, setDesvincErro] = useState("");

    useEffect(() => {
        async function carregar() {
            try {
                const [dadosAtleta, dadosSessoes] = await Promise.all([
                    usuariosApi.detalheAtleta(id),
                    sessoesApi.sessoesAtleta(id, 30),
                ]);
                setAtleta(dadosAtleta);
                setSessoes(dadosSessoes);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [id]);

    async function recarregarAtleta() {
        try {
            const dados = await usuariosApi.detalheAtleta(id);
            setAtleta(dados);
        } catch (err) {
            console.error(err);
        }
    }

    async function confirmarDesvincular() {
        try {
            setDesvincLoading(true);
            setDesvincErro("");
            await usuariosApi.desvincularAtleta(id);
            navigate("/atletas");
        } catch (err) {
            setDesvincErro(err.message || "Erro ao desvincular atleta. Tente novamente.");
        } finally {
            setDesvincLoading(false);
        }
    }

    const taxas = sessoes.map(s => s.taxa_sudorese).filter(Boolean);
    const perdas = sessoes.map(s => s.variacao_peso_pct).filter(Boolean);
    const ingestoes = sessoes.map(s => s.ingestao_ml).filter(Boolean);

    const taxaMedia = taxas.length ? (taxas.reduce((a, b) => a + b, 0) / taxas.length).toFixed(2) : null;
    const perdaMedia = perdas.length ? (perdas.reduce((a, b) => a + b, 0) / perdas.length).toFixed(1) : null;
    const ingestaoMedia = ingestoes.length ? Math.round(ingestoes.reduce((a, b) => a + b, 0) / ingestoes.length) : null;
    const ultimaSessao = sessoes[0] || null;

    const TABS = ["resumo", "sessões", "dados"];

    if (loading) {
        return (
            <div className="prof-layout">
                <Sidebar active="atletas" />
                <main className="prof-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", color: "var(--text-3)" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                        <p>Carregando perfil do atleta...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!atleta) {
        return (
            <div className="prof-layout">
                <Sidebar active="atletas" />
                <main className="prof-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", color: "var(--text-3)" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}></div>
                        <p>Atleta não encontrado.</p>
                        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate("/atletas")}>
                            Voltar para Atletas
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="prof-layout">
            <Sidebar active="atletas" />
            <main className="prof-main">

                {/* Header */}
                <div className="page-header">
                    <div className="page-header-left">
                        <button
                            onClick={() => navigate("/atletas")}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--text-3)", fontSize: 13, fontWeight: 600,
                                fontFamily: "var(--font)", marginBottom: 8, padding: 0,
                            }}
                        >
                            <IconArrow /> Voltar para Atletas
                        </button>
                        <h1>{atleta.nome}</h1>
                        <p>
                            {iconeModalidade(atleta.modalidade)} {atleta.modalidade || "Modalidade não informada"}
                            {atleta.sexo ? ` · ${atleta.sexo}` : ""}
                        </p>
                    </div>
                    <div className="page-header-actions">
                        <button
                            className="btn-ghost"
                            onClick={() => setModalDesvincular(true)}
                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                            Desvincular
                        </button>
                        <button
                            className="btn-red"
                            onClick={() => setModalEditar(true)}
                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                            Editar perfil
                        </button>
                    </div>
                </div>

                {/* Card do atleta */}
                <div className="atleta-perfil-hero">
                    <div className="atleta-perfil-avatar">
                        {atleta.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="atleta-perfil-info">
                        <h2>{atleta.nome}</h2>
                        <p>{atleta.email}</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            {atleta.modalidade && (
                                <span className="chip chip-green">{atleta.modalidade}</span>
                            )}
                            {atleta.sexo && (
                                <span className="chip chip-gray">{atleta.sexo}</span>
                            )}
                            <span className="chip chip-gray">
                                Código: {atleta.codigo_anonimizado || "—"}
                            </span>
                        </div>
                    </div>
                    <div className="atleta-perfil-sessoes">
                        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--red)" }}>
                            {sessoes.length}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>
                            Sessões registradas
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="perfil-atleta-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`perfil-atleta-tab ${tabAtiva === tab ? "active" : ""}`}
                            onClick={() => setTabAtiva(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Resumo ── */}
                {tabAtiva === "resumo" && (
                    <>
                        {/* Stat cards */}
                        <div className="stats-row" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
                            <div className="stat-card">
                                <div className="stat-card-icon"><IconDroplet /></div>
                                <label>Taxa Média de Sudorese</label>
                                <div className="stat-val">{taxaMedia ? `${taxaMedia}` : "—"}</div>
                                <div className="stat-sub">{taxaMedia ? "L/h" : "Sem dados"}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon"><IconScale /></div>
                                <label>Perda Média de Massa</label>
                                <div className="stat-val" style={{ color: perdaMedia > 2 ? "var(--red)" : "inherit" }}>
                                    {perdaMedia ? `${perdaMedia}%` : "—"}
                                </div>
                                <div className={`stat-sub ${perdaMedia > 2 ? "danger" : ""}`}>
                                    {perdaMedia > 2 ? "Atenção" : "de massa corporal"}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-icon"><IconActivity /></div>
                                <label>Ingestão Média</label>
                                <div className="stat-val">{ingestaoMedia ? `${ingestaoMedia}` : "—"}</div>
                                <div className="stat-sub">{ingestaoMedia ? "ml por sessão" : "Sem dados"}</div>
                            </div>
                        </div>

                        {/* Última sessão */}
                        {ultimaSessao ? (
                            <div className="atletas-table-wrap" style={{ marginBottom: 20 }}>
                                <div className="table-toolbar">
                                    <span style={{ fontWeight: 700, color: "var(--text)" }}>Última Sessão</span>
                                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                                        {formatarData(ultimaSessao.criado_em)}
                                    </span>
                                </div>
                                <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                                    <UltimaInfo label="Taxa de Sudorese" value={ultimaSessao.taxa_sudorese ? `${ultimaSessao.taxa_sudorese} L/h` : "—"} />
                                    <UltimaInfo label="Variação de Peso" value={ultimaSessao.variacao_peso_pct ? `${ultimaSessao.variacao_peso_pct?.toFixed(1)}%` : "—"} alerta={ultimaSessao.variacao_peso_pct > 2} />
                                    <UltimaInfo label="Ingestão" value={ultimaSessao.ingestao_ml ? `${ultimaSessao.ingestao_ml?.toFixed(0)} mL` : "—"} />
                                    <UltimaInfo label="Duração" value={ultimaSessao.duracao_minutos ? `${ultimaSessao.duracao_minutos?.toFixed(0)} min` : "—"} />
                                    <UltimaInfo label="Modalidade" value={ultimaSessao.modalidade || atleta.modalidade || "—"} />
                                    <UltimaInfo label="Status" value="Concluída" verde />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: "#fff", border: "1px solid var(--border)",
                                borderRadius: "var(--radius)", padding: "32px",
                                textAlign: "center", color: "var(--text-3)",
                            }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                                <p>Nenhuma sessão registrada ainda.</p>
                            </div>
                        )}
                    </>
                )}

                {/* ── Tab: Sessões ── */}
                {tabAtiva === "sessões" && (
                    <div className="atletas-table-wrap">
                        <div className="table-toolbar">
                            <span style={{ fontWeight: 700, color: "var(--text)" }}>
                                Histórico de Sessões
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                                {sessoes.length} sessão(ões)
                            </span>
                        </div>
                        <table>
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
                                {sessoes.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-3)" }}>
                                            Nenhuma sessão encontrada
                                        </td>
                                    </tr>
                                ) : (
                                    sessoes.map(s => (
                                        <tr key={s.id}>
                                            <td>{formatarData(s.criado_em)}</td>
                                            <td>{s.modalidade || atleta.modalidade || "—"}</td>
                                            <td>{s.duracao_minutos ? `${s.duracao_minutos?.toFixed(0)} min` : "—"}</td>
                                            <td>{s.peso_pre ? `${s.peso_pre} kg` : "—"}</td>
                                            <td>{s.peso_pos ? `${s.peso_pos} kg` : "—"}</td>
                                            <td>{s.ingestao_ml ? `${s.ingestao_ml?.toFixed(0)} mL` : "—"}</td>
                                            <td>
                                                <strong style={{ color: "var(--red)" }}>
                                                    {s.taxa_sudorese ? `${s.taxa_sudorese} L/h` : "—"}
                                                </strong>
                                            </td>
                                            <td>
                                                <span className={`chip ${s.variacao_peso_pct > 2 ? "chip-red" : "chip-green"}`}>
                                                    {s.variacao_peso_pct ? `${s.variacao_peso_pct?.toFixed(1)}%` : "—"}
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
                )}

                {/* ── Tab: Dados ── */}
                {tabAtiva === "dados" && (
                    <div className="atletas-table-wrap" style={{ padding: "24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <DadoRow label="Nome completo" value={atleta.nome} />
                            <DadoRow label="E-mail" value={atleta.email} />
                            <DadoRow label="Sexo" value={atleta.sexo || "Não informado"} />
                            <DadoRow label="Modalidade" value={atleta.modalidade || "Não informada"} />
                            <DadoRow label="Código anônimo" value={atleta.codigo_anonimizado || "—"} mono />
                            <DadoRow label="Total de sessões" value={sessoes.length} />
                        </div>
                    </div>
                )}

            </main>

            {/* Modal editar atleta */}
            {modalEditar && (
                <ModalEditarAtleta
                    atleta={atleta}
                    onClose={() => setModalEditar(false)}
                    onSalvo={() => { setModalEditar(false); recarregarAtleta(); }}
                />
            )}

            {/* Modal desvincular */}
            {modalDesvincular && (
                <ModalDesvincular
                    atleta={atleta}
                    onClose={() => { setModalDesvincular(false); setDesvincErro(""); }}
                    onConfirmar={confirmarDesvincular}
                    loading={desvincLoading}
                    erro={desvincErro}
                />
            )}
        </div>
    );
}

function ModalEditarAtleta({ atleta, onClose, onSalvo }) {
    const [form, setForm] = useState({
        nome: atleta?.nome || "",
        genero: atleta?.sexo || "",
        modalidade: atleta?.modalidade || "",
    });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    function handle(e) {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    }

    async function salvar() {
        if (!form.nome.trim()) { setErro("Nome completo é obrigatório"); return; }
        setErro("");
        try {
            setLoading(true);
            await usuariosApi.atualizarAtleta(atleta.id, {
                nome: form.nome.trim(),
                modalidade: form.modalidade.trim() || null,
                sexo: form.genero || null,
            });
            onSalvo();
        } catch (err) {
            setErro(err.message || "Erro ao salvar atleta");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <div>
                        <h2>Editar Atleta</h2>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                            Atualize as informações de {atleta.nome}
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose} disabled={loading}>×</button>
                </div>

                <div className="modal-body">
                    {/* Avatar do atleta */}
                    <div className="desvincular-atleta-info" style={{ marginBottom: 20 }}>
                        <div className="atleta-avatar desvincular-avatar">
                            {atleta.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.6 }}>
                                Editando perfil
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginTop: 2 }}>
                                {atleta.email}
                            </div>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Nome Completo</label>
                        <input
                            className="form-input"
                            name="nome"
                            value={form.nome}
                            onChange={handle}
                            placeholder="Ex: João da Silva"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>Gênero</label>
                            <select className="form-input" name="genero" value={form.genero} onChange={handle}>
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Modalidade Esportiva</label>
                            <select className="form-input" name="modalidade" value={form.modalidade} onChange={handle}>
                                <option value="">Selecione</option>
                                <option value="Futebol">Futebol</option>
                                <option value="Corrida">Corrida</option>
                                <option value="Ciclismo">Ciclismo</option>
                                <option value="Natação">Natação</option>
                                <option value="Basquete">Basquete</option>
                                <option value="Vôlei">Vôlei</option>
                                <option value="Musculação">Musculação</option>
                                <option value="Triathlon">Triathlon</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    {erro && <div className="prof-erro">{erro}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button
                        className="btn-red"
                        onClick={salvar}
                        disabled={loading}
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                        {loading ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalDesvincular({ atleta, onClose, onConfirmar, loading, erro }) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
            <div className="modal-box modal-desvincular" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <div>
                        <h2>Desvincular atleta</h2>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                            Esta ação pode ser desfeita vinculando novamente
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose} disabled={loading}>×</button>
                </div>

                <div className="modal-body">
                    <div className="desvincular-atleta-info">
                        <div className="atleta-avatar desvincular-avatar">
                            {atleta.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                                {atleta.nome}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                                {atleta.email}
                            </div>
                            {atleta.modalidade && (
                                <span className="chip chip-green" style={{ marginTop: 6, display: "inline-block" }}>
                                    {atleta.modalidade}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="desvincular-aviso">
                        <div className="desvincular-aviso-icon">Aviso</div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                                Tem certeza que deseja desvincular?
                            </p>
                            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                                O atleta continuará existindo no sistema e poderá ser vinculado novamente.
                                Apenas o vínculo com o seu perfil será removido.
                            </p>
                        </div>
                    </div>

                    {erro && <div className="prof-erro" style={{ marginTop: 12 }}>{erro}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button
                        className="btn-red"
                        onClick={onConfirmar}
                        disabled={loading}
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                        {loading ? "Desvinculando..." : "Confirmar desvínculo"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UltimaInfo({ label, value, alerta, verde }) {
    return (
        <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>
                {label}
            </div>
            <div style={{
                fontSize: 16, fontWeight: 700,
                color: verde ? "var(--green)" : alerta ? "var(--red)" : "var(--text)",
            }}>
                {value}
            </div>
        </div>
    );
}

function DadoRow({ label, value, mono }) {
    return (
        <div style={{
            background: "#fafafa", borderRadius: 10,
            padding: "14px 16px", border: "1px solid var(--border)",
        }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 }}>
                {label}
            </div>
            <div style={{
                fontSize: 14, fontWeight: 600, color: "var(--text)",
                fontFamily: mono ? "monospace" : "inherit",
            }}>
                {value}
            </div>
        </div>
    );
}