    window.onload = function() {
      actualizarDashboard();
 
      // Actividad desde solicitudes
      let sols = JSON.parse(localStorage.getItem("solicitudes")) || [];
      if (sols.length > 0) {
        let cont = document.getElementById("actividadReciente");
        cont.innerHTML = "";
        sols.slice(-5).reverse().forEach(function(s) {
          let clase = s.estado === "Atendida" ? "verde" : "rojo";
          cont.innerHTML += `
            <div class="actividad-item">
              <div class="act-dot ${clase}"></div>
              <div class="act-texto"><strong>${s.nombre}</strong> — ${s.mensaje.substring(0,60)}${s.mensaje.length>60?'...':''}</div>
              <div class="act-fecha">${s.fecha}</div>
            </div>`;
        });
      }
    };
