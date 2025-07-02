// src/auth/RutaPrivada.jsx
import { Navigate } from "react-router-dom";

const RutaPrivada = ({ children }) => {
  const estaAutenticado = localStorage.getItem("usuarioAutenticado");

  return estaAutenticado ? children : <Navigate to="/" />;
};

export default RutaPrivada;
