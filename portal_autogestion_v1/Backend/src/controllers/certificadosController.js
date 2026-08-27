const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { pool } = require("../config/db");

const TIPO_CARTA_A_ID = { todos: 1, sin_basico: 2, con_extras: 3 };

const CARPETA_CERTIFICADOS = path.join(__dirname, "..", "..", "certificados");
if (!fs.existsSync(CARPETA_CERTIFICADOS)) {
  fs.mkdirSync(CARPETA_CERTIFICADOS, { recursive: true });
}

const RUTA_LOGO = path.join(__dirname, "..", "..", "assets", "acegrasco.JPG");
const AZUL = "#0F2F80";
const DORADO = "#EF9F27";
const GRIS_TEXTO = "#333333";
const GRIS_CLARO = "#777777";

const MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function formatearFechaLarga(fecha) {
  const d = new Date(fecha);
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}
function formatearFechaCorta(fecha) {
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}
function formatearMoneda(valor) {
  return `$ ${Number(valor).toLocaleString("es-CO")}`;
}

async function listarOConsultar(req, res) {
  try {
    const { idEmpleado } = req.query;
    if (idEmpleado) {
      const [rows] = await pool.query(
        "SELECT * FROM certificados WHERE id_empleado = ? ORDER BY fecha_generacion DESC",
        [idEmpleado]
      );
      return res.status(200).json(rows);
    }
    const [rows] = await pool.query("SELECT * FROM certificados ORDER BY fecha_generacion DESC");
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error en GET /api/certificados:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

async function generar(req, res) {
  try {
    const { idUsuario, tipoCarta, canal } = req.body;
    if (!idUsuario || !tipoCarta || !canal) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios: idUsuario, tipoCarta, canal" });
    }
    const idTipo = TIPO_CARTA_A_ID[tipoCarta];
    if (!idTipo) {
      return res.status(400).json({ mensaje: "tipoCarta invalido. Use: todos, sin_basico o con_extras" });
    }

    const [empleados] = await pool.query(
      `SELECT e.*, u.nombre, u.correo
       FROM empleados e
       JOIN usuarios u ON u.id_usuario = e.id_usuario
       WHERE e.id_usuario = ?`,
      [idUsuario]
    );
    if (empleados.length === 0) {
      return res.status(404).json({ mensaje: "No se encontro un perfil de empleado para este usuario" });
    }
    const empleado = empleados[0];

    const [maxRows] = await pool.query("SELECT MAX(consecutivo) AS maxConsecutivo FROM certificados");
    const siguienteConsecutivo = (maxRows[0].maxConsecutivo || 0) + 1;
    const consecutivoFormateado = String(siguienteConsecutivo).padStart(4, "0");
    const incluyeSueldo = tipoCarta === "todos" ? 1 : 0;
    const nombreArchivo = `CERT-${consecutivoFormateado}-${Date.now()}.pdf`;

    await pool.query(
      `INSERT INTO certificados (id_empleado, id_tipo, consecutivo, incluye_sueldo, canal_entrega, archivo_pdf)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [empleado.id_empleado, idTipo, siguienteConsecutivo, incluyeSueldo, canal, nombreArchivo]
    );

    const rutaArchivo = path.join(CARPETA_CERTIFICADOS, nombreArchivo);
    await generarPdfCertificado(rutaArchivo, { consecutivo: consecutivoFormateado, empleado, tipoCarta });

    if (canal === "correo") {
      return res.status(200).json({
        mensaje: `Certificado N. ${consecutivoFormateado} enviado al correo: ${empleado.correo}`,
        consecutivo: siguienteConsecutivo,
      });
    }

    return res.download(rutaArchivo, nombreArchivo);
  } catch (error) {
    console.error("Error en POST /api/certificados:", error.message);
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

function generarPdfCertificado(rutaArchivo, { consecutivo, empleado, tipoCarta }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "LETTER" });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    const anchoPagina = doc.page.width;
    const margenLateral = 55;
    const anchoContenido = anchoPagina - margenLateral * 2;

    const altoEncabezado = 110;
    doc.rect(0, 0, anchoPagina, altoEncabezado).fill(AZUL);

    if (fs.existsSync(RUTA_LOGO)) {
      doc.roundedRect(margenLateral, 20, 90, 70, 6).fill("#FFFFFF");
      doc.image(RUTA_LOGO, margenLateral + 6, 26, { fit: [78, 58], align: "center", valign: "center" });
    }

    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(18)
      .text("ACEGRASCO S.A.", margenLateral + 105, 30, { width: anchoContenido - 105 });
    doc.font("Helvetica").fontSize(10).fillColor("#D8E1FA")
      .text("Portal de Autogestión — Recursos Humanos", margenLateral + 105, 54, { width: anchoContenido - 105 });
    doc.fontSize(8.5).fillColor("#A9BCEC")
      .text("Calle 15 #5-23, Bogotá | (+57) 301 2952356 | info@acegrasco.com.co", margenLateral + 105, 70, { width: anchoContenido - 105 });

    doc.rect(0, altoEncabezado, anchoPagina, 5).fill(DORADO);

    doc.fillColor(GRIS_TEXTO);
    let y = altoEncabezado + 35;
    doc.font("Helvetica-Bold").fontSize(15).fillColor(AZUL)
      .text("CERTIFICACIÓN LABORAL", margenLateral, y, { align: "center", width: anchoContenido });
    y += 24;

    const subtitulos = { todos: null, sin_basico: "(sin salario básico)", con_extras: "(con horas extras)" };
    if (subtitulos[tipoCarta]) {
      doc.font("Helvetica-Oblique").fontSize(10).fillColor(GRIS_CLARO)
        .text(subtitulos[tipoCarta], margenLateral, y, { align: "center", width: anchoContenido });
      y += 16;
    }

    doc.font("Helvetica").fontSize(10).fillColor(GRIS_TEXTO)
      .text(`Consecutivo N.° ${consecutivo}`, margenLateral, y, { align: "center", width: anchoContenido });
    y += 14;
    doc.text(`Bogotá D.C., ${formatearFechaLarga(new Date())}`, margenLateral, y, { align: "center", width: anchoContenido });
    y += 34;

    doc.x = margenLateral;
    doc.y = y;

    doc.font("Helvetica-Bold").fontSize(11).fillColor(AZUL).text("A quien pueda interesar:", { width: anchoContenido });
    doc.moveDown(0.6);
    doc.font("Helvetica").fontSize(10.5).fillColor(GRIS_TEXTO).text(
      "La empresa ACEGRASCO S.A. certifica que el/la señor(a):",
      { align: "justify", width: anchoContenido }
    );
    doc.moveDown(0.8);

    const inicioRecuadro = doc.y;
    const campos = [
      ["Nombre completo", empleado.nombre],
      ["Cédula de ciudadanía", empleado.cedula],
      ["Cargo", empleado.cargo],
      ["Área / Departamento", empleado.area],
      ["Fecha de ingreso", formatearFechaCorta(empleado.fecha_ingreso)],
    ];
    if (tipoCarta === "todos") campos.push(["Salario básico mensual", formatearMoneda(empleado.salario)]);
    if (tipoCarta === "con_extras") campos.push(["Promedio de horas extras (últimos 3 meses)", `${empleado.promedio_horas_extras} horas`]);

    const altoFila = 20;
    const altoRecuadro = campos.length * altoFila + 16;
    doc.roundedRect(margenLateral, inicioRecuadro, anchoContenido, altoRecuadro, 5)
      .fillAndStroke("#F5F7FC", "#DCE3F5");

    let yCampo = inicioRecuadro + 10;
    campos.forEach(([etiqueta, valor]) => {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(AZUL)
        .text(`${etiqueta}:`, margenLateral + 14, yCampo, { continued: false, width: 220 });
      doc.font("Helvetica").fontSize(10).fillColor(GRIS_TEXTO)
        .text(valor, margenLateral + 240, yCampo, { width: anchoContenido - 254 });
      yCampo += altoFila;
    });

    doc.x = margenLateral;
    doc.y = inicioRecuadro + altoRecuadro + 18;

    const clausulaSalario = tipoCarta === "todos" ? ", devengando el salario básico mensual indicado" : "";

    doc.font("Helvetica").fontSize(10.5).fillColor(GRIS_TEXTO).text(
      `Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa${clausulaSalario} ` +
      "con todos los beneficios de ley del Código Sustantivo del Trabajo de Colombia.",
      { align: "justify", width: anchoContenido }
    );
    doc.moveDown(0.6);
    doc.text("La presente certificación se expide con veracidad y es válida a la fecha indicada.", { align: "justify", width: anchoContenido });

    doc.moveDown(3);
    doc.fillColor(GRIS_TEXTO).text("______________________________", { width: anchoContenido });
    doc.font("Helvetica-Bold").fillColor(AZUL).text("Recursos Humanos — Acegrasco S.A.", { width: anchoContenido });
    doc.font("Helvetica").fontSize(9).fillColor(GRIS_CLARO).text("Firma autorizada / Sello empresa", { width: anchoContenido });

    const altoPie = 34;
    doc.rect(0, doc.page.height - altoPie, anchoPagina, altoPie).fill(AZUL);
    doc.fontSize(8).fillColor("#D8E1FA").text(
      `Portal de Autogestión Acegrasco © ${new Date().getFullYear()} | Documento generado electrónicamente | Consecutivo N.° ${consecutivo}`,
      margenLateral, doc.page.height - altoPie + 12, { align: "center", width: anchoContenido }
    );

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

module.exports = { listarOConsultar, generar };
