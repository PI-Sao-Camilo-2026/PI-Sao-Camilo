import "../css/Cadastro.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";

const IconUser = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconActivity = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

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
                  <option value="Outro">Outro</option>
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

            <div className="input-wrap">
              <IconLock />
              <input
                name="senha"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                autoComplete="new-password"
              />
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
              <a href="#" onClick={(e) => e.preventDefault()}>
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
    </div>
  );
}
