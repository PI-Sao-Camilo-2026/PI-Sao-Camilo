import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import Home from "./views/Home";
import PreSessao from "./views/atleta/PreSessao";
import Sessao from "./views/atleta/Sessao";
import PosSessao from "./views/atleta/PosSessao";
import Relatorios from "./views/atleta/Relatorios";
import Historicos from "./views/atleta/Historicos";

import Homepage from "./views/medico/Homepage";
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
        <Route path="/historicos" element={<Historicos />} />

        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;