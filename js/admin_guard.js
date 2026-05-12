/* ================================================================
   admin_guard.js — Protección de acceso al panel administrativo
   Solo usuarios del grupo "Super Users" pueden acceder.
   Incluir este script en el <head> de admin.html:
   <script src="js/admin_guard.js"></script>
   ================================================================ */
(function() {
  var sesion = null;
  try { sesion = JSON.parse(localStorage.getItem("sesionUsuario") || "null"); } catch(e) {}

  if (!sesion || sesion.grupo !== "Super Users") {
    // Sin sesión o sin permisos → redirigir al login
    window.location.replace("index.html");
  }
})();
