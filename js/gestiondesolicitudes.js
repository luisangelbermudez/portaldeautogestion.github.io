    /* ================================================================
       LEE SOLICITUDES DESDE LOCALSTORAGE Y RENDERIZA LA TABLA
       ================================================================ */

    function renderizarTabla() {
      var tbody  = document.getElementById("tablaSolicitudes");
      var empty  = document.getElementById("emptyState");
      var q      = (document.getElementById("buscarSolicitud").value || "").toLowerCase();
      var filtro = document.getElementById("filtroEstado").value || "";

      var sols = JSON.parse(localStorage.getItem("solicitudes") || "[]");

      // Filtrar
      var filtradas = sols.filter(function(s, i) {
        s._idx = i; // guardar índice original
        var txt   = (s.nombre + s.email + s.mensaje).toLowerCase();
        var match = !q      || txt.includes(q);
        var stOk  = !filtro || s.estado === filtro;
        return match && stOk;
      });

      actualizarDashboard(sols);

      if (!filtradas.length) {
        tbody.innerHTML = "";
        empty.style.display = "block";
        return;
      }
      empty.style.display = "none";

      tbody.innerHTML = filtradas.map(function(s, fi) {
        var badge = s.estado === "Atendida"
          ? "<span class='badge-at'>✅ Atendida</span>"
          : "<span class='badge-pend'>⏳ Pendiente</span>";
        var disabled = s.estado === "Atendida" ? "disabled" : "";
        var idxOrig  = sols.indexOf(s);

        return "<tr>" +
          "<td style='color:#aaa;font-size:.78rem;'>#" + String(fi+1).padStart(2,"0") + "</td>" +
          "<td><strong>" + s.nombre + "</strong></td>" +
          "<td style='color:var(--azul-oscuro);'>" + s.email + "</td>" +
          "<td style='max-width:220px;'>" + s.mensaje + "</td>" +
          "<td style='color:#888;font-size:.82rem;white-space:nowrap;'>" + s.fecha + "</td>" +
          "<td>" + badge + "</td>" +
          "<td><button class='btn-at' onclick='atenderSolicitud(" + idxOrig + ")' " + disabled + ">✔ Atender</button></td>" +
        "</tr>";
      }).join("");
    }

    function atenderSolicitud(index) {
      var sols = JSON.parse(localStorage.getItem("solicitudes") || "[]");
      if (!sols[index]) return;
      sols[index].estado = "Atendida";
      localStorage.setItem("solicitudes", JSON.stringify(sols));
      mostrarToast("✅ Solicitud marcada como atendida.");
      renderizarTabla();
    }

    function borrarSolicitudes() {
      if (!confirm("¿Desea eliminar TODAS las solicitudes? Esta acción no se puede deshacer.")) return;
      localStorage.removeItem("solicitudes");
      mostrarToast("🗑 Todas las solicitudes han sido eliminadas.");
      renderizarTabla();
    }

    function actualizarDashboard(sols) {
      if (!sols) sols = JSON.parse(localStorage.getItem("solicitudes") || "[]");
      var total=sols.length, at=0, pend=0;
      sols.forEach(function(s){ s.estado==="Atendida"?at++:pend++; });
      var e1=document.getElementById("contadorSolicitudes");
      var e2=document.getElementById("contadorAprobadas");
      var e3=document.getElementById("contadorPendientes");
      if(e1) e1.textContent=total;
      if(e2) e2.textContent=at;
      if(e3) e3.textContent=pend;
    }

    function mostrarToast(msg) {
      var t = document.getElementById("toastMsg");
      t.textContent  = msg;
      t.style.display = "block";
      setTimeout(function(){ t.style.display="none"; }, 3000);
    }

    /* Arranque */
    window.onload = function() { renderizarTabla(); };
