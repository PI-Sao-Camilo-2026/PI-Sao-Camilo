// src/views/medico/Suporte.jsx
import "../../css/profissional.css";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const IconPhone = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.72 6.72l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const IconMail = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const IconFile = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);
const IconSend = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const IconFaq = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const IconChevron = ({ open }) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const FAQS = [
    {
        pergunta: "Como calibro a taxa de sudorese de um atleta?",
        resposta: "A taxa de sudorese pode ser cadastrada no perfil do atleta. Recomendamos realizar um teste prático de pesagem antes e depois de uma sessão de treino de 1 hora, sem hidratação durante o processo, para obter o valor exato em Litros/hora.",
    },
    {
        pergunta: "Posso exportar os relatórios para PDF?",
        resposta: "Sim! Na seção de Relatórios, clique em 'Relatório Individual (PDF)' para gerar e baixar o PDF de qualquer atleta.",
    },
    {
        pergunta: "O que significa o status 'Pendente pós' nos atletas?",
        resposta: "Significa que o atleta iniciou uma sessão de pré-treino mas ainda não registrou os dados pós-treino (peso final, vestimenta etc.).",
    },
    {
        pergunta: "Como alterar minha senha de acesso?",
        resposta: "Acesse Configurações → Segurança → Atualizar Senha para definir uma nova senha.",
    },
];

export default function Suporte() {
    const [assunto, setAssunto] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [enviado, setEnviado] = useState(false);
    const [faqAberto, setFaqAberto] = useState(0);

    function enviarMensagem() {
        if (!assunto || !mensagem.trim()) return;
        setEnviado(true);
        setAssunto("");
        setMensagem("");
        setTimeout(() => setEnviado(false), 4000);
    }

    return (
        <div className="prof-layout">
            <Sidebar active="suporte" />
            <main className="prof-main">

                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Central de Suporte</h1>
                        <p>Tire suas dúvidas ou entre em contato com nossa equipe técnica.</p>
                    </div>
                </div>

                <div className="suporte-grid">

                    {/* Coluna esquerda */}
                    <div className="suporte-col-left">

                        {/* Canais de Atendimento */}
                        <div className="suporte-card">
                            <div className="suporte-card-titulo">
                                <IconPhone />
                                Canais de Atendimento
                            </div>

                            {/* WhatsApp integrado com wa.me */}
                            <a 
                                href="https://wa.me/5511999999999" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="canal-item"
                                style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                            >
                                <div className="canal-icon canal-verde">
                                    <IconPhone />
                                </div>
                                <div>
                                    <div className="canal-nome">WhatsApp</div>
                                    <div className="canal-desc">Resposta em até 2h</div>
                                </div>
                            </a>

                            {/* E-mail integrado com mailto */}
                            <a 
                                href="mailto:suporte@nutriesportiva.com"
                                className="canal-item"
                                style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                            >
                                <div className="canal-icon canal-azul">
                                    <IconMail />
                                </div>
                                <div>
                                    <div className="canal-nome">E-mail</div>
                                    <div className="canal-desc">suporte@nutriesportiva.com</div>
                                </div>
                            </a>

                            <div className="canal-item">
                                <div className="canal-icon canal-cinza">
                                    <IconFile />
                                </div>
                                <div>
                                    <div className="canal-nome">Documentação</div>
                                    <div className="canal-desc">Guias e manuais completos</div>
                                </div>
                            </div>
                        </div>

                        {/* Precisa de ajuda urgente */}
                        <div className="suporte-urgente">
                            <div className="suporte-urgente-titulo">Precisa de ajuda urgente?</div>
                            <p className="suporte-urgente-desc">
                                Assinantes do plano Pro possuem linha direta de emergência para problemas no acesso dos atletas.
                            </p>
                            <button className="suporte-urgente-btn">
                                Ligar para Especialista
                            </button>
                        </div>
                    </div>

                    {/* Coluna direita */}
                    <div className="suporte-col-right">

                        {/* Enviar mensagem */}
                        <div className="suporte-card">
                            <div className="suporte-card-titulo">
                                <IconMail />
                                Enviar uma mensagem
                            </div>

                            {enviado && (
                                <div className="suporte-sucesso">
                                    ✓ Mensagem enviada! Responderemos em breve.
                                </div>
                            )}

                            <div className="form-field">
                                <label>Assunto</label>
                                <select
                                    className="form-input"
                                    value={assunto}
                                    onChange={e => setAssunto(e.target.value)}
                                >
                                    <option value="">Selecione um tópico...</option>
                                    <option value="acesso">Problema de acesso</option>
                                    <option value="atleta">Dúvida sobre atleta</option>
                                    <option value="relatorio">Relatórios</option>
                                    <option value="faturamento">Faturamento</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Sua mensagem</label>
                                <textarea
                                    className="form-input"
                                    rows={5}
                                    placeholder="Descreva detalhadamente como podemos te ajudar..."
                                    value={mensagem}
                                    onChange={e => setMensagem(e.target.value)}
                                    style={{ resize: "vertical", lineHeight: 1.6 }}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    className="btn-red"
                                    onClick={enviarMensagem}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px" }}
                                >
                                    <IconSend />
                                    Enviar Mensagem
                                </button>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="suporte-card" style={{ marginTop: 20 }}>
                            <div className="suporte-card-titulo">
                                <IconFaq />
                                Perguntas Frequentes (FAQ)
                            </div>

                            {FAQS.map((faq, i) => (
                                <div key={i} className="faq-item">
                                    <button
                                        className="faq-pergunta"
                                        onClick={() => setFaqAberto(faqAberto === i ? -1 : i)}
                                    >
                                        <span>{faq.pergunta}</span>
                                        <IconChevron open={faqAberto === i} />
                                    </button>
                                    {faqAberto === i && (
                                        <div className="faq-resposta">{faq.resposta}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}