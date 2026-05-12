/* ================================================================
   index.js — Portal de Autogestión Acegrasco
   LOGIN: valida usuario/correo + contraseña contra localStorage
   ================================================================ */

/* Cambiar pestaña login/registro */
function cambiarTab(id, btn) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("activo"));
  document.querySelectorAll(".tab-btn").forEach(b   => b.classList.remove("activo"));
  document.getElementById("tab-" + id).classList.add("activo");
  btn.classList.add("activo");
  const err = document.getElementById("loginError");
  if (err) err.style.display = "none";
}

/* ── LOGIN: valida usuario/correo Y contraseña ── */
function hacerLogin() {
  const inputUsuario  = document.getElementById("email");
  const inputPassword = document.getElementById("password");
  const error         = document.getElementById("loginError");

  if (!inputUsuario || !inputPassword) return;

  const usuario  = inputUsuario.value.trim().toLowerCase();
  const password = inputPassword.value;

  // Limpiar error anterior
  if (error) error.style.display = "none";

  if (!usuario || !password) {
    mostrarError("⚠ Por favor ingresa tu usuario/correo y contraseña.");
    return;
  }

  // Cargar usuarios guardados en localStorage
  let users = [];
  try { users = JSON.parse(localStorage.getItem("acegrasco_users") || "[]"); } catch(e) {}

  // Modo demo: si no hay base de datos aún, dejar pasar
  if (users.length === 0) {
    localStorage.removeItem("sesionUsuario");
    window.location.href = "usuario.html";
    return;
  }

  // Buscar usuario por nombre de usuario o correo, que esté Activo
  const encontrado = users.find(u =>
    (u.usuario.toLowerCase() === usuario || u.correo.toLowerCase() === usuario) &&
    u.estado === "Activo"
  );

  if (!encontrado) {
    mostrarError("❌ Usuario no encontrado o cuenta inactiva.");
    inputPassword.value = "";
    return;
  }

  // Validar contraseña (si el admin la asignó)
  if (encontrado.password && encontrado.password !== "") {
    if (encontrado.password !== password) {
      mostrarError("❌ Contraseña incorrecta. Intenta de nuevo.");
      inputPassword.value = "";
      inputPassword.focus();
      return;
    }
  }
  // Si no tiene contraseña asignada aún, dejar pasar (modo transición)

  // ✅ Login exitoso: guardar sesión y redirigir
  localStorage.setItem("sesionUsuario", JSON.stringify(encontrado));
  window.location.href = "usuario.html";
}

function mostrarError(msg) {
  const error = document.getElementById("loginError");
  if (!error) return;
  error.textContent    = msg;
  error.style.display  = "block";
}

/* Enter para ingresar */
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") hacerLogin();
});

/* Conectar el botón de Ingresar */
document.addEventListener("DOMContentLoaded", function() {
  const btn = document.querySelector(".btn-primary");
  if (btn) btn.onclick = hacerLogin;
});
