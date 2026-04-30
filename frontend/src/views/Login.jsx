import "../css/Login.css";
import logo from "../assets/logo.png";
import silhueta from "../assets/silhueta.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="phone-screen">
        <header className="login-header">
          <img src={logo} alt="Logo São Camilo" />
          <h1>SÃO CAMILO</h1>
          <p>Nutri - Esportiva</p>
        </header>

        <main className="login-main">
          <div className="atleta-box">
            <img className="atleta" src={silhueta} alt="Silhueta Atleta" />
          </div>

          <h2>Bem-vindo!</h2>
          <p className="subtitle">Acesse sua conta para continuar</p>

          <label>E-mail</label>
          <div className="input-box">
            <input placeholder="exemplo@email.com" />
            <span>✉️</span>
          </div>

          <label>Senha</label>
          <div className="input-box">
            <input type="password" placeholder="Digite sua senha" />
            <span>🔒</span>
          </div>

          <div className="options">
            <div className="remember">
              <div className="checkbox"></div>
              <span>Lembrar de mim</span>
            </div>

            <a href="#">Esqueceu sua senha?</a>
          </div>

          <button className="enter-btn" onClick={() => navigate("/home")}>
            🔒 ENTRAR
          </button>

          <div className="divider">
            <div></div>
            <span>OU</span>
            <div></div>
          </div>

          <button className="register-btn">👤+ CADASTRE-SE</button>

          <p className="create-account">
            Novo por aqui? <a href="#">Crie sua conta</a> e comece agora!
          </p>
        </main>

        <nav className="bottom-nav">
          <div>
            <span>⌂</span>
            <p>INÍCIO</p>
          </div>
          <div>
            <span>▤</span>
            <p>HISTÓRICO</p>
          </div>
          <div>
            <span>♡</span>
            <p>OBSERVAÇÕES</p>
          </div>
          <div>
            <span>♙</span>
            <p>PERFIL</p>
          </div>
        </nav>
      </div>
    </div>
  );
}