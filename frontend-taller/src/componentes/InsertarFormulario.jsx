// InsertarFormulario.jsx
import { useEffect, useState } from "react";
import "./InsertarFormulario.css";

function InsertarFormulario() {
  const [formularioActivo, setFormularioActivo] = useState("insumo");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const [insumo, setInsumo] = useState({
    nombre: "",
    tipo: "",
    unidad_medida: "",
    stock_actual: "",
    stock_minimo: "",
  });
  const [proveedor, setProveedor] = useState({
    nombre: "",
    contacto: "",
    direccion: "",
  });
  const [producto, setProducto] = useState({
    nombre: "",
    descripcion: "",
    precio_unitario: "",
  });

  const [compra, setCompra] = useState({
    id_proveedor: "",
    detalles: [{ id_insumo: "", cantidad: "", precio_unitario: "" }],
  });

  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [stockInsumos, setStockInsumos] = useState([]);

  const fetchProveedores = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/proveedores");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setProveedores(data);
      } else {
        setProveedores([]);
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setProveedores([]);
    }
  };

  const fetchInsumos = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/insumos");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setInsumos(data);
      } else {
        setInsumos([]);
      }
    } catch (error) {
      console.error("Error al cargar insumos:", error);
      setInsumos([]);
    }
  };

  const handleChange = (e, tipo, index = null) => {
    const { name, value } = e.target;
    if (tipo === "insumo") setInsumo((prev) => ({ ...prev, [name]: value }));
    else if (tipo === "proveedor")
      setProveedor((prev) => ({ ...prev, [name]: value }));
    else if (tipo === "producto")
      setProducto((prev) => ({ ...prev, [name]: value }));
    else if (tipo === "compra") {
      if (name === "id_proveedor")
        setCompra((prev) => ({ ...prev, id_proveedor: value }));
      else {
        const nuevosDetalles = [...compra.detalles];
        nuevosDetalles[index][name] = value;
        setCompra({ ...compra, detalles: nuevosDetalles });
      }
    }
  };

  const agregarDetalle = () => {
    setCompra((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        { id_insumo: "", cantidad: "", precio_unitario: "" },
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    let endpoint = "";
    let payload = {};

    switch (formularioActivo) {
      case "insumo":
        endpoint = "/api/insertar-insumo";
        payload = {
          ...insumo,
          stock_actual: parseInt(insumo.stock_actual),
          stock_minimo: parseInt(insumo.stock_minimo),
        };
        break;
      case "proveedor":
        endpoint = "/api/insertar-proveedor";
        payload = proveedor;
        break;
      case "producto":
        endpoint = "/api/insertar-producto";
        payload = {
          ...producto,
          precio_unitario: parseFloat(producto.precio_unitario),
        };
        break;
      case "compra":
        endpoint = "/api/registrar-compra";
        payload = {
          id_proveedor: parseInt(compra.id_proveedor),
          detalles: compra.detalles.map((d) => ({
            id_insumo: parseInt(d.id_insumo),
            cantidad: parseInt(d.cantidad),
            precio_unitario: parseFloat(d.precio_unitario),
          })),
        };
        break;
      default:
        return;
    }

    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (formularioActivo !== "verStock") {
          setMensaje(data.mensaje || "✅ Registro exitoso");
        }
        if (formularioActivo === "compra") {
          setCompra({
            id_proveedor: "",
            detalles: [{ id_insumo: "", cantidad: "", precio_unitario: "" }],
          });
        }
        await fetchProveedores();
        await fetchInsumos();
      } else {
        setMensaje(
          `❌ Error: ${data.error || "No se pudo insertar el registro."}`
        );
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error del servidor.");
    } finally {
      setLoading(false);
    }
  };

  const obtenerStock = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/obtener-stock");
      const data = await res.json();
      if (res.ok) {
        setStockInsumos(data.insumos || []);
      } else {
        setMensaje(`❌ Error al obtener el stock: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error del servidor al obtener stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMensaje(""); // Limpiar mensaje al cambiar de sección

    if (formularioActivo === "verStock") obtenerStock();
    if (formularioActivo === "compra") {
      fetchProveedores();
      fetchInsumos();
    }
  }, [formularioActivo]);

  const renderFormulario = () => {
    if (formularioActivo === "insumo") {
      return (
        <>
          <input
            name="nombre"
            placeholder="Nombre del insumo"
            value={insumo.nombre}
            onChange={(e) => handleChange(e, "insumo")}
          />
          <input
            name="tipo"
            placeholder="Tipo"
            value={insumo.tipo}
            onChange={(e) => handleChange(e, "insumo")}
          />
          <input
            name="unidad_medida"
            placeholder="Unidad"
            value={insumo.unidad_medida}
            onChange={(e) => handleChange(e, "insumo")}
          />
          <input
            name="stock_actual"
            type="number"
            placeholder="Stock actual"
            value={insumo.stock_actual}
            onChange={(e) => handleChange(e, "insumo")}
          />
          <input
            name="stock_minimo"
            type="number"
            placeholder="Stock mínimo"
            value={insumo.stock_minimo}
            onChange={(e) => handleChange(e, "insumo")}
          />
        </>
      );
    }

    if (formularioActivo === "proveedor") {
      return (
        <>
          <input
            name="nombre"
            placeholder="Nombre"
            value={proveedor.nombre}
            onChange={(e) => handleChange(e, "proveedor")}
          />
          <input
            name="contacto"
            placeholder="Contacto"
            value={proveedor.contacto}
            onChange={(e) => handleChange(e, "proveedor")}
          />
          <input
            name="direccion"
            placeholder="Dirección"
            value={proveedor.direccion}
            onChange={(e) => handleChange(e, "proveedor")}
          />
        </>
      );
    }

    if (formularioActivo === "producto") {
      return (
        <>
          <input
            name="nombre"
            placeholder="Nombre"
            value={producto.nombre}
            onChange={(e) => handleChange(e, "producto")}
          />
          <input
            name="descripcion"
            placeholder="Descripción"
            value={producto.descripcion}
            onChange={(e) => handleChange(e, "producto")}
          />
          <input
            name="precio_unitario"
            type="number"
            step="0.01"
            placeholder="Precio unitario"
            value={producto.precio_unitario}
            onChange={(e) => handleChange(e, "producto")}
          />
        </>
      );
    }

    if (formularioActivo === "compra") {
      return (
        <>
          <select
            name="id_proveedor"
            value={compra.id_proveedor}
            onChange={(e) => handleChange(e, "compra")}
          >
            <option value="">Seleccionar proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id_proveedor} value={p.id_proveedor}>
                {p.nombre}
              </option>
            ))}
          </select>

          {compra.detalles.map((detalle, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <select
                name="id_insumo"
                value={detalle.id_insumo}
                onChange={(e) => handleChange(e, "compra", idx)}
              >
                <option value="">Seleccionar insumo</option>
                {insumos.map((i) => (
                  <option key={i.id_insumo} value={i.id_insumo}>
                    {i.nombre}
                  </option>
                ))}
              </select>
              <input
                name="cantidad"
                type="number"
                placeholder="Cantidad"
                value={detalle.cantidad}
                onChange={(e) => handleChange(e, "compra", idx)}
              />
              <input
                name="precio_unitario"
                type="number"
                step="0.01"
                placeholder="Precio Unitario"
                value={detalle.precio_unitario}
                onChange={(e) => handleChange(e, "compra", idx)}
              />
            </div>
          ))}
          <button type="button" onClick={agregarDetalle}>
            ➕ Agregar Detalle
          </button>
        </>
      );
    }

    if (formularioActivo === "verStock") {
      return (
        <>
          <table className="tabla-stock">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {stockInsumos.map((insumo) => (
                <tr key={insumo.id_insumo}>
                  <td>{insumo.id_insumo}</td>
                  <td>{insumo.nombre}</td>
                  <td>{insumo.tipo}</td>
                  <td>{insumo.unidad_medida}</td>
                  <td>{insumo.stock_actual}</td>
                  <td>{insumo.stock_minimo}</td>
                  <td
                    style={{
                      color:
                        insumo.stock_actual < insumo.stock_minimo
                          ? "red"
                          : "green",
                    }}
                  >
                    {insumo.stock_actual < insumo.stock_minimo ? "Bajo" : "OK"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
  };

  return (
    <div className="formulario-layout">
      <div className="sidebar">
        <button onClick={() => setFormularioActivo("insumo")}>🧵 Insumo</button>
        <button onClick={() => setFormularioActivo("proveedor")}>
          🚚 Proveedor
        </button>
        <button onClick={() => setFormularioActivo("producto")}>
          👕 Producto
        </button>
        <button onClick={() => setFormularioActivo("compra")}>
          🛒 Registrar Compra
        </button>
        <button onClick={() => setFormularioActivo("verStock")}>
          📦 Ver Stock
        </button>
      </div>

      <div className="formulario-container">
        <h2>
          {
            {
              insumo: "Insertar Insumo",
              proveedor: "Insertar Proveedor",
              producto: "Insertar Producto",
              compra: "Registrar Compra",
              verStock: "📦 Stock de Insumos",
            }[formularioActivo]
          }
        </h2>

        {formularioActivo !== "verStock" ? (
          <form onSubmit={handleSubmit}>
            {renderFormulario()}
            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </form>
        ) : (
          renderFormulario()
        )}

        {mensaje && formularioActivo !== "verStock" && (
          <p className="mensaje">{mensaje}</p>
        )}
      </div>
    </div>
  );
}

export default InsertarFormulario;
