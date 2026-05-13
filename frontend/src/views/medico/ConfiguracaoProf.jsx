// src/views/medico/ConfiguracaoProf.jsx
import "../../css/profissional.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usuariosApi } from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function ConfiguracaoProf() {
    const { usuario, logout } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({ nome: "", modalidade: "", sexo: "" });
    const [loading, setLoading] = useState(false);
    const [notifHidrat, setNotifHidrat] = useState(true);
    const [notifAlerta, setNotifAlerta] = useState(true);
    const [salvo, setSalvo] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        usuariosApi.me().then(data => {
            setPerfil(data);
            setForm({ nome: data.nome || "", modalidade: data.modalidade || "", sexo: data.sexo || "" });
        }).catch(console.error);
    }, []);

    async function salvarPerfil() {
        setErro("");
        if (!form.nome.trim()) { setErro("Nome obrigatório"); return; }
        try {
            setLoading(true);
            await usuariosApi.atualizarPerfil({ nome: form.nome.trim(), modalidade: form.modalidade, sexo: form.sexo });
            setPerfil(p => ({ ...p, nome: form.nome.trim(), modalidade: form.modalidade, sexo: form.sexo }));
            setEditando(false);
            setSalvo(true);
            setTimeout(() => setSalvo(false), 2500);
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
                        <h1>Meu Perfil</h1>
                        <p>Gerencie sua conta e preferências</p>
                    </div>
                </div>

                {/* Card perfil */}
                <div style={{
                    background: "linear-gradient(135deg, var(--sidebar-bg) 0%, var(--red) 100%)",
                    borderRadius: "var(--radius)", padding: "24px", marginBottom: 24,
                    display: "flex", alignItems: "center", gap: 20, color: "#fff",
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28, fontWeight: 800, flexShrink: 0,
                    }}>
                        {perfil?.nome?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>{perfil?.nome || "..."}</h2>
                        <p style={{ fontSize: 13, opacity: 0.75 }}>
                            {perfil?.tipo === "profissional" ? "Profissional de Nutrição Esportiva" : "Atleta"}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                                ✓ Conta Verificada
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditando(true)}
                        style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600 }}
                    >
                        ✏️ Editar
                    </button>
                </div>

                {salvo && (
                    <div style={{ background: "var(--green-light)", border: "1px solid #a7d7c5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--green)", marginBottom: 16, fontWeight: 600 }}>
                        ✓ Perfil atualizado com sucesso!
                    </div>
                )}

                {/* Seção: Dados pessoais */}
                <div className="config-section">
                    <div className="config-section-title">Configurações Pessoais</div>
                    <div className="config-card">
                        {editando ? (
                            <div style={{ padding: "20px" }}>
                                <div className="form-field">
                                    <label>Nome</label>
                                    <input className="form-input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
                                </div>
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Sexo</label>
                                        <select className="form-input" value={form.sexo} onChange={e => setForm(p => ({ ...p, sexo: e.target.value }))}>
                                            <option value="">Selecione</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                    <div className="form-field">
                                        <label>Especialidade/Modalidade</label>
                                        <input className="form-input" value={form.modalidade} onChange={e => setForm(p => ({ ...p, modalidade: e.target.value }))} placeholder="Ex: Futebol, Corrida" />
                                    </div>
                                </div>
                                {erro && <div className="prof-erro">{erro}</div>}
                                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                                    <button className="btn-ghost" onClick={() => { setEditando(false); setErro(""); }}>Cancelar</button>
                                    <button className="btn-red" onClick={salvarPerfil} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <ConfigRow icon="👤" title="Dados Pessoais" desc={`${perfil?.nome || "—"} · ${perfil?.sexo || "Sexo não informado"}`} onClick={() => setEditando(true)} />
                                <ConfigRow icon="📧" title="E-mail" desc={perfil?.email || "—"} />
                                <ConfigRow icon="🏃" title="Modalidade/Especialidade" desc={perfil?.modalidade || "Não informada"} onClick={() => setEditando(true)} />
                            </>
                        )}
                    </div>
                </div>

                {/* Seção: Privacidade */}
                <div className="config-section">
                    <div className="config-section-title">Privacidade e Suporte</div>
                    <div className="config-card">
                        <div className="config-row" onClick={() => setNotifHidrat(p => !p)}>
                            <div className="config-row-left">
                                <div className="config-row-icon">🔔</div>
                                <div>
                                    <strong>Alertas de hidratação</strong>
                                    <span>Notificações de risco nos atletas</span>
                                </div>
                            </div>
                            <div className={`toggle-switch ${notifHidrat ? "on" : ""}`} />
                        </div>
                        <div className="config-row" onClick={() => setNotifAlerta(p => !p)}>
                            <div className="config-row-left">
                                <div className="config-row-icon">⚠️</div>
                                <div>
                                    <strong>Alertas críticos</strong>
                                    <span>Desidratação grave e anomalias</span>
                                </div>
                            </div>
                            <div className={`toggle-switch ${notifAlerta ? "on" : ""}`} />
                        </div>
                        <div className="config-row">
                            <div className="config-row-left">
                                <div className="config-row-icon">📋</div>
                                <div>
                                    <strong>Termos de Uso</strong>
                                    <span>Privacidade e consentimento LGPD</span>
                                </div>
                            </div>
                            <span style={{ color: "var(--text-3)" }}>›</span>
                        </div>
                    </div>
                </div>

                {/* Sair */}
                <div style={{ background: "#fff", border: "1.5px solid #f5c0c0", borderRadius: "var(--radius)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                    onClick={() => logout()}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--red)" }}>↪ Sair da conta</span>
                </div>
            </main>
        </div>
    );
}

function ConfigRow({ icon, title, desc, onClick }) {
    return (
        <div className="config-row" onClick={onClick}>
            <div className="config-row-left">
                <div className="config-row-icon">{icon}</div>
                <div>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                </div>
            </div>
            {onClick && <span style={{ color: "var(--text-3)" }}>›</span>}
        </div>
    );
}