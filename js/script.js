function generarCertificado(){

let tipoCarta = document.getElementById("tipoCarta").value;
let resultado = document.getElementById("resultadoCertificado");

if(tipoCarta === ""){
resultado.innerHTML = "<div class='alert alert-warning'>Seleccione un tipo de certificado</div>";
return;
}

resultado.innerHTML = `

<div class="alert alert-success">
Certificado generado correctamente
</div>

<a href="${tipoCarta}" class="btn btn-success w-100 mb-2" download>
⬇ Descargar certificado
</a>

<button class="btn btn-primary w-100" onclick="enviarCorreo()">
📧 Enviar a correo registrado
</button>

`;

}

function enviarCorreo(){

alert("El certificado ha sido enviado al correo registrado del empleado.");

}


function guardarSolicitud(event){

event.preventDefault();

let nombre = document.getElementById("nombre").value;
let email = document.getElementById("email").value;
let mensaje = document.getElementById("mensaje").value;

let fecha = new Date().toLocaleString();

let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

solicitudes.push({
nombre:nombre,
email:email,
mensaje:mensaje,
fecha:fecha,
estado:"Pendiente"
});

localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

alert("Solicitud enviada correctamente");

document.querySelector("form").reset();

}


let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

let tabla = document.getElementById("tablaSolicitudes");

if(tabla){

solicitudes.forEach(function(s,i){

tabla.innerHTML += `
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
</tr>
`;

});

}

function borrarSolicitudes(){

localStorage.removeItem("solicitudes");

alert("Solicitudes eliminadas");

location.reload();

}


function atenderSolicitud(index){

let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

solicitudes[index].estado = "Atendida";

localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

location.reload();

}


function login(){

let rol = document.getElementById("rol").value;

localStorage.setItem("rolUsuario", rol);

if(rol === "admin"){

window.location.href = "admin.html";

}else{

window.location.href = "usuario.html";

}

}

let nombre = localStorage.getItem("nombreUsuario");

if(nombre){

document.getElementById("nombreUsuario").innerText = nombre;

}


function actualizarDashboard(){

    let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    let total = solicitudes.length;
    let aprobadas = 0;
    let pendientes = 0;

    solicitudes.forEach(s => {
        if(s.estado === "Atendida"){
            aprobadas++;
        } else {
            pendientes++;
        }
    });

    // Mostrar en pantalla
    document.getElementById("contadorSolicitudes").innerText = total;
    document.getElementById("contadorAprobadas").innerText = aprobadas;
    document.getElementById("contadorPendientes").innerText = pendientes;
}

window.onload = function(){
    actualizarDashboard();
}
