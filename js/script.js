/* ============================================================
   SCRIPT.JS — Portal de Autogestión Acegrasco
   Asociado a: usuario.html, admin.html, index.html
   ============================================================ */


/* ============================================================
   SECCIÓN: LOGIN (index.html)
   ============================================================ */

function login() {
    let rol = document.getElementById("rol").value;
    localStorage.setItem("rolUsuario", rol);

    if (rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "usuario.html";
    }
}

// Mostrar nombre del usuario logueado (si existe en el DOM)
let nombreGuardado = localStorage.getItem("nombreUsuario");
let elNombre = document.getElementById("nombreUsuario");
if (elNombre && nombreGuardado) {
    elNombre.innerText = nombreGuardado;
}


/* ============================================================
   SECCIÓN: CERTIFICADOS (usuario.html)
   Variables y funciones para selección, generación y descarga
   ============================================================ */

// Empleado activo seleccionado desde la tabla Excel
let empleadoActivo = null;

/**
 * Marca visualmente el tipo de certificado seleccionado
 * y actualiza el campo oculto #tipoCarta
 */
function seleccionarCert(el, tipo) {
    document.querySelectorAll(".cert-opcion").forEach(c => c.classList.remove("activo"));
    el.classList.add("activo");
    document.getElementById("tipoCarta").value = tipo;
}

/**
 * Genera el PDF del certificado usando los datos del empleado activo.
 * Si no hay empleado seleccionado ni tipo elegido, muestra advertencia.
 */
function generarCertificado() {
    let tipo = document.getElementById("tipoCarta").value;
    let resultado = document.getElementById("resultadoCertificado");

    if (!tipo) {
        resultado.innerHTML = "<div class='res-warn'>⚠️ Por favor seleccione un tipo de certificado.</div>";
        return;
    }

    if (!empleadoActivo) {
        resultado.innerHTML = "<div class='res-warn'>⚠️ Primero importe el Excel y seleccione un empleado de la lista.</div>";
        return;
    }

    let pdfBlob = crearPDF(tipo, empleadoActivo);
    let url = URL.createObjectURL(pdfBlob);

    const nombres = {
        todos:      "Certificación Laboral Completa",
        sin_basico: "Certificación Laboral sin Salario Básico",
        con_extras: "Carta Laboral con Promedio Extras"
    };

    resultado.innerHTML = `
        <div class="res-ok">
            ✅ ${nombres[tipo]} generada para <strong>${empleadoActivo.nombre}</strong>.
        </div>
        <button class="btn-descarga" onclick="descargarPDF('${url}', '${empleadoActivo.nombre}')">
            ⬇ Descargar certificado PDF
        </button>
        <button class="btn-correo" onclick="enviarCorreo()">
            📧 Enviar al correo registrado
        </button>
    `;
}

/**
 * Dispara la descarga del PDF generado.
 */
function descargarPDF(url, nombre) {
    let a = document.createElement("a");
    a.href = url;
    a.download = "certificado_" + nombre.replace(/ /g, "_") + ".pdf";
    a.click();
}

/**
 * Crea el PDF con jsPDF usando los datos del empleado y el tipo de carta.
 * Retorna un Blob listo para descargar.
 */
function crearPDF(tipo, emp) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const hoy = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });

    const titulos = {
        todos:      "CERTIFICACIÓN LABORAL",
        sin_basico: "CERTIFICACIÓN LABORAL (SIN SALARIO BÁSICO)",
        con_extras: "CARTA LABORAL CON PROMEDIO DE HORAS EXTRAS"
    };

    // Cabecera azul
    doc.setFillColor(15, 52, 96);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(241, 196, 15);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ACEGRASCO S.A.", 105, 14, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("Portal de Autogestión — Recursos Humanos", 105, 22, { align: "center" });
    doc.setFontSize(9);
    doc.text("Calle 15 #5-23, Bogotá  |  (+57) 301 2952356  |  info@acegrasco.com.co", 105, 29, { align: "center" });

    // Título
    doc.setTextColor(15, 52, 96);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(titulos[tipo], 105, 46, { align: "center" });
    doc.setDrawColor(241, 196, 15);
    doc.setLineWidth(0.8);
    doc.line(20, 50, 190, 50);

    // Cuerpo
    let y = 60;
    const X = 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text("Bogotá D.C., " + hoy, X, y); y += 10;
    doc.text("A quien pueda interesar:", X, y); y += 10;
    doc.text("La empresa ACEGRASCO S.A. certifica que el(la) señor(a):", X, y); y += 10;

    // Tabla de datos
    let datos = [
        ["Nombre completo",      emp.nombre],
        ["Cédula de ciudadanía", emp.cedula],
        ["Cargo",                emp.cargo],
        ["Área / Departamento",  emp.area],
        ["Fecha de ingreso",     emp.ingreso],
    ];

    if (tipo === "todos") {
        datos.push(["Salario básico mensual", "$ " + Number(String(emp.salario).replace(/\D/g, "")).toLocaleString("es-CO")]);
    }

    if (tipo === "con_extras") {
        datos.push(["Promedio horas extras (últ. 3 meses)", "Incluido en certificación"]);
    }

    datos.forEach(function([clave, valor]) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 52, 96);
        doc.text(clave + ":", X + 4, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(String(valor), X + 70, y);
        y += 8;
    });

    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(X, y, 190, y);
    y += 8;

    // Párrafo legal
    let parrafo = tipo === "sin_basico"
        ? "Se certifica que el(la) empleado(a) se encuentra activo(a) en nuestra empresa, desempeñando las funciones propias de su cargo, con contrato a término indefinido. Esta certificación se expide sin hacer mención del salario."
        : tipo === "con_extras"
        ? "Se certifica que el(la) empleado(a) se encuentra activo(a) devengando el salario indicado más un promedio de horas extras reconocidas en los últimos tres (3) meses, conforme a la legislación laboral colombiana vigente."
        : "Se certifica que el(la) empleado(a) se encuentra activo(a) en nuestra empresa, devengando el salario básico mensual indicado, con todos los beneficios de ley establecidos en el Código Sustantivo del Trabajo de Colombia.";

    let lineas = doc.splitTextToSize(parrafo, 170);
    doc.setFontSize(9.5);
    doc.text(lineas, X, y);
    y += lineas.length * 5.5 + 12;

    doc.text("La presente certificación se expide con veracidad y es válida a la fecha indicada.", X, y);
    y += 16;

    // Firma
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 52, 96);
    doc.text("_______________________________", X, y); y += 6;
    doc.text("Recursos Humanos — Acegrasco S.A.", X, y); y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Firma autorizada / Sello empresa", X, y);

    // Pie de página
    doc.setFillColor(15, 52, 96);
    doc.rect(0, 282, 210, 15, "F");
    doc.setTextColor(241, 196, 15);
    doc.setFontSize(8);
    doc.text("Portal de Autogestión Acegrasco © 2026  |  Documento generado electrónicamente", 105, 290, { align: "center" });

    return doc.output("blob");
}

/**
 * Simula el envío del certificado al correo del empleado activo.
 */
function enviarCorreo() {
    let correo = empleadoActivo ? empleadoActivo.email : "correo no disponible";
    alert("El certificado ha sido enviado al correo registrado del empleado:\n" + correo);
}


/* ============================================================
   SECCIÓN: IMPORTAR EXCEL (usuario.html)
   ============================================================ */

/**
 * Lee el archivo Excel usando SheetJS y renderiza la tabla de empleados.
 */
function cargarExcel(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: "array" });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let filas = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        renderTablaEmpleados(filas);
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Renderiza la tabla con los empleados importados del Excel.
 * Normaliza los nombres de columnas más comunes.
 */
function renderTablaEmpleados(filas) {
    let tbody = document.getElementById("cuerpoTablaEmpleados");
    tbody.innerHTML = "";

    filas.forEach(function(fila) {
        let nombre  = fila["Nombre"] || fila["nombre"] || fila["NOMBRE"] || "—";
        let cedula  = fila["Cedula"] || fila["cédula"] || fila["CC"] || fila["cedula"] || "—";
        let cargo   = fila["Cargo"] || fila["cargo"] || "—";
        let area    = fila["Area"] || fila["Área"] || fila["area"] || "—";
        let salario = fila["Salario"] || fila["salario"] || fila["Básico"] || "—";
        let ingreso = fila["Fecha Ingreso"] || fila["FechaIngreso"] || fila["fecha_ingreso"] || "—";
        let email   = fila["Email"] || fila["Correo"] || fila["email"] || "—";

        let emp = { nombre, cedula, cargo, area, salario, ingreso, email };

        tbody.innerHTML += `
            <tr>
                <td>${nombre}</td>
                <td>${cedula}</td>
                <td>${cargo}</td>
                <td>${area}</td>
                <td>${salario}</td>
                <td>${ingreso}</td>
                <td>${email}</td>
                <td>
                    <button class="btn-sel" onclick='seleccionarEmpleado(${JSON.stringify(emp).replace(/'/g,"&#39;")})'>
                        ✔ Seleccionar
                    </button>
                </td>
            </tr>`;
    });

    document.getElementById("contenedorTablaEmpleados").style.display = "block";
}

/**
 * Fija el empleado activo y actualiza el perfil visual + banner.
 */
function seleccionarEmpleado(emp) {
    empleadoActivo = emp;
    localStorage.setItem("empleadoActivo", JSON.stringify(emp));

    // Actualizar tarjeta de perfil
    let elNombre = document.getElementById("nombreEmpleado");
    let elCargo  = document.getElementById("cargoEmpleado");
    let elCedula = document.getElementById("cedulaEmpleado");
    let elTiempo = document.getElementById("tiempoEmpleado");

    if (elNombre) elNombre.textContent = emp.nombre;
    if (elCargo)  elCargo.textContent  = "📌 Cargo: " + emp.cargo;
    if (elCedula) elCedula.textContent = "🪪 Cédula: " + emp.cedula;
    if (elTiempo && emp.ingreso !== "—") {
        elTiempo.textContent = "🕐 Tiempo: " + calcularTiempo(emp.ingreso);
    }

    // Banner sección certificados
    let banner = document.getElementById("bannerEmpleado");
    if (banner) {
        document.getElementById("bannerNombre").textContent = emp.nombre;
        document.getElementById("bannerCedula").textContent = emp.cedula;
        banner.style.display = "block";
    }
}

/**
 * Calcula el tiempo transcurrido desde la fecha de ingreso.
 */
function calcularTiempo(fechaStr) {
    try {
        let inicio = new Date(fechaStr);
        let hoy    = new Date();
        let meses  = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth());
        let años   = Math.floor(meses / 12);
        let mes    = meses % 12;
        return años + " año(s) y " + mes + " mes(es)";
    } catch(e) {
        return "—";
    }
}


/* ============================================================
   SECCIÓN: SOLICITUDES (usuario.html / admin.html)
   ============================================================ */

/**
 * Guarda una nueva solicitud en localStorage.
 */
function guardarSolicitud(event) {
    event.preventDefault();

    let nombre  = document.getElementById("nombre").value;
    let email   = document.getElementById("email").value;
    let mensaje = document.getElementById("mensaje").value;
    let fecha   = new Date().toLocaleString();

    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    solicitudes.push({ nombre, email, mensaje, fecha, estado: "Pendiente" });
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

    alert("✅ Solicitud enviada correctamente.");
    document.querySelector("form").reset();
    actualizarDashboard();
}

/**
 * Cambia el estado de una solicitud a "Atendida" (admin).
 */
function atenderSolicitud(index) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    solicitudes[index].estado = "Atendida";
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes));
    location.reload();
}

/**
 * Elimina todas las solicitudes del localStorage (admin).
 */
function borrarSolicitudes() {
    localStorage.removeItem("solicitudes");
    alert("Solicitudes eliminadas.");
    location.reload();
}

/**
 * Renderiza la tabla de solicitudes en admin.html.
 */
let tablaSolicitudes = document.getElementById("tablaSolicitudes");
if (tablaSolicitudes) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    solicitudes.forEach(function(s, i) {
        tablaSolicitudes.innerHTML += `
            <tr>
                <td>${s.nombre}</td>
                <td>${s.email}</td>
                <td>${s.mensaje}</td>
                <td>${s.fecha}</td>
                <td>${s.estado}</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="atenderSolicitud(${i})">
                        Atender
                    </button>
                </td>
            </tr>`;
    });
}


/* ============================================================
   SECCIÓN: DASHBOARD (usuario.html / admin.html)
   ============================================================ */

/**
 * Actualiza los contadores del dashboard con los datos de localStorage.
 */
function actualizarDashboard() {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];
    let total      = solicitudes.length;
    let atendidas  = 0;
    let pendientes = 0;

    solicitudes.forEach(function(s) {
        if (s.estado === "Atendida") {
            atendidas++;
        } else {
            pendientes++;
        }
    });

    let elTotal     = document.getElementById("contadorSolicitudes");
    let elAtendidas = document.getElementById("contadorAprobadas");
    let elPend      = document.getElementById("contadorPendientes");

    if (elTotal)     elTotal.innerText     = total;
    if (elAtendidas) elAtendidas.innerText = atendidas;
    if (elPend)      elPend.innerText      = pendientes;
}


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

window.onload = function() {
    actualizarDashboard();

    // Restaurar empleado activo si existía en sesión
    let empGuardado = JSON.parse(localStorage.getItem("empleadoActivo") || "null");
    if (empGuardado) seleccionarEmpleado(empGuardado);
};
