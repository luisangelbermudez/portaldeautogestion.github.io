const { pool } = require("../config/db");

// POST /api/login
// body: { correo, contrasena }
async function login(req, res) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: "Correo y contrasena son obligatorios" });
    }

    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, u.id_rol, r.nombre_rol, u.id_estado
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.correo = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    const usuario = rows[0];

    // Nota: el proyecto formativo compara la contrasena en texto plano,
    // igual que en la version anterior en Java. En un entorno productivo
    // se debe usar un hash (bcrypt) y comparar con bcrypt.compare().
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    if (usuario.id_estado !== 1) {
      return res.status(403).json({ mensaje: "El usuario se encuentra inactivo" });
    }

    return res.status(200).json({
      mensaje: "Inicio de sesion exitoso",
      usuario: {
        idUsuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        idRol: usuario.id_rol,
        rolNombre: usuario.nombre_rol,
      },
    });
  } catch (error) {
    console.error("Error en POST /api/login:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

module.exports = { login };
