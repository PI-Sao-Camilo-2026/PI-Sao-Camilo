import "../../css/profissional.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { usuariosApi } from "../../services/Api";

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconActivity = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const IconInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

function ModalVincularAtleta({ onClose, onVinculado }) {
    const [busca, setBusca] = useState("");
    const [resultados, setResultados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [vinculando, setVinculando] = useState(null);
    const [erro, setErro] = useState("");
    const timerRef = useRef(null);

    function handleBusca(e) {
        const valor = e.target.value;
        setBusca(valor);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => buscar(valor), 400);
    }

    async function buscar(termo) {
        setCarregando(true);
        setErro("");
        try {
            const data = await usuariosApi.buscarAtletasDisponiveis(termo);
            setResultados(data);
        } catch (err) {
            setErro("Erro ao buscar atletas");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => { buscar(""); }, []);

    async function vincular(atleta) {
        setVinculando(atleta.id);
        setErro("");
        try {
            await usuariosApi.vincularAtleta(atleta.id);
            onVinculado();
        } catch (err) {
            setErro(err.message || "Erro ao vincular atleta");
            setVinculando(null);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <div>
                        <h2>Vincular Atleta Existente</h2>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                            Busque um atleta cadastrado no sistema e vincule ao seu perfil
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Campo de busca */}
                    <div className="form-field">
                        <label>Buscar por nome ou e-mail</label>
                        <div className="search-field" style={{ maxWidth: "100%" }}>
                            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ width: 16, height: 16 }}>
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Digite o nome ou e-mail do atleta..."
                                value={busca}
                                onChange={handleBusca}
                                autoFocus
                            />
                        </div>
                    </div>

                    {erro && <div className="prof-erro">{erro}</div>}

                    {/* Lista de resultados */}
                    <div style={{
                        border: "1px solid var(--border)", borderRadius: 10,
                        overflow: "hidden", maxHeight: 360, overflowY: "auto",
                    }}>
                        {carregando ? (
                            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                                Buscando atletas...
                            </div>
                        ) : resultados.length === 0 ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-3)" }}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                                <p style={{ fontSize: 13 }}>
                                    {busca
                                        ? "Nenhum atleta encontrado para esta busca."
                                        : "Nenhum atleta disponível para vínculo no momento."}
                                </p>
                                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                                    Apenas atletas sem vínculo com outro profissional aparecem aqui.
                                </p>
                            </div>
                        ) : (
                            resultados.map((atleta, i) => (
                                <div
                                    key={atleta.id}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 14,
                                        padding: "14px 16px",
                                        borderBottom: i < resultados.length - 1 ? "1px solid #f5f5f5" : "none",
                                        background: "#fff",
                                        transition: "background 0.15s",
                                    }}
                                >
                                    {/* Avatar */}
                                    <div className="atleta-avatar" style={{ flexShrink: 0 }}>
                                        {atleta.nome.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                                            {atleta.nome}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>
                                            {atleta.email}
                                        </div>
                                        {atleta.modalidade && (
                                            <span className="chip chip-green" style={{ marginTop: 4, display: "inline-block" }}>
                                                {atleta.modalidade}
                                            </span>
                                        )}
                                    </div>

                                    {/* Botão vincular */}
                                    <button
                                        className="btn-red"
                                        onClick={() => vincular(atleta)}
                                        disabled={vinculando === atleta.id}
                                        style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}
                                    >
                                        {vinculando === atleta.id ? "Vinculando..." : "Vincular"}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
}

function ModalCadastrarAtleta({ atleta = null, onClose, onSalvo }) {
    const isEdicao = !!atleta;
    const [form, setForm] = useState({
        nome: atleta?.nome || "",
        email: atleta?.email || "",
        senha: "",
        dataNasc: atleta?.data_nascimento || "",
        genero: atleta?.sexo || "",
        pesoBase: atleta?.peso_base || "",
        altura: atleta?.altura || "",
        modalidade: atleta?.modalidade || "",
        equipe: atleta?.equipe || "",
    });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    function handle(e) {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    }

    async function salvar() {
        if (!form.nome.trim()) { setErro("Nome completo é obrigatório"); return; }
        if (!isEdicao && !form.email.trim()) { setErro("E-mail é obrigatório"); return; }
        if (!isEdicao && form.senha.length < 6) { setErro("Senha mínima de 6 caracteres"); return; }
        setErro("");

        try {
            setLoading(true);
            if (isEdicao) {
                await usuariosApi.atualizarAtleta(atleta.id, {
                    nome: form.nome.trim(),
                    modalidade: form.modalidade.trim() || null,
                    sexo: form.genero || null,
                });
            } else {
                await usuariosApi.cadastrarAtleta({
                    nome: form.nome.trim(),
                    email: form.email.trim().toLowerCase(),
                    senha: form.senha,
                    sexo: form.genero || null,
                    modalidade: form.modalidade.trim() || null,
                    equipe: form.equipe.trim() || null,
                    peso_base: form.pesoBase ? parseFloat(form.pesoBase) : null,
                    altura: form.altura ? parseInt(form.altura) : null,
                    data_nascimento: form.dataNasc || null,
                });
            }
            onSalvo();
        } catch (err) {
            setErro(err.message || "Erro ao salvar atleta");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box modal-grande" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: 20, color: "var(--text-3)", lineHeight: 1,
                            }}
                        >
                            ←
                        </button>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
                                {isEdicao ? "Editar Atleta" : "Cadastrar Atleta"}
                            </h2>
                            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                                Preencha as informações básicas para iniciar o acompanhamento
                            </p>
                        </div>
                    </div>
                </div>

                <div className="modal-body">

                    {/* Seção: Dados Pessoais */}
                    <div className="modal-secao">
                        <div className="modal-secao-titulo">
                            <div className="modal-secao-icon"><IconUser /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Dados Pessoais</div>
                                <div style={{ fontSize: 12, color: "var(--text-3)" }}>Informações de identificação e biometria</div>
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
                            {!isEdicao && (
                                <div className="form-field">
                                    <label>E-mail</label>
                                    <input
                                        className="form-input"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handle}
                                        placeholder="Ex: joao@email.com"
                                    />
                                </div>
                            )}
                            <div className="form-field">
                                <label>Data de Nascimento</label>
                                <input
                                    className="form-input"
                                    name="dataNasc"
                                    type="date"
                                    value={form.dataNasc}
                                    onChange={handle}
                                />
                            </div>
                        </div>

                        {!isEdicao && (
                            <div className="form-field">
                                <label>Senha (mín. 6 caracteres)</label>
                                <input
                                    className="form-input"
                                    name="senha"
                                    type="password"
                                    value={form.senha}
                                    onChange={handle}
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-field" style={{ flex: 2 }}>
                                <label>Gênero</label>
                                <select className="form-input" name="genero" value={form.genero} onChange={handle}>
                                    <option value="">Selecione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Peso Base (kg)</label>
                                <input
                                    className="form-input"
                                    name="pesoBase"
                                    type="number"
                                    step="0.1"
                                    value={form.pesoBase}
                                    onChange={handle}
                                    placeholder="0.0"
                                />
                            </div>
                            <div className="form-field">
                                <label>Altura (cm)</label>
                                <input
                                    className="form-input"
                                    name="altura"
                                    type="number"
                                    value={form.altura}
                                    onChange={handle}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção: Esporte e Equipe */}
                    <div className="modal-secao">
                        <div className="modal-secao-titulo">
                            <div className="modal-secao-icon modal-secao-icon-red"><IconActivity /></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Esporte e Equipe</div>
                                <div style={{ fontSize: 12, color: "var(--text-3)" }}>Detalhes sobre a modalidade praticada</div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Modalidade Esportiva</label>
                                <select className="form-input" name="modalidade" value={form.modalidade} onChange={handle}>
                                    <option value="">Selecione...</option>
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
                            <div className="form-field">
                                <label>Equipe / Categoria</label>
                                <input
                                    className="form-input"
                                    name="equipe"
                                    value={form.equipe}
                                    onChange={handle}
                                    placeholder="Ex: Principal, Sub-20, Elite..."
                                />
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="modal-info-box">
                            <IconInfo />
                            <p>
                                O cálculo de <strong>Taxa de Sudorese</strong> do atleta precisará ser calibrado em sua
                                primeira sessão de treino acompanhada para maior precisão das metas de hidratação.
                            </p>
                        </div>
                    </div>

                    {erro && <div className="prof-erro">{erro}</div>}
                </div>

                {/* Footer com botões */}
                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="btn-red" onClick={salvar} disabled={loading}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px" }}>
                        <IconUser />
                        {loading ? "Cadastrando..." : isEdicao ? "Salvar alterações" : "Cadastrar Atleta"}
                    </button>
                </div>
            </div>
        </div>
    );
}

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
                        Editar perfil
                    </button>
                    <hr />
                    <button className="danger" onClick={() => { setOpen(false); onDesvincular(atleta); }}>
                        Desvincular atleta
                    </button>
                </div>
            )}
        </div>
    );
}

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
            console.error(err);
        } finally {
            setDesvincLoading(false);
        }
    }

    const filtrados = atletas.filter(a =>
        a.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (a.modalidade || "").toLowerCase().includes(busca.toLowerCase()) ||
        (a.email || "").toLowerCase().includes(busca.toLowerCase())
    );

    function statusAtleta(a) {
        if (a.alerta) return { label: "Risco alto", cls: "chip-red" };
        if (!a.sessoes_count) return { label: "Sem sessões", cls: "chip-gray" };
        if (a.pendente_pos) return { label: "Pendente pós", cls: "chip-yellow" };
        return { label: "Completo", cls: "chip-green" };
    }

    const total = filtrados.length;
    const completos = filtrados.filter(a => !a.alerta && a.sessoes_count).length;
    const pendentes = filtrados.filter(a => a.pendente_pos).length;
    const alertas = filtrados.filter(a => a.alerta).length;

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
                        <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            ⚙ Filtros
                        </button>
                        <button
                            className="btn-red"
                            onClick={() => setModalCadastro(true)}
                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                            + Novo Atleta
                        </button>
                    </div>
                </div>

                <div className="atletas-table-wrap">
                    <div className="table-toolbar">
                        <div className="search-field">
                            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por nome, equipe ou esporte..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <div className="status-filters">
                            {completos > 0 && (
                                <span className="status-badge badge-green">✓ Completo ({completos})</span>
                            )}
                            {pendentes > 0 && (
                                <span className="status-badge badge-yellow">⚠ Pendente ({pendentes})</span>
                            )}
                            {alertas > 0 && (
                                <span className="status-badge badge-red">✕ Alerta ({alertas})</span>
                            )}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Atleta</th>
                                <th>Modalidade / Equipe</th>
                                <th>Última Sessão</th>
                                <th>Taxa de Sudorese</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>
                                        Carregando atletas
                                    </td>
                                </tr>
                            ) : filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>
                                        {busca
                                            ? "Nenhum atleta encontrado para esta busca."
                                            : "Nenhum atleta vinculado. Clique em + Novo Atleta para começar."}
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
                                                        <strong style={{ display: "block", fontSize: 14, fontWeight: 700 }}>
                                                            {atleta.nome}
                                                        </strong>
                                                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                                                            {atleta.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 14, fontWeight: 500 }}>{atleta.modalidade || "—"}</div>
                                                {atleta.equipe && (
                                                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>{atleta.equipe}</div>
                                                )}
                                            </td>
                                            <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                                                {atleta.ultima_sessao
                                                    ? new Date(atleta.ultima_sessao).toLocaleDateString("pt-BR")
                                                    : "—"}
                                            </td>
                                            <td>
                                                {atleta.taxa_sudorese_media
                                                    ? <span style={{ fontWeight: 700 }}>{atleta.taxa_sudorese_media} <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 400 }}>L/h</span></span>
                                                    : <span style={{ color: "var(--text-3)" }}>N/D</span>}
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
                        <span>Mostrando {total} atleta{total !== 1 ? "s" : ""}</span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }} disabled>Anterior</button>
                            <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }}>Próxima</button>
                        </div>
                    </div>
                </div>

                {/* Modal cadastrar */}
                {modalCadastro && (
                    <ModalCadastrarAtleta
                        onClose={() => setModalCadastro(false)}
                        onSalvo={() => { setModalCadastro(false); carregar(); }}
                    />
                )}

                {/* Modal editar */}
                {atletaEditando && (
                    <ModalCadastrarAtleta
                        atleta={atletaEditando}
                        onClose={() => setAtletaEditando(null)}
                        onSalvo={() => { setAtletaEditando(null); carregar(); }}
                    />
                )}

                {/* Modal confirmar desvincular */}
                {atletaDesvinculando && (
                    <div className="modal-overlay" onClick={() => setAtletaDesvinculando(null)}>
                        <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Desvincular atleta</h2>
                                <button className="modal-close" onClick={() => setAtletaDesvinculando(null)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                                    Deseja desvincular <strong>{atletaDesvinculando.nome}</strong> da sua lista?
                                </p>
                                <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 8, lineHeight: 1.6 }}>
                                    O atleta continuará existindo no sistema e poderá ser vinculado novamente.
                                    Apenas o vínculo com o seu perfil será removido.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-ghost" onClick={() => setAtletaDesvinculando(null)}>Cancelar</button>
                                <button
                                    className="btn-red"
                                    onClick={confirmarDesvincular}
                                    disabled={desvincLoading}
                                >
                                    {desvincLoading ? "Desvinculando..." : "Confirmar desvínculo"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}