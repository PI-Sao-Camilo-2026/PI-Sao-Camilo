import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// ── Auth (ficam em src/views/ direto)
import Login from './views/Login.jsx';
import Cadastro from './views/Cadastro.jsx';
import Home from './views/Home.jsx';

// ── Views atleta
import Guia from './views/atleta/Guia.jsx';
import Historico from './views/atleta/Historico.jsx';
import Perfil from './views/atleta/Perfil.jsx';
import PreSessao from './views/atleta/PreSessao.jsx';
import Sessao from './views/atleta/Sessao.jsx';
import PosSessao from './views/atleta/PosSessao.jsx';
import Relatorios from './views/atleta/Relatorios.jsx';

// ── Views médico
import Atletas from './views/medico/Atletas.jsx';
import ConfiguracaoProf from './views/medico/ConfiguracaoProf.jsx';
import HistoricoProf from './views/medico/HistoricoProf.jsx';
import Homepage from './views/medico/Homepage.jsx';
import PerfilAtleta from './views/medico/PerfilAtleta.jsx';
import RelatoriosProf from './views/medico/RelatoriosProf.jsx';

// ── Guards ──────────────────────────────────────────

function RotaAtleta({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return null;
  if (!usuario) return <Navigate to="/" replace />;
  if (usuario.tipo !== 'atleta') return <Navigate to="/homepage" replace />;
  return children;
}

function RotaMedico({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return null;
  if (!usuario) return <Navigate to="/" replace />;
  if (usuario.tipo !== 'profissional') return <Navigate to="/home" replace />;
  return children;
}

// ── App ─────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Atleta */}
        <Route path="/home" element={<RotaAtleta><Home /></RotaAtleta>} />
        <Route path="/presessao" element={<RotaAtleta><PreSessao /></RotaAtleta>} />
        <Route path="/sessao" element={<RotaAtleta><Sessao /></RotaAtleta>} />
        <Route path="/possessao" element={<RotaAtleta><PosSessao /></RotaAtleta>} />
        <Route path="/relatorios" element={<RotaAtleta><Relatorios /></RotaAtleta>} />
        <Route path="/historico" element={<RotaAtleta><Historico /></RotaAtleta>} />
        <Route path="/guia" element={<RotaAtleta><Guia /></RotaAtleta>} />
        <Route path="/perfil" element={<RotaAtleta><Perfil /></RotaAtleta>} />

        {/* Médico */}
        <Route path="/homepage" element={<RotaMedico><Homepage /></RotaMedico>} />
        <Route path="/atletas" element={<RotaMedico><Atletas /></RotaMedico>} />
        <Route path="/atletas/:id" element={<RotaMedico><PerfilAtleta /></RotaMedico>} />
        <Route path="/historico-prof" element={<RotaMedico><HistoricoProf /></RotaMedico>} />
        <Route path="/relatorios-prof" element={<RotaMedico><RelatoriosProf /></RotaMedico>} />
        <Route path="/configuracoes" element={<RotaMedico><ConfiguracaoProf /></RotaMedico>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}