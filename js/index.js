    /* Cambiar pestaña login/registro */
    function cambiarTab(id, btn) {
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("activo"));
      document.querySelectorAll(".tab-btn").forEach(b   => b.classList.remove("activo"));
      document.getElementById("tab-" + id).classList.add("activo");
      btn.classList.add("activo");
      document.getElementById("loginError").style.display = "none";
    }

    /* ── LOGIN: busca el usuario en localStorage "acegrasco_users" ── */
    function hacerLogin() {
      const input = document.getElementById("loginUsuario").value.trim().toLowerCase();
      const error = document.getElementById("loginError");

      // Cargar usuarios guardados
      let users = [];
      try { users = JSON.parse(localStorage.getItem("acegrasco_users") || "[]"); } catch(e){}

      // Si no hay usuarios aún, redirigir igual (modo demo sin base cargada)
      if (users.length === 0) {
        localStorage.removeItem("sesionUsuario");
        window.location.href = "usuario.html";
        return;
      }

      // Buscar por usuario o correo, que esté Activo
      const encontrado = users.find(u =>
        (u.usuario.toLowerCase() === input || u.correo.toLowerCase() === input) &&
        u.estado === "Activo"
      );

      if (encontrado) {
        // Guardar sesión completa
        localStorage.setItem("sesionUsuario", JSON.stringify(encontrado));
        error.style.display = "none";
        window.location.href = "usuario.html";
      } else {
        error.style.display = "block";
      }
    }

    /* Enter para ingresar */
    document.addEventListener("keydown", function(e) {
      if (e.key === "Enter") hacerLogin();
    });
