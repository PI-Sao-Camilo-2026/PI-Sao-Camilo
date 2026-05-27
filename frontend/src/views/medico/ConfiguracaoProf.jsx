// src/views/medico/ConfiguracaoProf.jsx
import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usuariosApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconLock = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const IconStar = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const IconSave = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);

const TABS = [
    { id: "perfil", label: "Meu Perfil", icon: <IconUser /> },
    { id: "notificacoes", label: "Notificações", icon: <IconBell /> },
    { id: "seguranca", label: "Segurança", icon: <IconLock /> },
];

export default function ConfiguracaoProf() {
    const { logout } = useAuth();
    const [tabAtiva, setTabAtiva] = useState("perfil");
    const [perfil, setPerfil] = useState(null);
    const [form, setForm] = useState({
        nome: "",
        email: "",
        telefone: "",
        crn: "",
        bio: "",
        modalidade: "",
        sexo: "",
    });
    const [loading, setLoading] = useState(false);
    const [salvo, setSalvo] = useState(false);
    const [erro, setErro] = useState("");

    // Notificações
    const [notifHidrat, setNotifHidrat] = useState(true);
    const [notifAlerta, setNotifAlerta] = useState(true);
    const [notifRelatorio, setNotifRelatorio] = useState(false);

    useEffect(() => {
        usuariosApi.me().then(data => {
            setPerfil(data);
            setForm({
                nome: data.nome || "",
                email: data.email || "",
                telefone: data.telefone || "",
                crn: data.crn || "",
                bio: data.bio || "",
                modalidade: data.modalidade || "",
                sexo: data.sexo || "",
            });
        }).catch(console.error);
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    }

    async function salvarPerfil() {
        setErro("");
        if (!form.nome.trim()) { setErro("Nome obrigatório"); return; }
        try {
            setLoading(true);
            await usuariosApi.atualizarPerfil({
                nome: form.nome.trim(),
                modalidade: form.modalidade || null,
                sexo: form.sexo || null,
            });
            setSalvo(true);
            setTimeout(() => setSalvo(false), 3000);
        } catch (err) {
            setErro(err.message || "Erro ao salvar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="prof-layout">
            <Sidebar active="config" />
            <main className="prof-main">

                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Configurações</h1>
                        <p>Gerencie seu perfil, preferências e segurança.</p>
                    </div>
                </div>

                <div className="config-layout">
                    {/* Tabs laterais */}
                    <div className="config-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                className={`config-tab-btn ${tabAtiva === tab.id ? "active" : ""}`}
                                onClick={() => setTabAtiva(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Conteúdo da tab */}
                    <div className="config-content">

                        {/* ── Tab: Meu Perfil ── */}
                        {tabAtiva === "perfil" && (
                            <div className="config-panel">
                                <div className="config-panel-header">
                                    <h2>Dados do Profissional</h2>
                                    <p>Essas informações poderão ser vistas pelos seus atletas associados.</p>
                                </div>

                                {/* Foto de perfil */}
                                <div className="perfil-foto-row">
                                    <div className="perfil-foto-circle">
                                        <span>{perfil?.nome?.charAt(0)?.toUpperCase() || "?"}</span>
                                        <div className="perfil-foto-label">MUDAR FOTO</div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Foto de Perfil</div>
                                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                                            Recomendado: 400x400px, formato JPG ou PNG.
                                        </div>
                                    </div>
                                </div>

                                {salvo && (
                                    <div className="config-sucesso">✓ Perfil atualizado com sucesso!</div>
                                )}

                                {/* Campos */}
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Nome Completo</label>
                                        <input
                                            className="form-input"
                                            name="nome"
                                            value={form.nome}
                                            onChange={handleChange}
                                            placeholder="Dr. Carlos Mendes"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>E-mail Profissional</label>
                                        <input
                                            className="form-input"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="carlos.mendes@clinica.com"
                                            disabled
                                            style={{ background: "#fafafa", color: "var(--text-3)" }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Telefone / Celular</label>
                                        <input
                                            className="form-input"
                                            name="telefone"
                                            value={form.telefone}
                                            onChange={handleChange}
                                            placeholder="(11) 98888-7777"
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>CRN / CRM / Registro</label>
                                        <input
                                            className="form-input"
                                            name="crn"
                                            value={form.crn}
                                            onChange={handleChange}
                                            placeholder="CRN 12345/SP"
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Breve Biografia (Exibida para atletas)</label>
                                    <textarea
                                        className="form-input"
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Especialista em nutrição esportiva avançada com 10 anos de experiência..."
                                        style={{ resize: "vertical", lineHeight: 1.6 }}
                                    />
                                </div>

                                {erro && <div className="prof-erro">{erro}</div>}

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                                    <button
                                        className="btn-red"
                                        onClick={salvarPerfil}
                                        disabled={loading}
                                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px" }}
                                    >
                                        <IconSave />
                                        {loading ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Notificações ── */}
                        {tabAtiva === "notificacoes" && (
                            <div className="config-panel">
                                <div className="config-panel-header">
                                    <h2>Preferências de Notificação</h2>
                                    <p>Escolha quais alertas deseja receber.</p>
                                </div>

                                <div className="config-card">
                                    <NotifRow
                                        titulo="Alertas de hidratação"
                                        desc="Notificações quando um atleta está em risco"
                                        ativo={notifHidrat}
                                        onToggle={() => setNotifHidrat(p => !p)}
                                    />
                                    <NotifRow
                                        titulo="Alertas críticos"
                                        desc="Desidratação grave e anomalias detectadas"
                                        ativo={notifAlerta}
                                        onToggle={() => setNotifAlerta(p => !p)}
                                    />
                                    <NotifRow
                                        titulo="Relatórios semanais"
                                        desc="Resumo de performance dos seus atletas"
                                        ativo={notifRelatorio}
                                        onToggle={() => setNotifRelatorio(p => !p)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Segurança ── */}
                        {tabAtiva === "seguranca" && (
                            <div className="config-panel">
                                <div className="config-panel-header">
                                    <h2>Segurança da Conta</h2>
                                    <p>Gerencie senha e acesso à sua conta.</p>
                                </div>

                                <div className="config-card" style={{ padding: "20px" }}>
                                    <div className="form-field">
                                        <label>Senha atual</label>
                                        <input className="form-input" type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-field">
                                            <label>Nova senha</label>
                                            <input className="form-input" type="password" placeholder="••••••••" />
                                        </div>
                                        <div className="form-field">
                                            <label>Confirmar nova senha</label>
                                            <input className="form-input" type="password" placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <button className="btn-red" style={{ padding: "11px 22px" }}>
                                            Atualizar Senha
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <div className="config-section-title">Zona de Perigo</div>
                                    <div className="config-card" style={{ padding: "16px 20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Sair da conta</div>
                                                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Encerrar sessão em todos os dispositivos</div>
                                            </div>
                                            <button
                                                onClick={() => logout()}
                                                style={{
                                                    padding: "9px 18px", background: "transparent",
                                                    border: "1.5px solid #f5c0c0", borderRadius: 8,
                                                    color: "var(--red)", fontWeight: 700, fontSize: 13,
                                                    cursor: "pointer", fontFamily: "var(--font)",
                                                }}
                                            >
                                                ↪ Sair
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

function NotifRow({ titulo, desc, ativo, onToggle }) {
    return (
        <div className="config-row" onClick={onToggle}>
            <div className="config-row-left">
                <div>
                    <strong>{titulo}</strong>
                    <span>{desc}</span>
                </div>
            </div>
            <div className={`toggle-switch ${ativo ? "on" : ""}`} />
        </div>
    );
}