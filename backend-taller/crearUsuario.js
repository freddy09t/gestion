const bcrypt = require("bcrypt");
const sql = require("mssql");

const dbConfig = {
  server: "localhost",
  database: "ConfeccionDB",
  options: {
    trustServerCertificate: true,
    trustedConnection: true
  }
};

async function crearUsuario(nombre, correo, contrasenaPlano, rol = "empleado") {
  try {
    const hash = await bcrypt.hash(contrasenaPlano, 10);
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("nombre", sql.NVarChar, nombre)
      .input("correo", sql.NVarChar, correo)
      .input("contrasena_hash", sql.NVarChar, hash)
      .input("rol", sql.NVarChar, rol)
      .query(`
        INSERT INTO Usuarios (nombre, correo, contrasena_hash, rol)
        VALUES (@nombre, @correo, @contrasena_hash, @rol)
      `);

    console.log("✅ Usuario creado exitosamente.");
    process.exit();
  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    process.exit(1);
  }
}

// Llama a la función con los datos del usuario
crearUsuario("Administrador", "admin@taller.com", "admin123", "admin");
