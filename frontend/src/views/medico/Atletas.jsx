// src/views/medico/Atletas.jsx
import "../../css/profissional.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usuariosApi, authApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

// ── Modal: Cadastrar/Editar Atleta ────────────────────────────────────────────
function ModalAtleta({ atleta = null, onClose, onSalvo }) {
    const isEdicao = !!atleta;
    const [form, setForm] = useState({
        nome: atleta?.nome || "",
        email: atleta?.email || "",
        senha: "",
        sexo: atleta?.sexo || "",
        modalidade: atleta?.modalidade || "",
    });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    function handle(e) {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    }

    async function salvar() {
        if (!form.nome.trim()) { setErro("Nome obrigatório"); return; }
        if (!isEdicao && !form.email.trim()) { setErro("E-mail obrigatório"); return; }
        if (!isEdicao && form.senha.length < 6) { setErro("Senha mínima de 6 caracteres"); return; }
        setErro("");

        try {
            setLoading(true);
            if (isEdicao) {
                await usuariosApi.atualizarAtleta(atleta.id, {
                    nome: form.nome.trim(),
                    modalidade: form.modalidade.trim() || null,
                    sexo: form.sexo || null,
                });
            } else {
                // Cadastra novo atleta já vinculado ao profissional
                await authApi.registrar({
                    nome: form.nome.trim(),
                    email: form.email.trim().toLowerCase(),
                    senha: form.senha,
                    tipo: "atleta",
                    sexo: form.sexo || null,
                    modalidade: form.modalidade.trim() || null,
                });
            }
            onSalvo();
        } catch (err) {
            setErro(err.message || "Erro ao salvar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>{isEdicao ? "Editar Atleta" : "Novo Atleta"}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="form-field">
                    <label>Nome completo</label>
                    <input className="form-input" name="nome" value={form.nome} onChange={handle} placeholder="Nome do atleta" />
                </div>

                {!isEdicao && (
                    <>
                        <div className="form-field">
                            <label>E-mail</label>
                            <input className="form-input" name="email" type="email" value={form.email} onChange={handle} placeholder="email@exemplo.com" />
                        </div>
                        <div className="form-field">
                            <label>Senha (mín. 6 caracteres)</label>
                            <input className="form-input" name="senha" type="password" value={form.senha} onChange={handle} placeholder="••••••••" />
                        </div>
                    </>
                )}

                <div className="form-row">
                    <div className="form-field">
                        <label>Sexo</label>
                        <select className="form-input" name="sexo" value={form.sexo} onChange={handle}>
                            <option value="">Selecione</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Modalidade</label>
                        <input className="form-input" name="modalidade" value={form.modalidade} onChange={handle} placeholder="Ex: Corrida" />
                    </div>
                </div>

                {erro && <div className="prof-erro">{erro}</div>}

                <div className="modal-actions">
                    <button className="btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="btn-red" onClick={salvar} disabled={loading}>
                        {loading ? "Salvando..." : isEdicao ? "Salvar alterações" : "Cadastrar atleta"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Dropdown ações ────────────────────────────────────────────────────────────
function ActionMenu({ atleta, onEdit, onDesvincular }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function click(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
        document.addEventListener("mousedown", click);
        return () => document.removeEventListener("mousedown", click);
    }, []);

    return (
        <div className="action-menu-wrap" ref={ref}>
            <button className="action-btn" onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}>⋮</button>
            {open && (
                <div className="action-menu">
                    <button onClick={() => { setOpen(false); onEdit(atleta); }}>
                        ✏️ Editar perfil
                    </button>
                    <hr />
                    <button className="danger" onClick={() => { setOpen(false); onDesvincular(atleta); }}>
                        🔗 Desvincular
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Atletas() {
    const navigate = useNavigate();
    const [atletas, setAtletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [modalCadastro, setModalCadastro] = useState(false);
    const [atletaEditando, setAtletaEditando] = useState(null);
    const [atletaDesvinculando, setAtletaDesvinculando] = useState(null);
    const [desvincLoading, setDesvincLoading] = useState(false);

    async function carregar() {
        setLoading(true);
        try {
            const data = await usuariosApi.listarAtletas();
            setAtletas(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { carregar(); }, []);

    async function confirmarDesvincular() {
        if (!atletaDesvinculando) return;
        try {
            setDesvincLoading(true);
            await usuariosApi.desvincularAtleta(atletaDesvinculando.id);
            setAtletaDesvinculando(null);
            carregar();
        } catch (err) {
            alert("Erro ao desvincular: " + err.message);
        } finally {
            setDesvincLoading(false);
        }
    }

    const filtrados = atletas.filter(a =>
        a.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (a.modalidade || "").toLowerCase().includes(busca.toLowerCase())
    );

    // Calcula status baseado em dados reais
    function statusAtleta(a) {
        if (!a.sessoes_count && a.sessoes_count !== 0) return { label: "—", cls: "chip-gray" };
        if (a.sessoes_count === 0) return { label: "Sem sessões", cls: "chip-gray" };
        return { label: "Ativo", cls: "chip-green" };
    }

    return (
        <div className="prof-layout">
            <Sidebar active="atletas" />
            <main className="prof-main">

                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Gestão de Atletas</h1>
                        <p>Controle de registros, perfis e equipes</p>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn-red" onClick={() => setModalCadastro(true)}>
                            + Novo Atleta
                        </button>
                    </div>
                </div>

                <div className="atletas-table-wrap">
                    <div className="table-toolbar">
                        <div className="search-field">
                            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nome, modalidade..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <div className="status-filters">
                            <span className="status-badge badge-green">
                                ✓ Completo ({filtrados.length})
                            </span>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Atleta</th>
                                <th>Modalidade</th>
                                <th>Código</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>
                                        Carregando atletas...
                                    </td>
                                </tr>
                            ) : filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>
                                        {busca ? "Nenhum atleta encontrado." : "Nenhum atleta vinculado ainda. Clique em + Novo Atleta."}
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(atleta => {
                                    const st = statusAtleta(atleta);
                                    return (
                                        <tr
                                            key={atleta.id}
                                            onClick={() => navigate(`/atletas/${atleta.id}`)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>
                                                <div className="atleta-name-cell">
                                                    <div className="atleta-avatar">
                                                        {atleta.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong>{atleta.nome}</strong>
                                                        <span>{atleta.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{atleta.modalidade || "—"}</td>
                                            <td>
                                                <span style={{ fontFamily: "monospace", fontSize: 12, background: "#f5f5f5", padding: "3px 6px", borderRadius: 4 }}>
                                                    {atleta.codigo_anonimizado || "—"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`chip ${st.cls}`}>{st.label}</span>
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <ActionMenu
                                                    atleta={atleta}
                                                    onEdit={setAtletaEditando}
                                                    onDesvincular={setAtletaDesvinculando}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    <div className="table-footer">
                        <span>Mostrando {filtrados.length} atleta{filtrados.length !== 1 ? "s" : ""}</span>
                    </div>
                </div>

                {/* Modal cadastrar */}
                {modalCadastro && (
                    <ModalAtleta
                        onClose={() => setModalCadastro(false)}
                        onSalvo={() => { setModalCadastro(false); carregar(); }}
                    />
                )}

                {/* Modal editar */}
                {atletaEditando && (
                    <ModalAtleta
                        atleta={atletaEditando}
                        onClose={() => setAtletaEditando(null)}
                        onSalvo={() => { setAtletaEditando(null); carregar(); }}
                    />
                )}

                {/* Modal confirmar desvincular */}
                {atletaDesvinculando && (
                    <div className="modal-overlay" onClick={() => setAtletaDesvinculando(null)}>
                        <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Desvincular atleta</h2>
                                <button className="modal-close" onClick={() => setAtletaDesvinculando(null)}>×</button>
                            </div>
                            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
                                Deseja desvincular <strong>{atletaDesvinculando.nome}</strong> da sua lista?
                                O atleta continuará existindo no sistema, mas não aparecerá no seu painel.
                            </p>
                            <div className="modal-actions">
                                <button className="btn-ghost" onClick={() => setAtletaDesvinculando(null)}>Cancelar</button>
                                <button
                                    className="btn-red"
                                    onClick={confirmarDesvincular}
                                    disabled={desvincLoading}
                                >
                                    {desvincLoading ? "Desvinculando..." : "Confirmar"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}