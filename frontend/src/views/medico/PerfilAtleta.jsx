import "../../css/PerfilAtleta.css";
import { useNavigate, useParams } from "react-router-dom";
import {
    AiOutlineUser,
    AiOutlineBell,
    AiFillBell,
    AiFillHome,
} from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";

export default function PerfilAtleta() {
    const navigate = useNavigate();
    const { id } = useParams();

    const temNotificacao = false;

    const atleta = {
        id,
        nome: "João Silva",
        esporte: "Futebol",
        idade: 23,
        foto: "/medico1.png",
        sessoesMes: 12,
        suor: "1,8 L/h",
        perdaPeso: "1,6%",
        hidratacao: "1,7 L/h",
        ultimaSessao: "Hoje • 01:25:54",
        ingestao: "1,6 L/h",
        taxaSudorese: "1,9 L/h",
    };

    return (
        <div className="perfil-page">
            <div className="phone-screen">
                <header className="perfil-header">
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
                    </button>
                </header>

                <main className="perfil-main">
                    <section className="perfil-top">
                        <button className="back-btn" onClick={() => navigate("/atletas")}>
                            ←
                        </button>

                        <img className="perfil-foto" src={atleta.foto} alt={atleta.nome} />

                        <div>
                            <h2>{atleta.nome}</h2>
                            <p>
                                {atleta.esporte} • {atleta.idade} anos
                            </p>
                        </div>

                        <span className="star">★</span>
                    </section>

                    <nav className="perfil-tabs">
                        <button className="active-tab">RESUMO</button>
                        <button>SESSÕES</button>
                        <button>GRÁFICOS</button>
                        <button>DADOS</button>
                    </nav>

                    <section className="resumo-box">
                        <h3>RESUMO DO ATLETA</h3>

                        <div className="resumo-grid">
                            <div className="resumo-card">
                                <p>Sessões (Mês)</p>
                                <strong>{atleta.sessoesMes}</strong>
                            </div>

                            <div className="resumo-card">
                                <p>Taxa de sudorese média</p>
                                <strong>{atleta.suor}</strong>
                            </div>

                            <div className="resumo-card">
                                <p>Perda de peso média</p>
                                <strong>{atleta.perdaPeso}</strong>
                            </div>

                            <div className="resumo-card destaque">
                                <p>Hidratação média</p>
                                <strong>{atleta.hidratacao}</strong>
                            </div>
                        </div>
                    </section>

                    <section className="ultima-box">
                        <h3>ÚLTIMA SESSÃO</h3>
                        <p>{atleta.ultimaSessao}</p>

                        <div className="ultima-grid">
                            <div>
                                <p>Perda de peso</p>
                                <strong>{atleta.perdaPeso}</strong>
                            </div>

                            <div>
                                <p>Ingestão</p>
                                <strong>{atleta.ingestao}</strong>
                            </div>

                            <div>
                                <p>Taxa de sudorese</p>
                                <strong>{atleta.taxaSudorese}</strong>
                            </div>
                        </div>

                        <button className="detalhes-btn">
                            VER DETALHES DA SESSÃO
                        </button>
                    </section>

                    <section className="tendencia-box">
                        <h3>TENDÊNCIA (30 DIAS)</h3>

                        <div className="grafico-fake">
                            <div>
                                <p>Taxa de sudorese</p>
                                <span className="linha verde"></span>
                            </div>

                            <div>
                                <p>Perda de peso</p>
                                <span className="linha vermelha"></span>
                            </div>
                        </div>
                    </section>
                </main>

                <nav className="bottom-nav">
                    <div className="nav-item active-nav">
                        <span className="nav-icon">
                            <AiFillHome />
                        </span>
                        <p>INÍCIO</p>
                    </div>

                    <div className="nav-item" onClick={() => navigate("/atletas")}>
                        <span className="nav-icon vazio">
                            <HiOutlineUserGroup />
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