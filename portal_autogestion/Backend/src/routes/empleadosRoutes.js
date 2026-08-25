const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const empleadosController = require("../controllers/empleadosController");

// Configuración de multer para guardar temporalmente el Excel subido
const almacenamiento = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "temp"),
  filename: (req, file, cb) => cb(null, `carga_${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage: almacenamiento });

router.get("/", empleadosController.listarOConsultar);
router.post("/", empleadosController.crear);
router.put("/", empleadosController.actualizar);
router.delete("/", empleadosController.eliminar);

// Carga masiva de empleados desde un archivo Excel (.xlsx)
router.post("/carga-masiva", upload.single("archivo"), empleadosController.cargaMasiva);

module.exports = router;
