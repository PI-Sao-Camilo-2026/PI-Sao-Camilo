import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import Home from "./views/Home";
import PreSessao from "./views/PreSessao";
import Sessao from "./views/Sessao";
import PosSessao from "./views/PosSessao";
import Relatorios from "./views/Relatorios";
import Historicos from "./views/Historicos";
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;