import "../css/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", senha);

      const res = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.text();

        console.error(err);

        alert("Email ou senha inválidos");

        return;
      }

      const data = await res.json();

      console.log("LOGIN:");
      console.log(data);

      // salva JWT
      localStorage.setItem(
        "token",
        data.access_token
      );

      // salva usuário se existir
      if (data.usuario) {
        localStorage.setItem(
          "usuario",
          JSON.stringify(data.usuario)
        );
      }

      navigate("/home");

    } catch (err) {
      console.error(err);

      alert("Erro ao conectar com servidor");

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="phone-screen">

        <header className="login-header">
          <img src="/R.png" alt="Logo São Camilo" />

          <h1>SÃO CAMILO</h1>

          <p>Nutri - Esportiva</p>
        </header>

        <main className="login-main">

          <div className="atleta-box">
            <img
              className="atleta"
              src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png"
              alt="Silhueta Atleta"
            />
          </div>

          <h2>Bem-vindo!</h2>

          <p className="subtitle">
            Acesse sua conta para continuar
          </p>

          {/* EMAIL */}
          <label className="label-email">
            E-mail
          </label>

          <div className="input-box">
            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <img
              src="png-transparent-email-email.png"
              className="simbolo-email"
              alt="E-mail"
            />
          </div>

          {/* SENHA */}
          <label className="label-senha">
            Senha
          </label>

          <div className="input-box">
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
            />

            <img
              src="698630.png"
              className="cadeado-senha"
              alt="Cadeado Senha"
            />
          </div>

          <div className="opcoes">

            <div className="relembrar">
              <div className="checkbox"></div>

              <span>Lembrar de mim</span>
            </div>

            <a href="#">
              Esqueceu sua senha?
            </a>

          </div>

          {/* BOTÃO LOGIN */}
          <div>
            <button
              className="enter-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              <img
                src="9e0b1a9c-eb86-453d-988f-1a95fd1e8dd4-removebg-preview.png"
                className="cadeado-btn"
                alt="Cadeado Entrar"
              />

              {loading
                ? "ENTRANDO..."
                : "ENTRAR"}
            </button>
          </div>

          <div className="divider">
            <div></div>

            <span>OU</span>

            <div></div>
          </div>

          <button className="register-btn">
            <img
              src="91f0148c-ff2c-4bc2-9a93-62aa1cdbdb02-removebg-preview.png"
              className="cadastrar-btn"
              alt="Ícone Cadastrar"
            />

            + CADASTRE-SE
          </button>

        </main>
      </div>
    </div>
  );
}