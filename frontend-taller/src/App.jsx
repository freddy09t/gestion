// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PaginaInicio from "./pagina-inicio/Pagina-Inicio";
import InsertarFormulario from "./componentes/InsertarFormulario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicio />} />
        <Route path="/registrar" element={<InsertarFormulario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
