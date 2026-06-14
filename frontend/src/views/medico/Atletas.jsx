import "../../css/profissional.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { usuariosApi } from "../../services/Api";

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconActivity = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const IconInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconLink = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);
const IconEye = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IconEdit = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IconTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
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
            setErro("Erro ao buscar atletas disponíveis no sistema.");
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

        window.dispatchEvent(
            new Event("dashboard-refresh")
        );

        onVinculado();
    } catch (err) {
        setErro(err.message || "Erro ao vincular atleta.");
        setVinculando(null);
    }
}

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Vincular Atleta Existente</h2>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                            Busque um atleta cadastrado no ecossistema e vincule ao seu perfil profissional.
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-field">
                        <label>Buscar por nome ou e-mail</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <div style={{ position: "absolute", left: 14, color: "var(--text-3)", display: "flex" }}><IconSearch /></div>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Digite o nome ou e-mail do atleta..."
                                value={busca}
                                onChange={handleBusca}
                                style={{ paddingLeft: 42 }}
                                autoFocus
                            />
                        </div>
                    </div>

                    {erro && <div className="prof-erro" style={{ marginBottom: 16 }}>{erro}</div>}

                    <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", maxHeight: 300, overflowY: "auto" }}>
                        {carregando ? (
                            <div style={{ padding: 24, textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>Buscando atletas...</div>
                        ) : resultados.length === 0 ? (
                            <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)" }}>
                                <p style={{ fontSize: 14, fontWeight: 600 }}>Nenhum atleta elegível encontrado.</p>
                                <p style={{ fontSize: 12, marginTop: 4 }}>Apenas atletas ativos e sem vínculo ativo com outros profissionais aparecem aqui.</p>
                            </div>
                        ) : (
                            resultados.map((atleta, i) => (
                                <div
                                    key={atleta.id}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                                        borderBottom: i < resultados.length - 1 ? "1px solid var(--border)" : "none",
                                        background: "#fff"
                                    }}
                                >
                                    <div className="atleta-avatar">{atleta.nome.charAt(0).toUpperCase()}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{atleta.nome}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{atleta.email}</div>
                                    </div>
                                    <button
                                        className="btn-red"
                                        onClick={() => vincular(atleta)}
                                        disabled={vinculando === atleta.id}
                                        style={{ padding: "8px 14px", fontSize: 13 }}
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
        if (!form.nome.trim()) { setErro("O nome completo é obrigatório."); return; }
        if (!isEdicao && !form.email.trim()) { setErro("O e-mail é obrigatório."); return; }
        if (!isEdicao && form.senha.length < 6) { setErro("A senha deve ter no mínimo 6 caracteres."); return; }
        setErro("");

        try {
            setLoading(true);
            if (isEdicao) {
                await usuariosApi.atualizarAtleta(atleta.id, {
                    nome: form.nome.trim(),
                    modalidade: form.modalidade.trim() || null,
                    sexo: form.genero || null,
                    equipe: form.equipe.trim() || null,
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
            setErro(err.message || "Erro ao salvar os dados do atleta.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box modal-grande" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800 }}>
                            {isEdicao ? "Editar Informações do Atleta" : "Cadastrar Novo Atleta"}
                        </h2>
                        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
                            Configure a ficha cadastral básica para iniciar ou atualizar o acompanhamento.
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Seção 1: Perfil Cadastral */}
                    <div className="modal-secao">
                        <div className="modal-secao-titulo" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                            <div style={{ color: "var(--red)", display: "flex" }}><IconUser /></div>
                            <strong style={{ fontSize: 14, color: "var(--text)" }}>Dados Pessoais e Biometria</strong>
                        </div>

                        <div className="form-field">
                            <label>Nome Completo</label>
                            <input className="form-input" name="nome" value={form.nome} onChange={handle} placeholder="Ex: João Silva" />
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>E-mail (Login)</label>
                                <input className="form-input" name="email" type="email" value={form.email} onChange={handle} placeholder="joao@exemplo.com" disabled={isEdicao} />
                            </div>
                            <div className="form-field">
                                <label>Data de Nascimento</label>
                                <input className="form-input" name="dataNasc" type="date" value={form.dataNasc} onChange={handle} disabled={isEdicao} />
                            </div>
                        </div>

                        {!isEdicao && (
                            <div className="form-field">
                                <label>Senha de Acesso Temporária</label>
                                <input className="form-input" name="senha" type="password" value={form.senha} onChange={handle} placeholder="Mínimo 6 caracteres" />
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-field">
                                <label>Gênero</label>
                                <select className="form-input" name="genero" value={form.genero} onChange={handle}>
                                    <option value="">Selecione</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="form-field">
                                    <label>Peso (kg)</label>
                                    <input className="form-input" name="pesoBase" type="number" step="0.1" value={form.pesoBase} onChange={handle} placeholder="75.0" disabled={isEdicao} />
                                </div>
                                <div className="form-field">
                                    <label>Altura (cm)</label>
                                    <input className="form-input" name="altura" type="number" value={form.altura} onChange={handle} placeholder="178" disabled={isEdicao} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Classificação de Treino */}
                    <div className="modal-secao" style={{ marginTop: 24 }}>
                        <div className="modal-secao-titulo" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                            <div style={{ color: "var(--red)", display: "flex" }}><IconActivity /></div>
                            <strong style={{ fontSize: 14, color: "var(--text)" }}>Esporte e Grupo de Rendimento</strong>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Modalidade Ativa</label>
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
                            <div className="form-field">
                                <label>Equipe / Categoria / Divisão</label>
                                <input className="form-input" name="equipe" value={form.equipe} onChange={handle} placeholder="Ex: Principal, Sub-20, Amador" />
                            </div>
                        </div>

                        <div className="modal-info-box">
                            <IconInfo />
                            <p>O cálculo automatizado da <strong>Taxa de Sudorese</strong> padrão deste atleta precisará ser calibrado em sua primeira sessão de treino acompanhada para estabelecer metas hidricas personalizadas.</p>
                        </div>
                    </div>

                    {erro && <div className="prof-erro" style={{ marginTop: 16 }}>{erro}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button className="btn-red" onClick={salvar} disabled={loading}>
                        {loading ? "Salvando alterações..." : isEdicao ? "Atualizar Dados" : "Cadastrar Atleta"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalDesvincular({ atleta, onClose, onConfirmar, loading, erro }) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ fontSize: 18, fontWeight: 800 }}>Desvincular Atleta</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
                        Tem certeza de que deseja remover o vínculo com o atleta <strong>{atleta?.nome}</strong>? Ele deixará a sua listagem, mas o histórico de treinos e dados coletados dele permanecerão intactos no sistema.
                    </p>
                    {erro && <div className="prof-erro" style={{ marginTop: 14 }}>{erro}</div>}
                </div>
                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onClose} disabled={loading}>Voltar</button>
                    <button className="btn-red" onClick={onConfirmar} disabled={loading}>
                        {loading ? "Desvinculando..." : "Confirmar Remoção"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Atletas() {
    const navigate = useNavigate();
    const [atletas, setAtletas] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [loading, setLoading] = useState(true);

    // Estados de Controle dos Modais
    const [modalVincular, setModalVincular] = useState(false);
    const [modalCadastro, setModalCadastro] = useState(false);
    const [atletaEditando, setAtletaEditando] = useState(null);
    const [atletaDesvinculando, setAtletaDesvinculando] = useState(null);

    const [desvincLoading, setDesvincLoading] = useState(false);
    const [desvincErro, setDesvincErro] = useState("");

    async function carregarAtletas() {
        try {
            setLoading(true);
            const data = await usuariosApi.listarAtletas();
            setAtletas(data || []);
        } catch (err) {
            console.error("Erro ao puxar lista de atletas vinculados:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarAtletas();
    }, []);

    async function confirmarDesvincular() {
        if (!atletaDesvinculando) return;
        setDesvincLoading(true);
        setDesvincErro("");
        try {
            await usuariosApi.desvincularAtleta(atletaDesvinculando.id);
            setAtletaDesvinculando(null);
            carregarAtletas();
        } catch (err) {
            setDesvincErro(err.message || "Não foi possível remover o vínculo deste atleta.");
        } finally {
            setDesvincLoading(false);
        }
    }

    const atletasFiltrados = atletas.filter(a =>
        a.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        a.email?.toLowerCase().includes(pesquisa.toLowerCase())
    );

    return (
        <div className="prof-layout">
            <Sidebar active="atletas" />

            <main className="prof-main">
                {/* Cabeçalho da Página */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Atletas Acompanhados</h1>
                        <p>Gerencie sua base ativa de atletas vinculados, monitore biometrias e gerencie novos acessos.</p>
                    </div>
                    <div className="btn-actions-row">
                        <button className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={() => setModalVincular(true)}>
                            <IconLink /> Vincular Existente
                        </button>
                        <button className="btn-red" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={() => setModalCadastro(true)}>
                            <IconPlus /> Novo Cadastro
                        </button>
                    </div>
                </div>

                {/* Barra de Ferramentas / Listagem */}
                <div className="atletas-table-wrap">
                    <div className="table-toolbar">
                        <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%", maxWidth: 360 }}>
                            <div style={{ position: "absolute", left: 14, color: "var(--text-3)", display: "flex" }}><IconSearch /></div>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Filtrar atletas por nome ou e-mail"
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                style={{ paddingLeft: 42 }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>Identificação / Atleta</th>
                                    <th>Modalidade</th>
                                    <th>Equipe / Categoria</th>
                                    <th style={{ textAlign: "right" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: 40, color: "var(--text-3)" }}>
                                            Carregando listagem de atletas
                                        </td>
                                    </tr>
                                ) : atletasFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: 48, color: "var(--text-3)" }}>
                                            {pesquisa ? "Nenhum resultado corresponde à sua busca." : "Nenhum atleta vinculado à sua conta profissional atualmente."}
                                        </td>
                                    </tr>
                                ) : (
                                    atletasFiltrados.map((atleta) => (
                                        <tr key={atleta.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div className="atleta-avatar">
                                                        {atleta.nome ? atleta.nome.charAt(0).toUpperCase() : "A"}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: "var(--text)" }}>{atleta.nome}</div>
                                                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{atleta.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="chip chip-green">
                                                    {atleta.modalidade || "Não definida"}
                                                </span>
                                            </td>
                                            <td style={{ color: "var(--text-2)", fontWeight: 500 }}>
                                                {atleta.equipe || "Geral"}
                                            </td>
                                            <td>
                                                <div className="btn-actions-row" style={{ justifyContent: "flex-end" }}>
                                                    <button className="btn-icon-sm" title="Acessar Perfil Fisiológico" onClick={() => navigate(`/atletas/${atleta.id}`)}>
                                                        <IconEye />
                                                    </button>
                                                    <button className="btn-icon-sm" title="Editar Informações" onClick={() => setAtletaEditando(atleta)}>
                                                        <IconEdit />
                                                    </button>
                                                    <button className="btn-icon-sm delete" title="Remover Vínculo" onClick={() => setAtletaDesvinculando(atleta)}>
                                                        <IconTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer">
                        Exibindo {atletasFiltrados.length} de {atletas.length} atletas vinculados.
                    </div>
                </div>

                {/* Renderização Condicional dos Modais */}
                {modalVincular && (
                    <ModalVincularAtleta
                        onClose={() => setModalVincular(false)}
                        onVinculado={() => { setModalVincular(false); carregarAtletas(); }}
                    />
                )}

                {modalCadastro && (
                    <ModalCadastrarAtleta
                        onClose={() => setModalCadastro(false)}
                        onSalvo={() => { setModalCadastro(false); carregarAtletas(); }}
                    />
                )}

                {atletaEditando && (
                    <ModalCadastrarAtleta
                        atleta={atletaEditando}
                        onClose={() => setAtletaEditando(null)}
                        onSalvo={() => { setAtletaEditando(null); carregarAtletas(); }}
                    />
                )}

                {atletaDesvinculando && (
                    <ModalDesvincular
                        atleta={atletaDesvinculando}
                        onClose={() => { setAtletaDesvinculando(null); setDesvincErro(""); }}
                        onConfirmar={confirmarDesvincular}
                        loading={desvincLoading}
                        erro={desvincErro}
                    />
                )}
            </main>
        </div>
    );
}