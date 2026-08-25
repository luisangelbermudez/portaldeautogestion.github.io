const { pool } = require("../config/db");

async function listarOConsultar(req, res) {
  try {
    const { id } = req.query;
    if (id) {
      const [rows] = await pool.query(
        "SELECT id_usuario, nombre, correo, id_rol, id_estado FROM usuarios WHERE id_usuario = ?",
        [id]
      );
      if (rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
      return res.status(200).json(rows[0]);
    }
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, correo, id_rol, id_estado FROM usuarios ORDER BY id_usuario"
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error en GET /api/usuarios:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function crear(req, res) {
  try {
    const { nombre, correo, contrasena, idRol, idEstado } = req.body;
    if (!nombre || !correo || !contrasena || !idRol) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios: nombre, correo, contrasena, idRol" });
    }
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, correo, contrasena, id_rol, id_estado) VALUES (?, ?, ?, ?, ?)",
      [nombre, correo, contrasena, idRol, idEstado || 1]
    );
    return res.status(201).json({ mensaje: "Usuario creado correctamente", idUsuario: result.insertId });
  } catch (error) {
    console.error("Error en POST /api/usuarios:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const { idUsuario, nombre, correo, idRol, idEstado, contrasena } = req.body;
    if (!idUsuario) return res.status(400).json({ mensaje: "El campo idUsuario es obligatorio" });

    const [existe] = await pool.query("SELECT id_usuario FROM usuarios WHERE id_usuario = ?", [idUsuario]);
    if (existe.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (contrasena) {
      await pool.query(
        "UPDATE usuarios SET nombre = ?, correo = ?, id_rol = ?, id_estado = ?, contrasena = ? WHERE id_usuario = ?",
        [nombre, correo, idRol, idEstado, contrasena, idUsuario]
      );
    } else {
      await pool.query(
        "UPDATE usuarios SET nombre = ?, correo = ?, id_rol = ?, id_estado = ? WHERE id_usuario = ?",
        [nombre, correo, idRol, idEstado, idUsuario]
      );
    }
    return res.status(200).json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error en PUT /api/usuarios:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ mensaje: "El parametro id es obligatorio" });
    await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    return res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error en DELETE /api/usuarios:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

module.exports = { listarOConsultar, crear, actualizar, eliminar };
