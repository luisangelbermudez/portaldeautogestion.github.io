const { pool } = require("../config/db");

async function listarOConsultar(req, res) {
  try {
    const { id, empleado } = req.query;
    if (id) {
      const [rows] = await pool.query("SELECT * FROM solicitudes WHERE id_solicitud = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ mensaje: "Solicitud no encontrada" });
      return res.status(200).json(rows[0]);
    }
    if (empleado) {
      const [rows] = await pool.query(
        "SELECT * FROM solicitudes WHERE id_empleado = ? ORDER BY fecha_creacion DESC",
        [empleado]
      );
      return res.status(200).json(rows);
    }
    const [rows] = await pool.query("SELECT * FROM solicitudes ORDER BY fecha_creacion DESC");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error en GET /api/solicitudes:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function crear(req, res) {
  try {
    const { idEmpleado, tipoSolicitud, descripcion } = req.body;
    if (!idEmpleado || !tipoSolicitud) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios: idEmpleado, tipoSolicitud" });
    }
    const ID_ESTADO_PENDIENTE = 3;
    const [result] = await pool.query(
      "INSERT INTO solicitudes (id_empleado, id_estado, tipo_solicitud, descripcion) VALUES (?, ?, ?, ?)",
      [idEmpleado, ID_ESTADO_PENDIENTE, tipoSolicitud, descripcion || null]
    );
    return res.status(201).json({
      mensaje: "Solicitud enviada correctamente. Estado: Pendiente",
      idSolicitud: result.insertId,
    });
  } catch (error) {
    console.error("Error en POST /api/solicitudes:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const { idSolicitud, idEstado } = req.body;
    if (!idSolicitud || !idEstado) {
      return res.status(400).json({ mensaje: "Los campos idSolicitud e idEstado son obligatorios" });
    }
    await pool.query("UPDATE solicitudes SET id_estado = ? WHERE id_solicitud = ?", [idEstado, idSolicitud]);
    return res.status(200).json({ mensaje: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("Error en PUT /api/solicitudes:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ mensaje: "El parametro id es obligatorio" });
    await pool.query("DELETE FROM solicitudes WHERE id_solicitud = ?", [id]);
    return res.status(200).json({ mensaje: "Solicitud eliminada correctamente" });
  } catch (error) {
    console.error("Error en DELETE /api/solicitudes:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

module.exports = { listarOConsultar, crear, actualizar, eliminar };
