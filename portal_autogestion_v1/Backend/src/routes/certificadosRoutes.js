const express = require("express");
const router = express.Router();
const certificadosController = require("../controllers/certificadosController");

router.get("/", certificadosController.listarOConsultar);
router.post("/", certificadosController.generar);

module.exports = router;
