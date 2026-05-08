import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <BrowserRouter>
      <Routes>

        <Route path="/possessao" element={<PosSessao />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/presessao" element={<PreSessao />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/sessao" element={<Sessao />} />
        <Route path="/historico" element={<Historico />} />

        <Route path="/homepage" element={<Homepage />} />
        <Route path="/atletas" element={<Atletas />} />
        <Route path="/atletas/:id" element={<PerfilAtleta />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;