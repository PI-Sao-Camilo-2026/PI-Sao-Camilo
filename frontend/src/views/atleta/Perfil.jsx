// src/views/atleta/Perfil.jsx
import "../../css/PerfilAtleta.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { usuariosApi } from "../../services/api";
import BottomNav from "../../components/BottomNav";

function ModalTermos({ onClose }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 1000,
                background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: "20px 20px 0 0",
                    width: "100%", maxWidth: 480,
                    maxHeight: "80vh",
                    display: "flex", flexDirection: "column",
                    boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
                }}
            >
                {/* Header */}
                <div style={{
                    padding: "18px 20px 14px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>Termos de Uso</div>
                        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Privacidade e consentimento</div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#f5f5f5", border: "none",
                            borderRadius: "50%", width: 32, height: 32,
                            cursor: "pointer", fontSize: 16, color: "#666",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Conteúdo */}
                <div style={{
                    overflowY: "auto", padding: "18px 20px",
                    flex: 1, fontSize: 13, color: "#444", lineHeight: 1.65,
                }}>
                    <p style={{ fontWeight: 700, color: "#9B1C2E", marginBottom: 8 }}>1. Aceitação dos Termos</p>
                    <p style={{ marginBottom: 14 }}>
                        Ao utilizar este aplicativo, você concorda com os presentes Termos de Uso e com nossa
                        Política de Privacidade. Caso não concorde, não utilize os serviços disponibilizados.
                    </p>

                    <p style={{ fontWeight: 700, color: "#9B1C2E", marginBottom: 8 }}>2. Coleta e Uso de Dados</p>
                    <p style={{ marginBottom: 14 }}>
                        Coletamos dados relacionados à sua hidratação, medidas corporais e informações de perfil
                        (nome, e-mail, sexo e modalidade esportiva) com a finalidade exclusiva de fornecer
                        avaliações e acompanhamento personalizado de saúde e desempenho atlético.
                    </p>

                    <p style={{ fontWeight: 700, color: "#9B1C2E", marginBottom: 8 }}>3. Privacidade e Anonimização</p>
                    <p style={{ marginBottom: 14 }}>
                        Seus dados são tratados com sigilo e podem ser anonimizados para fins de pesquisa
                        científica, não sendo compartilhados de forma identificável com terceiros sem seu
                        consentimento explícito.
                    </p>

                    <p style={{ fontWeight: 700, color: "#9B1C2E", marginBottom: 8 }}>4. Responsabilidade do Usuário</p>
                    <p style={{ marginBottom: 14 }}>
                        Você é responsável pela veracidade das informações fornecidas. O uso das informações
                        geradas pelo aplicativo não substitui a orientação de profissionais de saúde habilitados.
                    </p>

                    <p style={{ fontWeight: 700, color: "#9B1C2E", marginBottom: 8 }}>5. Segurança</p>
                    <p style={{ marginBottom: 14 }}>
                        Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra
                        acesso não autorizado, perda ou divulgação indevida, em conformidade com a LGPD
                        (Lei nº 13.709/2018).
                    </p>

                    <p style={{ fontWeight: 700, color: "#9B1C2E", marginBottom: 8 }}>6. Alterações nos Termos</p>
                    <p style={{ marginBottom: 4 }}>
                        Reservamo-nos o direito de atualizar estes Termos a qualquer momento. Notificaremos
                        os usuários sobre mudanças relevantes por meio do próprio aplicativo.
                    </p>
                </div>

                {/* Botão */}
                <div style={{ padding: "14px 20px 24px", flexShrink: 0, borderTop: "1px solid #f0f0f0" }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: "100%", padding: "14px",
                            background: "linear-gradient(135deg, #7a1020 0%, #9B1C2E 100%)",
                            border: "none", borderRadius: 14,
                            fontFamily: "'Barlow', sans-serif",
                            fontSize: 14, fontWeight: 700,
                            color: "#fff", cursor: "pointer",
                            letterSpacing: 0.3,
                        }}
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
}

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
    const [modalTermos, setModalTermos] = useState(false);

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

    async function handleApagarConta() {
        const confirmar = window.confirm(
            "Tem certeza que deseja apagar sua conta? Essa ação é irreversível e todo o seu histórico de hidratação e treinos será permanentemente removido."
        );
        
        if (confirmar) {
            try {
                setLoading(true);
                // Quando sua API de exclusão estiver pronta, você pode descomentar a linha abaixo:
                // await usuariosApi.deletarConta();
                
                logout(navigate);
            } catch (err) {
                setErro(err.message || "Erro ao apagar conta");
                setLoading(false);
            }
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
                                    CONTA VERIFICADA
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
                            Editar
                        </button>
                    </div>

                    {/* Sucesso */}
                    {salvo && (
                        <div style={{
                            background: "transparent",
                            borderRadius: 8, padding: "10px 14px",
                            fontSize: 13, color: "#0A7C59", fontWeight: 600,
                            marginBottom: 14,
                        }}>
                            ✓ Perfil updated com sucesso!
                        </div>
                    )}

                    {/* Formulário de edição */}
                    {editando ? (
                        <div className="a-card" style={{ marginBottom: 14 }}>
                            <div className="a-card-title">
                                <div className="a-card-icon"></div>
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
                                    {loading ? "Salvando" : "Salvar"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Dados pessoais */
                        <div className="a-card" style={{ marginBottom: 14 }}>
                            <div className="a-card-title">
                                {/* <div className="a-card-icon"></div> */}
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
                            {/* <div className="a-card-icon"></div> */}
                            <h3>Preferências</h3>
                        </div>

                        {/* Toggle notificações */}
                        <div
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #f0f0f0", marginBottom: 12, cursor: "pointer" }}
                            onClick={() => setNotif(p => !p)}
                        >
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Notificações</div>
                                <div style={{ fontSize: 11, color: "#999" }}>Lembretes de hidratação</div>
                            </div>
                            <div style={{
                                width: 42, height: 24, borderRadius: 12,
                                background: "transparent",
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

                        <div
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                            onClick={() => setModalTermos(true)}
                        >
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Termos de Uso</div>
                                <div style={{ fontSize: 11, color: "#999" }}>Privacidade e consentimento</div>
                            </div>
                            <span style={{ color: "#ccc", fontSize: 18 }}>›</span>
                        </div>
                    </div>

                    {/* Zona de Perigo / Excluir Conta */}
                    <div className="a-card" style={{ marginBottom: 14, border: "1px solid #f5c0c0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#9B1C2E" }}>Zona de Perigo</div>
                                <div style={{ fontSize: 11, color: "#999", marginTop: 2, maxWidth: "90%" }}>
                                    Apagar a conta permanentemente e apagar todo o histórico.
                                </div>
                            </div>
                            <button
                                onClick={handleApagarConta}
                                disabled={loading}
                                style={{
                                    padding: "8px 14px",
                                    background: "#9B1C2E",
                                    border: "none",
                                    borderRadius: 10,
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: "pointer",
                                    fontFamily: "'Barlow', sans-serif",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {loading ? "Apagando..." : "Excluir Conta"}
                            </button>
                        </div>
                    </div>

                    {/* Sair */}
                    <button
                        onClick={() => logout(navigate)}
                        style={{
                            width: "100%", padding: "14px",
                            background: "transparent",
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

            {modalTermos && (
                <ModalTermos onClose={() => setModalTermos(false)} />
            )}
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
                background: "transparent",
                padding: mono ? "2px 6px" : 0,
                borderRadius: mono ? 4 : 0,
            }}>
                {value}
            </span>
        </div>
    );
}