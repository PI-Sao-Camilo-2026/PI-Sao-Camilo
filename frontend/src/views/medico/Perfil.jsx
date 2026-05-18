import "../../css/Perfil.css";
import { useNavigate } from "react-router-dom";
import {
    AiOutlineHome,
    AiOutlineBell,
    AiFillBell,
    AiOutlineSetting,
    AiOutlineLock,
    AiOutlineQuestionCircle,
    AiOutlineInfoCircle,
    AiOutlineRight,
} from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import { FaUser } from "react-icons/fa";

export default function Perfil() {
    const navigate = useNavigate();
    const temNotificacao = true;

    return (
        <div className="perfil-medico-page">
            <div className="phone-screen">
                <header className="perfil-medico-header">
                    <img src="/R.png" alt="Logo São Camilo" />
                    <h1>SÃO CAMILO</h1>
                    <p>Nutri - Esportiva</p>
                    <span className="active">● SESSÃO ATIVA</span>
                    <button className="header-icon">
                        {temNotificacao ? (
                            <AiFillBell className="notificacao-ativa" />
                        ) : (
                            <AiOutlineBell className="notificacao-vazia" />
                        )}

                        {temNotificacao && <span className="notification-dot"></span>}
                    </button>
                </header>

                <main className="perfil-medico-main">
                    <h2>Meu perfil</h2>

                    <section className="perfil-medico-content">
                        <div className="doctor-card">
                            <img
                                src="/medico1.png"
                                alt="Dr. Carlos Almeida"
                                className="doctor-photo"
                            />

                            <h3>Dr. Carlos Almeida</h3>

                            <p>Médico do Esporte</p>
                            <span>CRM: 123456-SP</span>
                            <span>Equipe principal</span>

                            <button>EDITAR PERFIL</button>
                        </div>

                        <div className="profile-options">
                            <div className="profile-option">
                                <AiOutlineSetting />
                                <span>Preferências</span>
                                <AiOutlineRight />
                            </div>

                            <div className="profile-option">
                                <AiOutlineBell />
                                <span>Notificações</span>
                                <AiOutlineRight />
                            </div>

                            <div className="profile-option">
                                <AiOutlineLock />
                                <span>Segurança</span>
                                <AiOutlineRight />
                            </div>

                            <div className="profile-option">
                                <AiOutlineLock />
                                <span>Privacidade e LGPD</span>
                                <AiOutlineRight />
                            </div>

                            <div className="profile-option">
                                <AiOutlineQuestionCircle />
                                <span>Ajuda e suporte</span>
                                <AiOutlineRight />
                            </div>

                            <div className="profile-option">
                                <AiOutlineInfoCircle />
                                <span>Sobre o aplicativo</span>
                                <AiOutlineRight />
                            </div>
                        </div>
                    </section>
                </main>

                <nav className="bottom-nav">
                    <div className="nav-item" onClick={() => navigate("/homepage")}>
                        <span className="nav-icon vazio"><AiOutlineHome /></span>
                        <p>INÍCIO</p>
                    </div>

                    <div className="nav-item" onClick={() => navigate("/atletas")}>
                        <span className="nav-icon vazio"> <HiOutlineUserGroup /></span>
                        <p>ATLETAS</p>
                    </div>

                    <div className="nav-item">
                        <span className="nav-icon vazio"><AiOutlineBell /></span>
                        <p>ALERTAS</p>
                    </div>

                    <div className="nav-item active-nav">
                        <span className="nav-icon"><FaUser /></span>
                        <p>PERFIL</p>
                    </div>
                </nav>
            </div>
        </div>
    );
}