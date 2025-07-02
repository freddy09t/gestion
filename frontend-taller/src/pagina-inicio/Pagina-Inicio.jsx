import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pagina-Inicio.css';

function PaginaInicio() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Enviando login:", { correo, contrasena });
    
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }) // ✅ usar nombres correctos
    });

    const data = await response.json();

    if (data.exito) {
      navigate('/registrar');
    } else {
      setError(data.mensaje || 'Credenciales inválidas');
    }
  };

  return (
    <div className="inicio-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        <button type="submit">Ingresar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default PaginaInicio;
