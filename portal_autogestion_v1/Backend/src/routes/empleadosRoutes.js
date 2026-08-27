const express = require("express");
const router = express.Router();
const empleadosController = require("../controllers/empleadosController");

router.get("/", empleadosController.listarOConsultar);
router.post("/", empleadosController.crear);
router.put("/", empleadosController.actualizar);
router.delete("/", empleadosController.eliminar);

module.exports = router;
