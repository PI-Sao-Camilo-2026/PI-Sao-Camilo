import "../../css/Historico.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sessoesApi } from "../../services/api";
import { GiSoccerBall } from "react-icons/gi";
import { FaDumbbell, FaHeartbeat, FaClipboardList } from "react-icons/fa";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineHeart,
  AiOutlineBell,
  AiFillBell,
} from "react-icons/ai";

const ICONE_MODALIDADE = {
  futebol: <GiSoccerBall />,
  musculação: <FaDumbbell />,
  musculacao: <FaDumbbell />,
  aeróbico: <FaHeartbeat />,
  aerobico: <FaHeartbeat />,
};

function iconeModalidade(modalidade) {
  if (!modalidade) return "🏃";
  const key = modalidade.toLowerCase();
  return ICONE_MODALIDADE[key] || "🏃";
}

export default function Historico() {
  const navigate = useNavigate();
  const [sessoes, setSessoes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [hist, st] = await Promise.all([
          sessoesApi.historico(),
          sessoesApi.stats(),
        ]);
        setSessoes(hist);
        setStats(st);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const temSessoes = sessoes.length > 0;

  return (
    <div className="historico-page">
      <div className="phone-screen">
        <header className="historico-header">
          <img src="/R.png" alt="Logo São Camilo" />
          <h1>SÃO CAMILO</h1>
          <p>Nutri - Esportiva</p>
          <span className="active">● SESSÃO ATIVA</span>
          <button className="header-icon">
            <AiOutlineBell className="notificacao-vazia" />
          </button>
        </header>

        <main className="historico-main">
          <section className="titulo">
            <h1>Dashboard de Sessões</h1>
          </section>

          {loading ? (
            <div className="historico-vazio">
              <p>Carregando histórico...</p>
            </div>
          ) : !temSessoes ? (
            <div className="historico-vazio">
              <h2>Nenhuma sessão concluída</h2>
              <p>Fala, atleta! Conclua sua primeira sessão de treino para aparecer no seu histórico.</p>
            </div>
          ) : (
            <>
              {/* Stats reais do backend */}
              {stats && (
                <section>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon green">📅</div>
                      <p className="stat-label">SESSÕES</p>
                      <h3>{stats.total_sessoes}</h3>
                      <p className="stat-period">Total</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon blue">💧</div>
                      <p className="stat-label">TAXA MÉDIA</p>
                      <h3>{stats.taxa_media ? `${stats.taxa_media}` : "--"}</h3>
                      <p className="stat-period">L/h</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon red">⚡</div>
                      <p className="stat-label">TAXA MÁX.</p>
                      <h3>{stats.taxa_maxima ?? "--"}</h3>
                      <p className="stat-period">L/h</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon purple">⚖️</div>
                      <p className="stat-label">MAIOR PERDA</p>
                      <h3>{stats.maior_perda_pct ? `${stats.maior_perda_pct}%` : "--"}</h3>
                      <p className="stat-period">de massa</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Lista de sessões reais */}
              <section className="secao-sessoes">
                <div className="titulo-sessoes">
                  <h2>ÚLTIMAS SESSÕES</h2>
                </div>

                <div className="cards-sessao">
                  {sessoes.map((s) => (
                    <div className="esquerda" key={s.id}>
                      <div className="icone-aerobico">
                        {iconeModalidade(s.modalidade)}
                      </div>
                      <div className="informacoes">
                        <p className="data-tempo">
                          {s.criado_em
                            ? new Date(s.criado_em).toLocaleDateString("pt-BR")
                            : "--"}
                        </p>
                        <h3>{s.modalidade || "Treino"}</h3>
                        <div className="resumo-resultados">
                          <span>💧 {s.taxa_sudorese ? `${s.taxa_sudorese} L/h` : "--"}</span>
                          <span>⚖️ {s.variacao_peso_pct ? `${s.variacao_peso_pct}%` : "--"}</span>
                        </div>
                      </div>
                      <div className="direita">
                        <div className="status">CONCLUÍDA</div>
                        <span className="flecha">›</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button className="btn-voltar" onClick={() => navigate("/presessao")}>
                Nova sessão
              </button>
            </>
          )}
        </main>

        <nav className="bottom-nav">
          <div className="nav-item" onClick={() => navigate("/home")}>
            <span className="nav-icon vazio"><AiOutlineHome /></span>
            <p>INÍCIO</p>
          </div>
          <div className="nav-item active-nav">
            <span className="nav-icon"><FaClipboardList /></span>
            <p>HISTÓRICO</p>
          </div>
          <div className="nav-item">
            <span className="nav-icon vazio"><AiOutlineHeart /></span>
            <p>OBSERVAÇÕES</p>
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