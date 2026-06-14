import "../css/Cadastro.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function ModalTermos({ onClose, onAceitar }) {
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
            onClick={onAceitar}
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
            Entendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tipo, setTipo] = useState("atleta");
  const [form, setForm] = useState({
    nome: "",
    sexo: "",
    modalidade: "",
    email: "",
    senha: "",
    termos: false,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe seu nome completo");
      return;
    }
    if (!form.email.trim()) {
      setErro("Informe seu e-mail");
      return;
    }
    if (form.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (!form.termos) {
      setErro("Aceite os Termos de Uso para continuar");
      return;
    }

    try {
      setLoading(true);

      await authApi.registrar({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        tipo,
        sexo: form.sexo || null,
        modalidade: form.modalidade.trim() || null,
      });

      const usuario = await login(form.email.trim().toLowerCase(), form.senha);

      if (usuario.tipo === "profissional") {
        navigate("/homepage");
      } else {
        navigate("/home");
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("já cadastrado") || msg.includes("409")) {
        setErro("Este e-mail já está cadastrado. Faça login.");
      } else {
        setErro(msg || "Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-screen">
        <header className="cadastro-top">
          <div className="logo-box">
            <img
              src="ChatGPT_Image_21_de_mai._de_2026__16_56_19-removebg-preview.png"
              alt="Logo São Camilo"
            />
          </div>
        </header>

        <form className="cadastro-form-area" onSubmit={handleSubmit}>
          <div className="tipo-toggle">
            <button
              type="button"
              className={tipo === "atleta" ? "active" : ""}
              onClick={() => setTipo("atleta")}
            >
              Sou atleta
            </button>

            <button
              type="button"
              className={tipo === "profissional" ? "active" : ""}
              onClick={() => setTipo("profissional")}
            >
              Sou profissional
            </button>
          </div>

          <div className="campo-group">
            <label>Nome completo</label>
            <div className="input-wrap">
              <IconUser />
              <input
                name="nome"
                type="text"
                placeholder="Seu nome"
                value={form.nome}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="campo-row">
            <div className="campo-group">
              <label>Sexo</label>
              <div className="input-wrap">
                <select name="sexo" value={form.sexo} onChange={handleChange}>
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
                <span className="select-arrow">▾</span>
              </div>
            </div>

            <div className="campo-group">
              <label>{tipo === "atleta" ? "Modalidade" : "Função"}</label>
              <div className="input-wrap no-icon">
                {tipo === "atleta" ? (
                  <input
                    name="modalidade"
                    type="text"
                    placeholder="Ex: Corrida"
                    value={form.modalidade}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <select
                      name="modalidade"
                      value={form.modalidade}
                      onChange={handleChange}
                    >
                      <option value="">Selecione</option>
                      <option value="Médico">Médico</option>
                      <option value="Nutricionista">Nutricionista</option>
                      <option value="Fisioterapeuta">Treinador</option>
                    </select>
                    <span className="select-arrow">▾</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="campo-group">
            <label>E-mail</label>
            <div className="input-wrap">
              <IconMail />
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="campo-group">
            <label>Senha</label>
            <div className="input-wrap input-wrap-password">
              <IconLock />
              <input
                name="senha"
                type={mostrarSenha ? "text" : "password"} 
                placeholder="  ••••••••"
                value={form.senha}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex="-1"
              >
                {mostrarSenha ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <div className="termos-row">
            <input
              type="checkbox"
              name="termos"
              id="termos"
              checked={form.termos}
              onChange={handleChange}
            />
            <p>
              Li e aceito os{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setModalTermos(true); }}
              >
                Termos de Uso
              </a>{" "}
              e concordo com o processamento dos meus dados de hidratação e
              medidas corporais para avaliação.
            </p>
          </div>

          {erro && <div className="erro-cadastro">{erro}</div>}

          <button type="submit" className="btn-criar-conta" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <div className="link-login">
            Já possui conta?{" "}
            <button type="button" onClick={() => navigate("/")}>
              Faça Login
            </button>
          </div>
        </form>
      </div>

      {modalTermos && (
        <ModalTermos
          onClose={() => setModalTermos(false)}
          onAceitar={() => {
            setForm(prev => ({ ...prev, termos: true }));
            setModalTermos(false);
          }}
        />
      )}
    </div>
  );
}