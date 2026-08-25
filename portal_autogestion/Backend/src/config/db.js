// src/config/db.js
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portal_acegrasco",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function verificarConexion() {
  try {
    const conn = await pool.getConnection();
    console.log("Conexion a MySQL (portal_acegrasco) establecida correctamente.");
    conn.release();
  } catch (error) {
    console.error("Error al conectar con la base de datos MySQL:", error.message);
  }
}

module.exports = { pool, verificarConexion };
