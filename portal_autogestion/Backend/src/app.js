const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { verificarConexion } = require("./config/db");

const usuariosRoutes = require("./routes/usuariosRoutes");
const empleadosRoutes = require("./routes/empleadosRoutes");
const solicitudesRoutes = require("./routes/solicitudesRoutes");
const certificadosRoutes = require("./routes/certificadosRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API del Portal de Autogestion de Empleados - Acegrasco S.A. (Express)" });
});

app.use("/api/login", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/certificados", certificadosRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: "Recurso no encontrado" });
});

app.use((err, req, res, next) => {
  console.error("Error no controlado:", err.stack);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
