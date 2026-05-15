import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./views/Login";
import Cadastro from "./views/Cadastro";   // ← nova rota
import Home from "./views/Home";
import PreSessao from "./views/atleta/PreSessao";
import Sessao from "./views/atleta/Sessao";
import PosSessao from "./views/atleta/PosSessao";
import Relatorios from "./views/atleta/Relatorios";
import Historico from "./views/atleta/Historico";
import Homepage from "./views/medico/Homepage";
import Atletas from "./views/medico/Atletas";
import PerfilAtleta from "./views/medico/PerfilAtleta";
import Perfil from "./views/medico/Perfil";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Públicas ── */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* ── Atleta ── */}
          <Route path="/home" element={
            <PrivateRoute tipo="atleta"><Home /></PrivateRoute>
          } />
          <Route path="/presessao" element={
            <PrivateRoute tipo="atleta"><PreSessao /></PrivateRoute>
          } />
          <Route path="/sessao" element={
            <PrivateRoute tipo="atleta"><Sessao /></PrivateRoute>
          } />
          <Route path="/possessao" element={
            <PrivateRoute tipo="atleta"><PosSessao /></PrivateRoute>
          } />
          <Route path="/relatorios" element={
            <PrivateRoute tipo="atleta"><Relatorios /></PrivateRoute>
          } />
          <Route path="/historico" element={
            <PrivateRoute tipo="atleta"><Historico /></PrivateRoute>
          } />

          {/* ── Profissional ── */}
          <Route path="/homepage" element={
            <Homepage />
          } />
          <Route path="/atletas" element={
            <Atletas />
          } />
          <Route path="/atletas/:id" element={
            <PerfilAtleta />
          } />
          <Route path="/perfil" element={
           <Perfil />
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;