// import { useAuth } from "../../contexts/AuthContext";
// import { usuariosApi } from "../../services/api";
import BottomNav from "../../components/BottomNav";

const SECOES = [
    {
        id: "pesar",
        titulo: "Como se Pesar",
        icon: "⚖️",
        cor: "#9B1C2E",
        itens: [
            {
                num: 1,
                titulo: "Condições Básicas",
                desc: "Pese-se sem roupas pesadas, sem tênis e preferencialmente seco.",
            },
            {
                num: 2,
                titulo: "Mesma Balança",
                desc: "Sempre utilize a mesma balança para o pré e pós-treino para evitar divergências de calibração.",
            },
            {
                num: 3,
                titulo: "Urina Pós-Treino",
                desc: "Se urinar durante ou logo após o treino (antes de se pesar), tente estimar o volume se não puder medir (opcional).",
            },
        ],
    },
    {
        id: "durante",
        titulo: "Durante o Treino",
        icon: "💧",
        cor: "#1E2A4A",
        itens: [
            {
                tipo: "alerta",
                icon: "ℹ️",
                titulo: "Apenas água e isotônicos",
                desc: "Registre todos os líquidos ingeridos. Evite cuspir a água se a tiver registrado, pois isso afetará o cálculo da sudorese.",
            },
            {
                tipo: "aviso",
                icon: "⚠️",
                titulo: "Cuidado com a garrafa",
                desc: "Não jogue água na cabeça ou no corpo usando a mesma garrafa que você usa para beber, pois isso superestimará a ingestão.",
            },
        ],
    },
    {
        id: "porque",
        titulo: "Por que Medir?",
        icon: "✅",
        cor: "#0A7C59",
        destaque: true,
        texto: "A avaliação da taxa de sudorese ajuda a entender quanto líquido seu corpo perde em diferentes condições. Com isso, podemos criar estratégias personalizadas de hidratação, prevenindo a desidratação (que afeta a performance e saúde) e a superingestão de líquidos (hiponatremia).",
    },
];

export default function Guia() {
    return (
        <div className="atleta-page">
            <div className="atleta-screen">

                {/* Hero */}
                <div className="atleta-hero">
                    <h1>Guia de Uso</h1>
                    <p>Aprenda a registrar corretamente</p>
                </div>

                <div className="atleta-body">
                    {SECOES.map((secao) => (
                        <div key={secao.id} className="a-card" style={{ marginBottom: 14 }}>

                            {/* Título da seção */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 10,
                                marginBottom: 16, paddingBottom: 12,
                                borderBottom: "1px solid #f0f0f0",
                            }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 8,
                                    background: `${secao.cor}15`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 16, flexShrink: 0,
                                }}>
                                    {secao.icon}
                                </div>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: secao.cor, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                    {secao.titulo}
                                </h3>
                            </div>

                            {/* Conteúdo com destaque */}
                            {secao.destaque ? (
                                <div style={{
                                    background: secao.cor,
                                    borderRadius: 10, padding: "16px",
                                }}>
                                    <p style={{ fontSize: 13, color: "#fff", lineHeight: 1.65 }}>
                                        {secao.texto}
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {secao.itens.map((item, i) => (
                                        <div key={i} style={{
                                            display: "flex", gap: 12, alignItems: "flex-start",
                                            background: item.tipo === "alerta" ? "#f0f4ff" : item.tipo === "aviso" ? "#fff8e1" : "#fafafa",
                                            borderRadius: 10, padding: "12px 14px",
                                            borderLeft: item.tipo === "alerta" ? "3px solid #1E2A4A" : item.tipo === "aviso" ? "3px solid #F59E0B" : "none",
                                        }}>
                                            {item.num ? (
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: "50%",
                                                    background: secao.cor, color: "#fff",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1,
                                                }}>
                                                    {item.num}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                            )}
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 3 }}>
                                                    {item.titulo}
                                                </div>
                                                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.55 }}>
                                                    {item.desc}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Escala da urina */}
                    <div className="a-card" style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FFF176", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                                🟡
                            </div>
                            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#B45309", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Cor da Urina
                            </h3>
                        </div>

                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                            {["#FFF176", "#FDD835", "#F9C02A", "#F6A820", "#E68A10", "#C86B08", "#A84D04", "#8B3A02"].map((c, i) => (
                                <div key={i} style={{
                                    flex: 1, height: 28, background: c, borderRadius: 5,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 10, fontWeight: 700, color: i >= 5 ? "#fff" : "rgba(0,0,0,0.5)",
                                }}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999", fontWeight: 600 }}>
                            <span>Hidratado</span>
                            <span>Desidratado</span>
                        </div>

                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                            {[
                                { range: "1 – 3", label: "Bem hidratado", cor: "#0A7C59", bg: "#e6f5f1" },
                                { range: "4 – 5", label: "Atenção — beba água", cor: "#B45309", bg: "#fef3c7" },
                                { range: "6 – 8", label: "Desidratado — beba água agora", cor: "#9B1C2E", bg: "#fdeaed" },
                            ].map((item) => (
                                <div key={item.range} style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    background: item.bg, borderRadius: 8, padding: "8px 12px",
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: item.cor, minWidth: 36 }}>{item.range}</span>
                                    <span style={{ fontSize: 12, color: item.cor, fontWeight: 600 }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <BottomNav active="guia" />
            </div>
        </div>
    );
}