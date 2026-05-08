import "../../css/Atletas.css";
import { useNavigate } from "react-router-dom";
import {
    AiOutlineUser,
    AiOutlineBell,
    AiFillBell,
    AiOutlineSearch,
    AiOutlineFilter,
    AiOutlineHome,
} from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi";

export default function Atletas() {
    const navigate = useNavigate();

    const temNotificacao = false;

    const sessoes = [1];

    const atletas = [
        {
            id: 1,
            nome: "João Silva",
            esporte: "Futebol",
            idade: 23,
            ultima: "Hoje",
            risco: "Baixo",
            foto: "/medico1.png",
        },
        {
            id: 2,
            nome: "Lucas Oliveira",
            esporte: "Futebol",
            idade: 21,
            ultima: "Ontem",
            risco: "Moderado",
            foto: "/medico2.png",
        },
        {
            id: 3,
            nome: "Matheus Costa",
            esporte: "Atletismo",
            idade: 19,
            ultima: "2 dias",
            risco: "Baixo",
            foto: "/medico3.png",
        },
        {
            id: 4,
            nome: "Gabriel Santos",
            esporte: "Basquete",
            idade: 22,
            ultima: "Hoje",
            risco: "Alto",
            foto: "/medico4.png",
        },
        {
            id: 5,
            nome: "Rafael Lima",
            esporte: "Futebol",
            idade: 24,
            ultima: "Ontem",
            risco: "Baixo",
            foto: "/medico5.png",
        },
    ];

    const mostrarDashboard = atletas.length > 0 || sessoes.length > 0;

    return (
        <div className="atletas-page">
            <div className="phone-screen">
                <header className="atletas-header">
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
                <main className="atletas-main">
                    <section
                        className={mostrarDashboard ? "medico-area" : "medico-area vazio"}
                    >
                        <div>
                            <h2>ATLETAS</h2>
                        </div>
                    </section>

                    {mostrarDashboard ? (
                        <>
                            <div className="search-box">
                                <AiOutlineSearch />
                                <input type="text" placeholder="Buscar atleta..." />
                                <AiOutlineFilter className="filter-icon" />
                            </div>

                            <div className="tabs">
                                <button className="tab active-tab">Todos (24)</button>
                                <button className="tab">Equipes</button>
                            </div>

                            <section className="athlete-list">
                                {atletas.map((atleta) => (
                                    <div className="athlete-card" key={atleta.id}
                                        onClick={() => navigate(`/atletas/${atleta.id}`)}>
                                        <img
                                            src={atleta.foto}
                                            alt={atleta.nome}
                                            className="athlete-photo"
                                        />

                                        <div className="athlete-info">
                                            <h3>{atleta.nome}</h3>

                                            <p>
                                                {atleta.esporte} • {atleta.idade} anos
                                            </p>

                                            <span>Última sessão: {atleta.ultima}</span>
                                        </div>

                                        <div className="risk-area">
                                            <p>Risco</p>

                                            <span className={`risk ${atleta.risco.toLowerCase()}`}>
                                                {atleta.risco}
                                            </span>
                                        </div>

                                        <span className="arrow">›</span>
                                    </div>
                                ))}
                            </section>
                        </>
                    ) : null}
                </main>
                <nav className="bottom-nav">
                    <div className="nav-item" onClick={() => navigate("/homepage")}>
                        <span className="nav-icon vazio">
                            <AiOutlineHome />
                        </span>
                        <p>INÍCIO</p>
                    </div>

                    <div className="nav-item active-nav">
                        <span className="nav-icon">
                            <HiUserGroup />
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
