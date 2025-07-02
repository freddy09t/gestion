const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Configuración de conexión SQL Server
const dbConfig = {
  server: "localhost",
  port: 1433,
  database: "TallerConfeccionDB",
  user: "sa",
  password: "12345678",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// ✅ Conexión única
let pool;
sql.connect(dbConfig)
  .then((p) => {
    pool = p;
    console.log("✅ Conexión a la base de datos exitosa");
  })
  .catch((err) => {
    console.error("❌ Error al conectar con la base de datos:", err);
  });

// ✅ Ruta: insertar insumo
app.post("/api/insertar-insumo", async (req, res) => {
  const { nombre, tipo, unidad_medida, stock_actual, stock_minimo } = req.body;

  try {
    await pool.request()
      .input("nombre", sql.NVarChar(100), nombre)
      .input("tipo", sql.NVarChar(50), tipo)
      .input("unidad_medida", sql.NVarChar(20), unidad_medida)
      .input("stock_actual", sql.Int, stock_actual)
      .input("stock_minimo", sql.Int, stock_minimo)
      .execute("InsertarInsumo");

    res.status(200).json({ mensaje: "✅ Insumo insertado correctamente" });
  } catch (error) {
    console.error("❌ Error al insertar insumo:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ✅ Ruta: login (comparación directa, sin hash)
app.post("/api/login", async (req, res) => {
  const { correo, contrasena } = req.body;

  console.log("📥 Datos recibidos login:", { correo, contrasena });

  try {
    const result = await pool.request()
      .input("correo", sql.NVarChar(100), correo)
      .execute("LoginUsuario");

    const usuario = result.recordset[0];

    console.log("📋 Usuario encontrado en DB:", usuario);

    if (!usuario) {
      console.log("❌ Correo no registrado");
      return res.status(401).json({ exito: false, mensaje: "Correo no registrado" });
    }

    console.log("🔐 Contraseña recibida:", contrasena);
    console.log("🔐 Contraseña esperada:", usuario.contrasena);

    // Comparación directa (texto plano)
    if (contrasena === usuario.contrasena) {
      console.log("✅ ¿Contraseña coincide?: true");
      res.status(200).json({
        exito: true,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          rol: usuario.rol
        }
      });
    } else {
      console.log("✅ ¿Contraseña coincide?: false");
      res.status(401).json({ exito: false, mensaje: "Contraseña incorrecta" });
    }

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ exito: false, mensaje: "Error del servidor" });
  }
});

// 🔊 Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
