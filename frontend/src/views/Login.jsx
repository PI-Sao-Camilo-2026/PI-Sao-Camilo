import "../css/Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const IconActivity = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tipo, setTipo] = useState("atleta");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    if (!email || !senha) { setErro("Preencha e-mail e senha"); return; }

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

  return (
    <div className="login-page">
      <div className="login-screen">

        {/* Hero */}
        <header className="login-hero">
          <div className="login-logo-box">
            <IconActivity />
          </div>
          <h1>Nutri-Esportiva</h1>
          <p>Hidratação inteligente para alta performance</p>
        </header>

        {/* Form */}
        <div className="login-body">

          {/* Toggle */}
          <div className="tipo-toggle">
            <button
              type="button"
              className={tipo === "atleta" ? "active" : ""}
              onClick={() => setTipo("atleta")}
            >
              Sou Atleta
            </button>
            <button
              type="button"
              className={tipo === "profissional" ? "active" : ""}
              onClick={() => setTipo("profissional")}
            >
              Sou Profissional
            </button>
          </div>

          {erro && <div className="erro-msg">{erro}</div>}

          {/* E-mail */}
          <div className="campo-group">
            <label>E-MAIL</label>
            <div className="input-wrap">
              <IconMail />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="campo-group">
            <label>SENHA</label>
            <div className="input-wrap">
              <IconLock />
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            className="btn-entrar"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"} {!loading && <span>›</span>}
          </button>

          <div className="link-cadastro">
            Ainda não tem conta?{" "}
            <strong onClick={() => navigate("/cadastro")}>Cadastre-se</strong>
          </div>
        </div>
      </div>
    </div>
  );
}