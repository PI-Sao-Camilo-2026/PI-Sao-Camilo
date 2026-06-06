import "../css/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estados para o Modal de Recuperação
  const [showModal, setShowModal] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    if (!email || !senha) {
      setErro("Preencha e-mail e senha");
      return;
    }
    try {
      setLoading(true);
      const usuario = await login(email.trim().toLowerCase(), senha);
      if (usuario.tipo === "profissional") {
        navigate("/homepage");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setErro(err.message || "E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  // Função simulada de recuperação
  function handleRecoverPassword(e) {
    e.preventDefault();
    if (!emailRecuperar) return;
    setLoading(true);
    // Simula envio
    setTimeout(() => {
      setEnviado(true);
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="login-page">
      <header className="login-top">
        <div className="logo-box">
          <img src="ChatGPT_Image_21_de_mai._de_2026__16_56_19-removebg-preview.png" alt="Logo São Camilo" />
        </div>
      </header>

      <section className="login-right">
        <form className="login-form-area" onSubmit={handleLogin}>
          <div className="login-welcome">
            <h2>Bem-vindo!</h2>
            <p>Acesse sua conta para continuar</p>
          </div>

          <div className="campo-group">
            <label>E-MAIL</label>
            <div className="input-wrap">
              <IconMail />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="campo-group">
            <label>SENHA</label>
            <div className="input-wrap input-wrap-password">
              <IconLock />
              <input
                type={mostrarSenha ? "text" : "password"} 
                placeholder="  ••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
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
            {erro && <div className="erro-login" style={{color: "red", marginTop: "5px"}}>{erro}</div>}
            <div className="forgot-password">
              <span onClick={() => setShowModal(true)}>Esqueceu sua senha?</span>
            </div>
          </div>

          <button className="btn-entrar" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="link-cadastro">
            Ainda não tem conta?{" "}
            <strong onClick={() => navigate("/cadastro")}>Cadastre-se</strong>
          </div>
        </form>
      </section>

      {/* MODAL DE RECUPERAÇÃO DE SENHA */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            {!enviado ? (
              <>
                <div className="modal-header">
                  <div className="modal-icon">
                    <IconMail />
                  </div>
                  <h2>Recuperar Senha</h2>
                  <p>Informe seu e-mail para receber as instruções de redefinição.</p>
                </div>

                <form onSubmit={handleRecoverPassword}>
                  <div className="campo-group">
                    <label>E-MAIL CADASTRADO</label>
                    <div className="input-wrap">
                      <IconMail />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={emailRecuperar}
                        onChange={(e) => setEmailRecuperar(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-entrar" type="submit" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Instruções"}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-cancelar" 
                    onClick={() => setShowModal(false)}
                  >
                    Voltar para o Login
                  </button>
                </form>
              </>
            ) : (
              <div className="modal-success">
                <div className="modal-icon success">
                  <IconMail />
                </div>
                <h2>E-mail enviado!</h2>
                <p>Se este e-mail estiver cadastrado, você receberá um link em breve.</p>
                <button 
                  className="btn-entrar" 
                  onClick={() => {
                    setShowModal(false);
                    setEnviado(false);
                    setEmailRecuperar("");
                  }}
                >
                  Entendi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}