

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
