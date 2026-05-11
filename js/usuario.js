/* ============================================================
   SCRIPT.JS — Portal de Autogestión Acegrasco
   Cubre: usuario.html · admin.html · gestiondesolicitudes.html
   ============================================================ */
 
 
/* ============================================================
   SECCIÓN: CERTIFICADOS — usuario.html
   ============================================================ */
 
// Textos descriptivos por tipo de certificado
var CERT_DESC = {
  todos:      "Incluye: nombre, cédula, cargo, área, fecha de ingreso y <strong>salario básico mensual</strong>. Documento completo para trámites financieros o bancarios.",
  sin_basico: "Incluye: nombre, cédula, cargo, área y fecha de ingreso. <strong>No menciona el valor del salario</strong>. Ideal para trámites donde no se requiere revelar ingresos.",
  con_extras: "Incluye todos los datos más el <strong>promedio de horas extras</strong> de los últimos 3 meses. Útil para solicitudes de crédito que requieren ingresos totales."
};
 
/**
 * Muestra la descripción del tipo de certificado seleccionado.
 * Se llama desde onchange del <select id="tipoCarta">.
 */
function mostrarDescCert() {
  var tipo  = document.getElementById("tipoCarta").value;
  var desc  = document.getElementById("certDesc");
  var res   = document.getElementById("resultadoCertificado");
 
  if (!desc) return;
 
  if (tipo && CERT_DESC[tipo]) {
    desc.innerHTML = "📋 " + CERT_DESC[tipo];
    desc.style.display = "block";
  } else {
    desc.style.display = "none";
  }
 
  // Limpiar resultado anterior al cambiar tipo
  if (res) res.innerHTML = "";
}
 
/**
 * Genera el PDF del certificado y muestra los botones de descarga/correo.
 * Llamado desde el botón "Generar y descargar certificado".
 */
function generarCertificado() {
  var select    = document.getElementById("tipoCarta");
  var resultado = document.getElementById("resultadoCertificado");
 
  if (!select || !resultado) return;
 
  var tipo = select.value;
 
  if (!tipo) {
    resultado.innerHTML = "<div class='res-warn'>⚠️ Por favor seleccione un tipo de certificado antes de continuar.</div>";
    return;
  }
 
  // Obtener datos del empleado activo (desde localStorage o perfil visible)
  var emp = obtenerDatosEmpleado();
 
  // Crear PDF
  var pdfBlob = crearPDF(tipo, emp);
  var url     = URL.createObjectURL(pdfBlob);
  var nombre  = emp.nombre.replace(/\s+/g, "_");
 
  var etiquetas = {
    todos:      "Certificación Laboral Completa",
    sin_basico: "Certificación Laboral sin Salario Básico",
    con_extras: "Carta Laboral con Promedio Extras"
  };
 
  resultado.innerHTML =
    "<div class='res-ok'>✅ <strong>" + etiquetas[tipo] + "</strong> generada para <strong>" + emp.nombre + "</strong>.</div>" +
    "<button class='btn-descarga' onclick=\"descargarPDF('" + url + "','" + nombre + "')\">⬇ Descargar certificado PDF</button>" +
    "<button class='btn-correo'   onclick=\"enviarCorreo('" + emp.email + "')\">📧 Enviar al correo registrado</button>";
}
 
/**
 * Retorna los datos del empleado activo guardados en localStorage,
 * o datos genéricos tomados del DOM si no hay registro previo.
 */
function obtenerDatosEmpleado() {
  var guardado = localStorage.getItem("empleadoActivo");
  if (guardado) {
    try { return JSON.parse(guardado); } catch(e) {}
  }
  // Fallback: leer lo que esté visible en el perfil
  return {
    nombre:  document.getElementById("nombreEmpleado")  ? document.getElementById("nombreEmpleado").textContent  : "Empleado",
    cedula:  document.getElementById("cedulaEmpleado")   ? document.getElementById("cedulaEmpleado").textContent.replace("🪪 Cédula: ","")  : "—",
    cargo:   document.getElementById("cargoEmpleado")    ? document.getElementById("cargoEmpleado").textContent.replace("📌 Cargo: ","")    : "—",
    area:    "—",
    salario: "—",
    ingreso: "—",
    email:   "—"
  };
}
 
/**
 * Dispara la descarga del Blob PDF ya generado.
 */
function descargarPDF(url, nombreArchivo) {
  var a = document.createElement("a");
  a.href     = url;
  a.download = "certificado_" + nombreArchivo + ".pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
 
/**
 * Simula el envío por correo.
 */
function enviarCorreo(correo) {
  var dest = correo && correo !== "—" ? correo : "el correo registrado del empleado";
  alert("📧 El certificado ha sido enviado a: " + dest);
}
 
/**
 * Construye el PDF con jsPDF y retorna un Blob.
 * Paleta corporativa Acegrasco: azul #0f3460 y dorado #f1c40f.
 */
function crearPDF(tipo, emp) {
  var jsPDF  = window.jspdf.jsPDF;
  var doc    = new jsPDF({ unit: "mm", format: "a4" });
  var hoy    = new Date().toLocaleDateString("es-CO", { year:"numeric", month:"long", day:"numeric" });
 
  var titulos = {
    todos:      "CERTIFICACIÓN LABORAL",
    sin_basico: "CERTIFICACIÓN LABORAL (SIN SALARIO BÁSICO)",
    con_extras: "CARTA LABORAL CON PROMEDIO DE HORAS EXTRAS"
  };
 
  // ─── Cabecera ───
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 0, 210, 36, "F");
 
  doc.setTextColor(241, 196, 15);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text("ACEGRASCO S.A.", 105, 14, { align: "center" });
 
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Portal de Autogestión — Recursos Humanos", 105, 22, { align: "center" });
 
  doc.setFontSize(8.5);
  doc.text("Calle 15 #5-23, Bogotá  |  (+57) 301 2952356  |  info@acegrasco.com.co", 105, 29, { align: "center" });
 
  // ─── Título del certificado ───
  doc.setTextColor(15, 52, 96);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(titulos[tipo], 105, 47, { align: "center" });
 
  doc.setDrawColor(241, 196, 15);
  doc.setLineWidth(0.8);
  doc.line(20, 51, 190, 51);
 
  // ─── Cuerpo ───
  var y  = 61;
  var X  = 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
 
  doc.text("Bogotá D.C., " + hoy, X, y);          y += 9;
  doc.text("A quien pueda interesar:", X, y);       y += 9;
  doc.text("La empresa ACEGRASCO S.A. certifica que el/la señor(a):", X, y); y += 9;
 
  // Tabla de datos del empleado
  var filas = [
    ["Nombre completo",      emp.nombre],
    ["Cédula de ciudadanía", emp.cedula],
    ["Cargo",                emp.cargo],
    ["Área / Departamento",  emp.area],
    ["Fecha de ingreso",     emp.ingreso]
  ];
 
  if (tipo === "todos") {
    var salNum = Number(String(emp.salario).replace(/\D/g, ""));
    filas.push(["Salario básico mensual", "$ " + (salNum ? salNum.toLocaleString("es-CO") : emp.salario)]);
  }
  if (tipo === "con_extras") {
    filas.push(["Promedio horas extras (últ. 3 meses)", "Incluido en certificación"]);
  }
 
  filas.forEach(function(fila) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 52, 96);
    doc.text(fila[0] + ":", X + 4, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(String(fila[1]), X + 72, y);
    y += 8;
  });
 
  y += 4;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(X, y, 190, y);
  y += 8;
 
  // Párrafo legal según tipo
  var parrafo = tipo === "sin_basico"
    ? "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, desempeñando las funciones propias de su cargo con contrato a término indefinido. Esta certificación se expide a solicitud del interesado sin mencionar el salario."
    : tipo === "con_extras"
    ? "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, devengando el salario indicado más un promedio de horas extras de los últimos tres (3) meses, conforme al Código Sustantivo del Trabajo de Colombia."
    : "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, devengando el salario básico mensual indicado con todos los beneficios de ley establecidos en el Código Sustantivo del Trabajo de Colombia.";
 
  var lineas = doc.splitTextToSize(parrafo, 170);
  doc.setFontSize(9.5);
  doc.text(lineas, X, y);
  y += lineas.length * 5.5 + 10;
 
  doc.text("La presente certificación se expide con veracidad y es válida a la fecha indicada.", X, y);
  y += 16;
 
  // Firma
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 52, 96);
  doc.text("______________________________", X, y);       y += 6;
  doc.text("Recursos Humanos — Acegrasco S.A.", X, y);    y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Firma autorizada / Sello empresa", X, y);
 
  // Pie de página
  doc.setFillColor(15, 52, 96);
  doc.rect(0, 282, 210, 15, "F");
  doc.setTextColor(241, 196, 15);
  doc.setFontSize(8);
  doc.text("Portal de Autogestión Acegrasco © 2026  |  Documento generado electrónicamente", 105, 290, { align: "center" });
 
  return doc.output("blob");
}
 
 
/* ============================================================
   SECCIÓN: SOLICITUDES — usuario.html → gestiondesolicitudes.html
   ============================================================ */
 
/**
 * Guarda la solicitud en localStorage y muestra confirmación visual (toast).
 * Los datos quedan disponibles para gestiondesolicitudes.html.
 */
function guardarSolicitud(event) {
  event.preventDefault();
 
  var nombre  = document.getElementById("nombre").value.trim();
  var email   = document.getElementById("email").value.trim();
  var mensaje = document.getElementById("mensaje").value.trim();
  var fecha   = new Date().toLocaleString("es-CO");
 
  if (!nombre || !email || !mensaje) return;
 
  var solicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
  solicitudes.push({
    nombre:  nombre,
    email:   email,
    mensaje: mensaje,
    fecha:   fecha,
    estado:  "Pendiente"
  });
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
 
  // Resetear formulario
  document.getElementById("formSolicitud").reset();
 
  // Actualizar contadores del dashboard
  actualizarDashboard();
 
  // Mostrar toast de confirmación
  mostrarToast();
}
 
/**
 * Muestra el toast verde de confirmación durante 3 segundos.
 */
function mostrarToast() {
  var toast = document.getElementById("toast-ok");
  if (!toast) return;
  toast.style.display = "block";
  setTimeout(function() { toast.style.display = "none"; }, 3000);
}
 
 
/* ============================================================
   SECCIÓN: GESTIÓN DE SOLICITUDES — gestiondesolicitudes.html
   ============================================================ */
 
/**
 * Renderiza la tabla de solicitudes en gestiondesolicitudes.html.
 * Lee desde localStorage y pinta todas las filas.
 */
function renderizarTablaSolicitudes() {
  var tbody = document.getElementById("tablaSolicitudes");
  if (!tbody) return;
 
  var solicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
 
  if (solicitudes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:20px;">No hay solicitudes registradas aún.</td></tr>';
    return;
  }
 
  tbody.innerHTML = "";
  solicitudes.forEach(function(s, i) {
    var badgeColor = s.estado === "Atendida" ? "#27ae60" : "#e74c3c";
    tbody.innerHTML +=
      "<tr>" +
        "<td>" + s.nombre  + "</td>" +
        "<td>" + s.email   + "</td>" +
        "<td>" + s.mensaje + "</td>" +
        "<td>" + s.fecha   + "</td>" +
        "<td><span style='background:" + badgeColor + ";color:#fff;padding:3px 10px;border-radius:12px;font-size:.78rem;font-weight:600;'>" + s.estado + "</span></td>" +
        "<td><button class='btn-atender' onclick='atenderSolicitud(" + i + ")'>✔ Atender</button></td>" +
      "</tr>";
  });
}
 
/**
 * Marca una solicitud como Atendida y recarga la tabla.
 */
function atenderSolicitud(index) {
  var solicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
  if (!solicitudes[index]) return;
  solicitudes[index].estado = "Atendida";
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
  actualizarDashboard();
  renderizarTablaSolicitudes();
}
 
/**
 * Elimina TODAS las solicitudes del localStorage y recarga la tabla.
 */
function borrarSolicitudes() {
  if (!confirm("¿Seguro que desea eliminar todas las solicitudes? Esta acción no se puede deshacer.")) return;
  localStorage.removeItem("solicitudes");
  actualizarDashboard();
  renderizarTablaSolicitudes();
}
 
 
/* ============================================================
   SECCIÓN: DASHBOARD — contador de solicitudes
   ============================================================ */
 
/**
 * Lee localStorage y actualiza los tres contadores (#contadorSolicitudes,
 * #contadorAprobadas, #contadorPendientes) en cualquier página que los tenga.
 */
function actualizarDashboard() {
  var solicitudes = JSON.parse(localStorage.getItem("solicitudes") || "[]");
  var total      = solicitudes.length;
  var atendidas  = 0;
  var pendientes = 0;
 
  solicitudes.forEach(function(s) {
    if (s.estado === "Atendida") { atendidas++; } else { pendientes++; }
  });
 
  var elTotal = document.getElementById("contadorSolicitudes");
  var elAt    = document.getElementById("contadorAprobadas");
  var elPend  = document.getElementById("contadorPendientes");
 
  if (elTotal) elTotal.textContent = total;
  if (elAt)    elAt.textContent    = atendidas;
  if (elPend)  elPend.textContent  = pendientes;
}
 
 
/* ============================================================
   SECCIÓN: LOGIN — index.html
   ============================================================ */
 
function login() {
  var rol = document.getElementById("rol") ? document.getElementById("rol").value : "";
  localStorage.setItem("rolUsuario", rol);
  window.location.href = (rol === "admin") ? "admin.html" : "usuario.html";
}
 
function cambiarTab(id, btn) {
  document.querySelectorAll(".tab-panel").forEach(function(p) { p.classList.remove("activo"); });
  document.querySelectorAll(".tab-btn").forEach(function(b)   { b.classList.remove("activo"); });
  document.getElementById("tab-" + id).classList.add("activo");
  btn.classList.add("activo");
}
 
 
/* ============================================================
   SECCIÓN: CERRAR SESIÓN
   ============================================================ */
 
document.addEventListener("DOMContentLoaded", function() {
  var btnCerrar = document.getElementById("btnCerrar");
  if (btnCerrar) {
    btnCerrar.addEventListener("click", function(e) {
      e.preventDefault();
      localStorage.removeItem("rolUsuario");
      localStorage.removeItem("empleadoActivo");
      window.location.href = "index.html";
    });
  }
});
 
 
/* ============================================================
   INICIALIZACIÓN — se ejecuta al cargar cualquier página
   ============================================================ */
 
window.onload = function() {
  // Dashboard (funciona en usuario.html, admin.html y gestiondesolicitudes.html)
  actualizarDashboard();
 
  // Tabla de solicitudes (solo en gestiondesolicitudes.html)
  renderizarTablaSolicitudes();
 
  // Restaurar empleado activo si fue seleccionado desde gestiondeusuarios.html
  var empGuardado = localStorage.getItem("empleadoActivo");
  if (empGuardado) {
    try {
      var emp = JSON.parse(empGuardado);
      var elNombre = document.getElementById("nombreEmpleado");
      var elCargo  = document.getElementById("cargoEmpleado");
      var elCedula = document.getElementById("cedulaEmpleado");
      var elTiempo = document.getElementById("tiempoEmpleado");
 
      if (elNombre) elNombre.textContent = emp.nombre;
      if (elCargo)  elCargo.textContent  = "📌 Cargo: "  + emp.cargo;
      if (elCedula) elCedula.textContent = "🪪 Cédula: " + emp.cedula;
      if (elTiempo && emp.ingreso && emp.ingreso !== "—") {
        elTiempo.textContent = "🕐 Tiempo: " + calcularTiempo(emp.ingreso);
      }
    } catch(e) {}
  }
 
  // Mostrar nombre de usuario si está guardado (compatibilidad)
  var nombreGuardado = localStorage.getItem("nombreUsuario");
  var elNombreNav    = document.getElementById("nombreUsuario");
  if (elNombreNav && nombreGuardado) {
    elNombreNav.innerText = nombreGuardado;
  }
};
 
 
/* ============================================================
   UTILIDADES
   ============================================================ */
 
function calcularTiempo(fechaStr) {
  try {
    var inicio = new Date(fechaStr);
    var hoy    = new Date();
    var meses  = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth());
    var anios  = Math.floor(meses / 12);
    var mes    = meses % 12;
    return anios + " año(s) y " + mes + " mes(es)";
  } catch(e) { return "—"; }
}
 
function seleccionarEmpleado(emp) {
  localStorage.setItem("empleadoActivo", JSON.stringify(emp));
  var elNombre = document.getElementById("nombreEmpleado");
  var elCargo  = document.getElementById("cargoEmpleado");
  var elCedula = document.getElementById("cedulaEmpleado");
  var elTiempo = document.getElementById("tiempoEmpleado");
  if (elNombre) elNombre.textContent = emp.nombre;
  if (elCargo)  elCargo.textContent  = "📌 Cargo: "  + emp.cargo;
  if (elCedula) elCedula.textContent = "🪪 Cédula: " + emp.cedula;
  if (elTiempo && emp.ingreso && emp.ingreso !== "—") {
    elTiempo.textContent = "🕐 Tiempo: " + calcularTiempo(emp.ingreso);
  }
}