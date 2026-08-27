const { pool } = require("../config/db");

async function listarOConsultar(req, res) {
  try {
    const { id } = req.query;
    if (id) {
      const [rows] = await pool.query("SELECT * FROM empleados WHERE id_empleado = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ mensaje: "Empleado no encontrado" });
      return res.status(200).json(rows[0]);
    }
    const [rows] = await pool.query("SELECT * FROM empleados ORDER BY id_empleado");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error en GET /api/empleados:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function crear(req, res) {
  try {
    const { idUsuario, cedula, cargo, area, fechaIngreso, salario, promedioHorasExtras } = req.body;
    if (!idUsuario || !cedula || !cargo || !area || !fechaIngreso) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios: idUsuario, cedula, cargo, area, fechaIngreso" });
    }
    const [result] = await pool.query(
      `INSERT INTO empleados (id_usuario, cedula, cargo, area, fecha_ingreso, salario, promedio_horas_extras)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idUsuario, cedula, cargo, area, fechaIngreso, salario || 0, promedioHorasExtras || 0]
    );
    return res.status(201).json({ mensaje: "Empleado registrado correctamente", idEmpleado: result.insertId });
  } catch (error) {
    console.error("Error en POST /api/empleados:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const { idEmpleado, cedula, cargo, area, fechaIngreso, salario, promedioHorasExtras } = req.body;
    if (!idEmpleado) return res.status(400).json({ mensaje: "El campo idEmpleado es obligatorio" });

    const [existe] = await pool.query("SELECT id_empleado FROM empleados WHERE id_empleado = ?", [idEmpleado]);
    if (existe.length === 0) return res.status(404).json({ mensaje: "Empleado no encontrado" });

    await pool.query(
      `UPDATE empleados
       SET cedula = ?, cargo = ?, area = ?, fecha_ingreso = ?, salario = ?, promedio_horas_extras = ?
       WHERE id_empleado = ?`,
      [cedula, cargo, area, fechaIngreso, salario, promedioHorasExtras, idEmpleado]
    );
    return res.status(200).json({ mensaje: "Empleado actualizado correctamente" });
  } catch (error) {
    console.error("Error en PUT /api/empleados:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ mensaje: "El parametro id es obligatorio" });
    await pool.query("DELETE FROM empleados WHERE id_empleado = ?", [id]);
    return res.status(200).json({ mensaje: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error en DELETE /api/empleados:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

module.exports = { listarOConsultar, crear, actualizar, eliminar };
