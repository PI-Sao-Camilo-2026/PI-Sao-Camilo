import "../../css/Homepage.css";
import { useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineBell } from "react-icons/ai";
import { FaHome, FaUserFriends } from "react-icons/fa";

export default function Homepage() {
    const navigate = useNavigate();

    const temNotificacao = true;

    return (
        <div className="homepage-page">
            <div className="phone-screen">
                <header className="homepage-header">
                    <img src="/R.png" alt="Logo São Camilo" />
                    <h1>SÃO CAMILO</h1>
                    <p>Nutri - Esportiva</p>
                    <span className="active">● SESSÃO ATIVA</span>
                    <button
                        className={`header-icon ${temNotificacao ? "notificacao-ativa" : ""}`}
                    >
                        <AiOutlineBell />
                        {temNotificacao && <span className="notification-dot"></span>}
                    </button>
                </header>
                <main>
                    <section className="medico-area">
                        <img className="medico-icon" src="/ChatGPT Image 30 de abr. de 2026, 09_33_34.png" alt="silhueta atleta"></img>

                        <div>
                            <h2>Olá, Doutor!</h2>
                            <p>Aqui está o panorama geral dos atletas</p>
                        </div>
                    </section>
                    <section>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <p className="stat-label">ATLETAS</p>
                                <h3>24</h3>
                                <span className="stat-growth">Ativos</span>
                            </div>

                            <div className="stat-card">
                                <p className="stat-label">SESSÕES</p>
                                <h3>48</h3>
                                <p className="stat-period">Este mês</p>
                                <span className="stat-growth">↑ 8% vs mês anterior</span>
                            </div>

                            <div className="stat-card">
                                <p className="stat-label">ALERTAS</p>
                                <h3>
                                    3
                                </h3>
                                <span className="stat-growth">Mensagens</span>
                            </div>

                            <div className="stat-card">
                                <p className="stat-label">RISCOS</p>
                                <h3>
                                    2 
                                </h3>
                                <span className="stat-growth">Moderado</span>
                            </div>
                        </div>
                    </section>
                    <button className="btn-voltar" onClick={() => navigate("/")}>
                        Voltar para pré-sessão
                    </button>
                </main>
                <nav className="bottom-nav">
                    <div className="nav-item">
                        <span className="nav-icon vazio">
                            <FaHome />
                        </span>
                        <p>INÍCIO</p>
                    </div>

                    <div className="nav-item active-nav">
                        <span className="nav-icon">
                            <FaUserFriends />
                        </span>
                        <p>ATLETAS</p>
                    </div>

                    <div className="nav-item">
                        <span className="nav-icon vazio">
                            <AiOutlineBell />
                        </span>
                        <p>ALERTAS</p>
                    </div>

                    <div className="nav-item">
                        <span className="nav-icon vazio">
                            <AiOutlineUser />
                        </span>
                        <p>PERFIL</p>
                    </div>
                </nav>
            </div>
        </div>
    );
}