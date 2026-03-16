function generarCertificado(){

let tipoCarta = document.getElementById("tipoCarta").value;
let resultado = document.getElementById("resultadoCertificado");

if(tipoCarta === ""){
resultado.innerHTML = "Seleccione un certificado";
return;
}

resultado.innerHTML = `
<a href="${tipoCarta}" download>Descargar certificado</a>
`;

}

function guardarSolicitud(event){

event.preventDefault();

let nombre = document.getElementById("nombre").value;
let email = document.getElementById("email").value;
let mensaje = document.getElementById("mensaje").value;

let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

solicitudes.push({
nombre:nombre,
email:email,
mensaje:mensaje
});

localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

alert("Solicitud enviada correctamente");

}


let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

let tabla = document.getElementById("tablaSolicitudes");

if(tabla){

solicitudes.forEach(function(s){

tabla.innerHTML += `
<tr>
<td>${s.nombre}</td>
<td>${s.email}</td>
<td>${s.mensaje}</td>
</tr>
`;

});

}

function borrarSolicitudes(){

localStorage.removeItem("solicitudes");

alert("Solicitudes eliminadas");

location.reload();

}