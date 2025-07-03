const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 Configuración de SQL Server
const dbConfig = {
  server: "localhost",
  port: 1433,
  database: "ConfeccionDB",
  user: "sa",
  password: "12345678",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// 🌐 Conexión global
let pool;

const conectarDB = async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Conexión a la base de datos exitosa");
  } catch (err) {
    console.error("❌ Error al conectar con la base de datos:", err);
  }
};

conectarDB();

// =======================================================
// Insertar Insumo (usa procedimiento almacenado `InsertarInsumo`)
app.post("/api/insertar-insumo", async (req, res) => {
  const { nombre, tipo, unidad_medida, stock_actual, stock_minimo } = req.body;

  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    await pool.request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("tipo", sql.NVarChar(50), tipo)
      .input("unidad_medida", sql.NVarChar(20), unidad_medida)
      .input("stock_actual", sql.Int, stock_actual)
      .input("stock_minimo", sql.Int, stock_minimo)
      .execute("InsertarInsumo");

    res.json({ mensaje: "✅ Insumo insertado correctamente" });
  } catch (error) {
    console.error("❌ Error al insertar insumo:", error);
    res.status(500).json({ error: "Error al insertar insumo" });
  }
});

// =======================================================
// Insertar Producto
app.post("/api/insertar-producto", async (req, res) => {
  const { nombre, descripcion, precio_unitario } = req.body;

  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    await pool.request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("descripcion", sql.NVarChar(255), descripcion)
      .input("precio_unitario", sql.Decimal(10, 2), precio_unitario)
      .query(`
        INSERT INTO Productos (nombre, descripcion, precio_unitario)
        VALUES (@nombre, @descripcion, @precio_unitario)
      `);

    res.json({ mensaje: "✅ Producto insertado correctamente" });
  } catch (error) {
    console.error("❌ Error al insertar producto:", error);
    res.status(500).json({ error: "Error al insertar producto" });
  }
});

// =======================================================
// Insertar Proveedor
app.post("/api/insertar-proveedor", async (req, res) => {
  const { nombre, contacto, direccion } = req.body;

  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    await pool.request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("contacto", sql.NVarChar(100), contacto)
      .input("direccion", sql.NVarChar(200), direccion)
      .query(`
        INSERT INTO Proveedores (nombre, contacto, direccion)
        VALUES (@nombre, @contacto, @direccion)
      `);

    res.json({ mensaje: "✅ Proveedor insertado correctamente" });
  } catch (error) {
    console.error("❌ Error al insertar proveedor:", error);
    res.status(500).json({ error: "Error al insertar proveedor" });
  }
});

// =======================================================
// Registrar Compra con Detalles
app.post("/api/registrar-compra", async (req, res) => {
  const { id_proveedor, detalles } = req.body;

  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    const table = new sql.Table();
    table.columns.add('id_insumo', sql.Int);
    table.columns.add('cantidad', sql.Int);
    table.columns.add('precio_unitario', sql.Decimal(10, 2));

    detalles.forEach((detalle) => {
      table.rows.add(detalle.id_insumo, detalle.cantidad, detalle.precio_unitario);
    });

    await pool.request()
      .input("id_proveedor", sql.Int, id_proveedor)
      .input("DetallesCompra", table)
      .execute("RegistrarCompra");

    res.json({ mensaje: "✅ Compra registrada correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar compra:", error);
    res.status(500).json({ error: "Error al registrar compra" });
  }
});

// =======================================================
// Registrar Venta con Detalles
app.post("/api/registrar-venta", async (req, res) => {
  const { id_usuario, detalles } = req.body;

  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    const table = new sql.Table();
    table.columns.add('id_producto', sql.Int);
    table.columns.add('cantidad', sql.Int);
    table.columns.add('precio_unitario', sql.Decimal(10, 2));

    detalles.forEach((detalle) => {
      table.rows.add(detalle.id_producto, detalle.cantidad, detalle.precio_unitario);
    });

    await pool.request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("DetallesVenta", table)
      .execute("RegistrarVenta");

    res.json({ mensaje: "✅ Venta registrada correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar venta:", error);
    res.status(500).json({ error: "Error al registrar venta" });
  }
});

// =======================================================
// Login de Usuario
app.post("/api/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!pool) return res.status(500).json({ exito: false, mensaje: "Base de datos no conectada" });

  try {
    const result = await pool.request()
      .input("correo", sql.NVarChar(100), correo)
      .execute("LoginUsuario");

    const usuario = result.recordset[0];
    if (!usuario) {
      return res.status(401).json({ exito: false, mensaje: "Correo no registrado" });
    }

    if (contrasena === usuario.contrasena) {
      res.json({ exito: true, usuario: { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol } });
    } else {
      res.status(401).json({ exito: false, mensaje: "Contraseña incorrecta" });
    }
  } catch (error) {
    console.error("❌ Error al loguear usuario:", error);
    res.status(500).json({ exito: false, mensaje: "Error del servidor" });
  }
});

// =======================================================
// ✅ Obtener stock de insumos (respuesta con clave `insumos`)
app.get("/api/obtener-stock", async (req, res) => {
  console.log("📥 Petición recibida: GET /api/obtener-stock");

  if (!pool) {
    console.error("❌ Base de datos no conectada (pool no inicializado)");
    return res.status(500).json({ error: "Base de datos no conectada" });
  }

  try {
    console.log("🔍 Ejecutando consulta SQL para obtener insumos...");

    const result = await pool.request().query(`
      SELECT id_insumo, nombre, tipo, unidad_medida, stock_actual, stock_minimo
      FROM Insumos
    `);

    console.log("✅ Consulta SQL ejecutada correctamente");

    if (!result || !result.recordset) {
      console.warn("⚠️ La respuesta no contiene recordset");
      return res.status(500).json({ error: "Error inesperado en los datos recibidos" });
    }

    if (result.recordset.length === 0) {
      console.warn("⚠️ No hay insumos registrados en la tabla Insumos");
    } else {
      console.log(`📦 Insumos obtenidos: ${result.recordset.length}`);
      console.table(result.recordset);
    }

    // ✅ Envolver la respuesta en un objeto con clave "insumos"
    res.json({ insumos: result.recordset });
  } catch (error) {
    console.error("❌ Error al obtener el stock de insumos:", error);
    res.status(500).json({ error: "Error al obtener el stock" });
  }
});



// =======================================================
// ✅ NUEVAS RUTAS: Obtener todos los proveedores
app.get("/api/proveedores", async (req, res) => {
  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    const result = await pool.request().query(`
      SELECT id_proveedor, nombre, contacto, direccion
      FROM Proveedores
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener proveedores:", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
});

// ✅ Obtener todos los insumos
app.get("/api/insumos", async (req, res) => {
  if (!pool) return res.status(500).json({ error: "Base de datos no conectada" });

  try {
    const result = await pool.request().query(`
      SELECT id_insumo, nombre, tipo, unidad_medida, stock_actual, stock_minimo
      FROM Insumos
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener insumos:", error);
    res.status(500).json({ error: "Error al obtener insumos" });
  }
});

// =======================================================
// Ruta fallback para 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// 🚀 Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

// ... código anterior sin cambios ...

// =======================================================
// ✅ Obtener stock de insumos (con LOGS mejorados)
app.get("/api/obtener-stock", async (req, res) => {
  console.log("📥 Petición recibida: GET /api/obtener-stock");

  if (!pool) {
    console.error("❌ Base de datos no conectada (pool no inicializado)");
    return res.status(500).json({ error: "Base de datos no conectada" });
  }

  try {
    console.log("🔍 Ejecutando consulta SQL para obtener insumos...");

    const result = await pool.request().query(`
      SELECT id_insumo, nombre, tipo, unidad_medida, stock_actual, stock_minimo
      FROM Insumos
    `);

    console.log("✅ Consulta SQL ejecutada correctamente");

    if (!result || !result.recordset) {
      console.warn("⚠️ La respuesta no contiene recordset");
      return res.status(500).json({ error: "Error inesperado en los datos recibidos" });
    }

    if (result.recordset.length === 0) {
      console.warn("⚠️ No hay insumos registrados en la tabla Insumos");
    } else {
      console.log(`📦 Insumos obtenidos: ${result.recordset.length}`);
      console.table(result.recordset); // Muestra en tabla en consola
    }

    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener el stock de insumos:", error);
    res.status(500).json({ error: "Error al obtener el stock" });
  }
});
