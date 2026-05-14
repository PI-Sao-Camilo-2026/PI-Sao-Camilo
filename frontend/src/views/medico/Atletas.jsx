// src/views/medico/Atletas.jsx
import "../../css/Atletas.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { usuariosApi } from "../../services/api";
import {
    AiOutlineUser, AiOutlineBell, AiOutlineSearch,
    AiOutlineFilter, AiOutlineHome,
} from "react-icons/ai";
import { HiUserGroup } from "react-icons/hi";

export default function Atletas() {
    const navigate = useNavigate();
    const [atletas, setAtletas] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const data = await usuariosApi.listarAtletas();
                setAtletas(data);
            } catch (err) {
                console.error("Erro ao carregar atletas:", err);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    const atletasFiltrados = atletas.filter((a) =>
        a.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (a.modalidade || "").toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="atletas-page">
            <div className="phone-screen">
                <header className="atletas-header">
                    <img src="/R.png" alt="Logo São Camilo" />
                    <h1>SÃO CAMILO</h1>
                    <p>Nutri - Esportiva</p>
                    <span className="active">● SESSÃO ATIVA</span>
                    <button className="header-icon">
                        <AiOutlineBell className="notificacao-vazia" />
                    </button>
                </header>

                <main className="atletas-main">
                    <section className="medico-area">
                        <div><h2>ATLETAS</h2></div>
                    </section>

                    <div className="search-box">
                        <AiOutlineSearch />
                        <input
                            type="text"
                            placeholder="Buscar atleta..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                        <AiOutlineFilter className="filter-icon" />
                    </div>

                    <div className="tabs">
                        <button className="tab active-tab">
                            Todos ({atletasFiltrados.length})
                        </button>
                    </div>

                    {loading ? (
                        <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                            Carregando atletas...
                        </p>
                    ) : atletasFiltrados.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
                            {busca ? "Nenhum atleta encontrado." : "Nenhum atleta vinculado ainda."}
                        </p>
                    ) : (
                        <section className="athlete-list">
                            {atletasFiltrados.map((atleta) => (
                                <div
                                    className="athlete-card"
                                    key={atleta.id}
                                    onClick={() => navigate(`/atletas/${atleta.id}`)}
                                >
                                    {/* Avatar com inicial do nome */}
                                    <div
                                        className="athlete-photo"
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            background: "#0A7C59", color: "#fff",
                                            display: "flex", alignItems: "center",
                                            justifyContent: "center", fontWeight: "bold", fontSize: 18,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {atleta.nome.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="athlete-info">
                                        <h3>{atleta.nome}</h3>
                                        <p>{atleta.modalidade || "Modalidade não informada"}</p>
                                        <span>Código: {atleta.codigo_anonimizado || "—"}</span>
                                    </div>

                                    <span className="arrow">›</span>
                                </div>
                            ))}
                        </section>
                    )}
                </main>

                <nav className="bottom-nav">
                    <div className="nav-item" onClick={() => navigate("/homepage")}>
                        <span className="nav-icon vazio"><AiOutlineHome /></span>
                        <p>INÍCIO</p>
                    </div>
                    <div className="nav-item active-nav">
                        <span className="nav-icon"><HiUserGroup /></span>
                        <p>ATLETAS</p>
                    </div>
                    <div className="nav-item">
                        <span className="nav-icon vazio"><AiOutlineBell /></span>
                        <p>ALERTAS</p>
                    </div>
                    <div className="nav-item">
                        <span className="nav-icon vazio"><AiOutlineUser /></span>
                        <p>PERFIL</p>
                    </div>
                </nav>
            </div>
        </div>
    );
}