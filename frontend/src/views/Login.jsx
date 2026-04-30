import "../css/Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

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
          <p className="subtitle">Acesse sua conta para continuar</p>

          <label className="label-email">E-mail</label>
          <div className="input-box">
            <input type="email" placeholder="exemplo@email.com" />
            <img src="png-transparent-email-email.png" className="simbolo-email" alt="E-mail" />
          </div>

          <label className="label-email">Senha</label>
          <div className="input-box">
            <input type="password" placeholder="Digite sua senha" />
            <img src="698630.png" className="cadeado-senha" alt="Cadeado Senha" />
          </div>

          <div className="opcoes">
            <div className="relembrar">
              <div className="checkbox"></div>
              <span>Lembrar de mim</span>
            </div>

            <a href="#">Esqueceu sua senha?</a>
          </div>

          <div><button className="enter-btn" onClick={() => navigate("/home")}>
          <img src="9e0b1a9c-eb86-453d-988f-1a95fd1e8dd4-removebg-preview.png" className="cadeado-btn" alt="Cadeado Entrar" />
            ENTRAR
          </button>
          </div>

          <div className="divider">
            <div></div>
            <span>OU</span>
            <div></div>
          </div>

          <button className="register-btn">
          <img src="91f0148c-ff2c-4bc2-9a93-62aa1cdbdb02-removebg-preview.png" className="cadastrar-btn" alt="Ícone Cadastrar" /> 
          + CADASTRE-SE</button>
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