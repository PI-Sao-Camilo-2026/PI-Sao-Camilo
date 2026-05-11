import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./views/Login";
import Home from "./views/Home";
import PreSessao from "./views/atleta/PreSessao";
import Sessao from "./views/atleta/Sessao";
import PosSessao from "./views/atleta/PosSessao";
import Relatorios from "./views/atleta/Relatorios";
import Historico from "./views/atleta/Historico";
import Homepage from "./views/medico/Homepage";
import Atletas from "./views/medico/Atletas";
import PerfilAtleta from "./views/medico/PerfilAtleta";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/" element={<Login />} />

          {/* Atleta */}
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

          {/* Profissional */}
          <Route path="/homepage" element={
            <PrivateRoute tipo="profissional"><Homepage /></PrivateRoute>
          } />
          <Route path="/atletas" element={
            <PrivateRoute tipo="profissional"><Atletas /></PrivateRoute>
          } />
          <Route path="/atletas/:id" element={
            <PrivateRoute tipo="profissional"><PerfilAtleta /></PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;