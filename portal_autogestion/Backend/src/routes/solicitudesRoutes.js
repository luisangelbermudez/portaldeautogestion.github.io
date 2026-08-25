const express = require("express");
const router = express.Router();
const solicitudesController = require("../controllers/solicitudesController");

router.get("/", solicitudesController.listarOConsultar);
router.post("/", solicitudesController.crear);
router.put("/", solicitudesController.actualizar);
router.delete("/", solicitudesController.eliminar);

module.exports = router;
