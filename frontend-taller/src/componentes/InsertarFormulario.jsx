// src/componentes/InsertarFormulario.jsx
import { useState } from "react";
import "./InsertarFormulario.css";

function InsertarFormulario() {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    unidad_medida: "",
    stock_actual: "",
    stock_minimo: "",
  });

  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const respuesta = await fetch("http://localhost:3001/api/insertar-insumo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        setMensaje("✅ Insumo insertado correctamente.");
        setFormData({
          nombre: "",
          tipo: "",
          unidad_medida: "",
          stock_actual: "",
          stock_minimo: "",
        });
      } else {
        setMensaje(`❌ Error: ${data.error || "No se pudo insertar el insumo."}`);
      }
    } catch (error) {
      setMensaje("❌ Error del servidor.");
      console.error(error);
    }
  };

  return (
    <div className="formulario-container">
      <h2>Insertar Insumo</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del insumo"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="tipo"
          placeholder="Tipo"
          value={formData.tipo}
          onChange={handleChange}
        />
        <input
          type="text"
          name="unidad_medida"
          placeholder="Unidad de medida"
          value={formData.unidad_medida}
          onChange={handleChange}
        />
        <input
          type="number"
          name="stock_actual"
          placeholder="Stock actual"
          value={formData.stock_actual}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock_minimo"
          placeholder="Stock mínimo"
          value={formData.stock_minimo}
          onChange={handleChange}
          required
        />
        <button type="submit">Guardar Insumo</button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}

export default InsertarFormulario;
