import "../css/HomePage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { sessoesApi } from "../services/api";
import BottomNav, { IconClock, IconBook, IconUser } from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessoesApi.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const primeiroNome = usuario?.nome?.split(" ")[0] || "Atleta";

  // Hora do dia para saudação
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="atleta-page">
      <div className="atleta-screen">

        {/* Hero */}
        <div className="atleta-hero" style={{ paddingBottom: 36 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
            {saudacao},
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 2 }}>{primeiroNome}</h1>
          <p>Pronto para registrar seu treino?</p>
        </div>

        <div className="atleta-body">

          {/* Botão iniciar sessão */}
          <button
            className="btn-primary"
            style={{ marginBottom: 20, fontSize: 16, padding: "18px" }}
            onClick={() => navigate("/presessao")}
          >
            Iniciar novo treino <span style={{ fontSize: 20 }}>›</span>
          </button>

          {/* Stats rápidas */}
          {!loading && stats && stats.total_sessoes > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <StatCard
                icon=""
                label="Sessões"
                value={stats.total_sessoes}
                sub="Total registradas"
                onClick={() => navigate("/historico")}
              />
              <StatCard
                icon=""
                label="Taxa Média"
                value={stats.taxa_media ? `${stats.taxa_media} L/h` : "—"}
                sub="de sudorese"
                onClick={() => navigate("/historico")}
              />
            </div>
          )}

          {/* Ações rápidas */}
          <div className="a-card" style={{ marginBottom: 14 }}>
            <div className="a-card-title">
              {/* <div className="a-card-icon"></div> */}
              <h3>Acesso Rápido</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* 2. Colocando as tags dos ícones em vez de aspas vazias */}
              <AcaoRow
                icon={<IconClock />}
                titulo="Histórico de Sessões"
                desc="Veja todas as suas sessões registradas"
                onClick={() => navigate("/historico")}
              />
              <AcaoRow
                icon={<IconBook />}
                titulo="Guia de Hidratação"
                desc="Aprenda a registrar corretamente"
                onClick={() => navigate("/guia")}
              />
              <AcaoRow
                icon={<IconUser />}
                titulo="Meu Perfil"
                desc="Gerencie seus dados pessoais"
                onClick={() => navigate("/perfil")}
              />
            </div>
          </div>

          {/* Se não tem sessões ainda */}
          {!loading && (!stats || stats.total_sessoes === 0) && (
            <div style={{
              textAlign: "center", padding: "24px 16px",
              background: "#fafafa", borderRadius: 14,
              border: "1px dashed #ddd",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 6 }}>
                Nenhuma sessão ainda
              </div>
              <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>
                Inicie seu primeiro treino e comece a monitorar sua hidratação.
              </div>
            </div>
          )}
        </div>

        <BottomNav active="home" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", border: "1px solid #ebebeb",
        borderRadius: 14, padding: "16px 14px",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.7 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: "4px 0 2px" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#bbb" }}>{sub}</div>
    </div>
  );
}

function AcaoRow({ icon, titulo, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 0", borderBottom: "1px solid #f5f5f5",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "transparent",
        color: "#9B1C2E", 
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{titulo}</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{desc}</div>
      </div>
      <span style={{ color: "#ccc", fontSize: 20 }}>›</span>
    </div>
  );
}