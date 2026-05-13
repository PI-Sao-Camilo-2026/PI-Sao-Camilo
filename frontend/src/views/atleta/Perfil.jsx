// src/views/atleta/Perfil.jsx
import "../../css/PerfilAtleta.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usuariosApi } from "../../services/api";
import BottomNav from "../../components/BottomNav";

export default function Perfil() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({ nome: "", modalidade: "", sexo: "" });
    const [loading, setLoading] = useState(false);
    const [salvo, setSalvo] = useState(false);
    const [erro, setErro] = useState("");
    const [notif, setNotif] = useState(true);

    useEffect(() => {
        usuariosApi.me()
            .then(data => {
                setPerfil(data);
                setForm({ nome: data.nome || "", modalidade: data.modalidade || "", sexo: data.sexo || "" });
            })
            .catch(console.error);
    }, []);

    async function salvarPerfil() {
        if (!form.nome.trim()) { setErro("Nome obrigatório"); return; }
        setErro("");
        try {
            setLoading(true);
            const atualizado = await usuariosApi.atualizarPerfil({
                nome: form.nome.trim(),
                modalidade: form.modalidade.trim() || null,
                sexo: form.sexo || null,
            });
            setPerfil(atualizado);
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
        <div className="atleta-page">
            <div className="atleta-screen">

                {/* Hero */}
                <div className="atleta-hero">
                    <h1>Meu Perfil</h1>
                    <p>Gerencie sua conta</p>
                </div>

                <div className="atleta-body">

                    {/* Card do usuário */}
                    <div style={{
                        background: "linear-gradient(135deg, #7a1020 0%, #9B1C2E 100%)",
                        borderRadius: 16, padding: "20px 18px",
                        display: "flex", alignItems: "center", gap: 16,
                        marginBottom: 16,
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0,
                        }}>
                            {perfil?.nome?.charAt(0)?.toUpperCase() || "?"}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
                                {perfil?.nome || usuario?.nome || "..."}
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                                {perfil?.modalidade ? `Atleta de ${perfil.modalidade}` : "Atleta"}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    background: "rgba(255,255,255,0.2)",
                                    color: "#fff", padding: "3px 10px",
                                    borderRadius: 20, letterSpacing: 0.5,
                                }}>
                                    ✓ CONTA VERIFICADA
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setEditando(true)}
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                color: "#fff", width: 34, height: 34,
                                borderRadius: "50%", cursor: "pointer",
                                fontSize: 15, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            ✏️
                        </button>
                    </div>

                    {/* Sucesso */}
                    {salvo && (
                        <div style={{
                            background: "#e6f5f1", border: "1px solid #a7d7c5",
                            borderRadius: 8, padding: "10px 14px",
                            fontSize: 13, color: "#0A7C59", fontWeight: 600,
                            marginBottom: 14,
                        }}>
                            ✓ Perfil atualizado com sucesso!
                        </div>
                    )}

                    {/* Formulário de edição */}
                    {editando ? (
                        <div className="a-card" style={{ marginBottom: 14 }}>
                            <div className="a-card-title">
                                <div className="a-card-icon">✏️</div>
                                <h3>Editar Dados</h3>
                            </div>

                            <div className="a-label">Nome</div>
                            <input
                                className="a-input"
                                style={{ fontSize: 15, marginBottom: 12 }}
                                value={form.nome}
                                onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                                placeholder="Seu nome"
                            />

                            <div className="a-input-row">
                                <div className="a-input-half">
                                    <div className="a-label">Sexo</div>
                                    <select
                                        className="a-input-sm"
                                        value={form.sexo}
                                        onChange={e => setForm(p => ({ ...p, sexo: e.target.value }))}
                                    >
                                        <option value="">Selecione</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <div className="a-input-half">
                                    <div className="a-label">Modalidade</div>
                                    <input
                                        className="a-input-sm"
                                        value={form.modalidade}
                                        onChange={e => setForm(p => ({ ...p, modalidade: e.target.value }))}
                                        placeholder="Ex: Corrida"
                                    />
                                </div>
                            </div>

                            {erro && <div className="a-erro">{erro}</div>}

                            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                <button
                                    className="btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => { setEditando(false); setErro(""); }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, boxShadow: "none" }}
                                    onClick={salvarPerfil}
                                    disabled={loading}
                                >
                                    {loading ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Dados pessoais */
                        <div className="a-card" style={{ marginBottom: 14 }}>
                            <div className="a-card-title">
                                <div className="a-card-icon">👤</div>
                                <h3>Dados Pessoais</h3>
                            </div>
                            <InfoRow label="Nome" value={perfil?.nome || "—"} />
                            <InfoRow label="E-mail" value={perfil?.email || "—"} />
                            <InfoRow label="Sexo" value={perfil?.sexo || "Não informado"} />
                            <InfoRow label="Modalidade" value={perfil?.modalidade || "Não informada"} />
                            <InfoRow label="Código" value={perfil?.codigo_anonimizado || "—"} mono />
                        </div>
                    )}

                    {/* Configurações */}
                    <div className="a-card" style={{ marginBottom: 14 }}>
                        <div className="a-card-title">
                            <div className="a-card-icon">⚙️</div>
                            <h3>Preferências</h3>
                        </div>

                        {/* Toggle notificações */}
                        <div
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #f0f0f0", marginBottom: 12, cursor: "pointer" }}
                            onClick={() => setNotif(p => !p)}
                        >
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>🔔 Notificações</div>
                                <div style={{ fontSize: 11, color: "#999" }}>Lembretes de hidratação</div>
                            </div>
                            <div style={{
                                width: 42, height: 24, borderRadius: 12,
                                background: notif ? "#9B1C2E" : "#e0e0e0",
                                position: "relative", transition: "background 0.2s",
                                cursor: "pointer",
                            }}>
                                <div style={{
                                    position: "absolute", top: 3,
                                    left: notif ? 21 : 3,
                                    width: 18, height: 18, borderRadius: "50%",
                                    background: "#fff", transition: "left 0.2s",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                }} />
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>📋 Termos de Uso</div>
                                <div style={{ fontSize: 11, color: "#999" }}>Privacidade e consentimento</div>
                            </div>
                            <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
                        </div>
                    </div>

                    {/* Sair */}
                    <button
                        onClick={() => logout(navigate)}
                        style={{
                            width: "100%", padding: "14px",
                            background: "#fff",
                            border: "1.5px solid #f5c0c0",
                            borderRadius: 14,
                            fontFamily: "'Barlow', sans-serif",
                            fontSize: 14, fontWeight: 700,
                            color: "#9B1C2E", cursor: "pointer",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 8,
                        }}
                    >
                        ↪ Sair da conta
                    </button>
                </div>

                <BottomNav active="perfil" />
            </div>
        </div>
    );
}

function InfoRow({ label, value, mono }) {
    return (
        <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", paddingBottom: 10,
            borderBottom: "1px solid #f5f5f5", marginBottom: 10,
        }}>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>{label}</span>
            <span style={{
                fontSize: 13, fontWeight: 600, color: "#1a1a1a",
                fontFamily: mono ? "monospace" : "inherit",
                background: mono ? "#f5f5f5" : "transparent",
                padding: mono ? "2px 6px" : 0,
                borderRadius: mono ? 4 : 0,
            }}>
                {value}
            </span>
        </div>
    );
}