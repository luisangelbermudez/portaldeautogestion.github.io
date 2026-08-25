const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

router.get("/", usuariosController.listarOConsultar);
router.post("/", usuariosController.crear);
router.put("/", usuariosController.actualizar);
router.delete("/", usuariosController.eliminar);

module.exports = router;
