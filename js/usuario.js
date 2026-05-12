    /* ================================================================
       SESIÓN: cargar datos del empleado que inició sesión
       ================================================================ */
    var sesion = null;

    function cargarSesion() {
      try { sesion = JSON.parse(localStorage.getItem("sesionUsuario") || "null"); } catch(e){}

      // Si no hay sesión activa, redirigir al login
      if (!sesion) {
        window.location.href = "index.html";
        return;
      }

      // Control de acceso por grupo
      const esSuperUser = sesion.grupo === "Super Users";
      const btnAdmin    = document.getElementById("btnAdmin");
      if (btnAdmin) btnAdmin.style.display = esSuperUser ? "inline-flex" : "none";

      // Llenar datos del perfil
      document.getElementById("nombreEmpleado").textContent = sesion.nombre      || "—";
      document.getElementById("cargoEmpleado").textContent  = "📌 Cargo: "  + (sesion.cargo  || "—");
      document.getElementById("cedulaEmpleado").textContent = "🪪 Cédula: " + (sesion.cedula || "—");
      document.getElementById("correoEmpleado").textContent = "✉ Correo: "  + (sesion.correo || "—");

      if (sesion.fechaIngreso) {
        document.getElementById("tiempoEmpleado").textContent = "🕐 Tiempo: " + calcularTiempo(sesion.fechaIngreso);
      }

      // Prellenar el formulario de solicitud con los datos de la sesión
      var fNombre = document.getElementById("nombre");
      var fEmail  = document.getElementById("email");
      if (fNombre && !fNombre.value) fNombre.value = sesion.nombre || "";
      if (fEmail  && !fEmail.value)  fEmail.value  = sesion.correo || "";
    }

    function calcularTiempo(fechaStr) {
      try {
        var inicio = new Date(fechaStr);
        var hoy    = new Date();
        var meses  = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth());
        return Math.floor(meses / 12) + " año(s) y " + (meses % 12) + " mes(es)";
      } catch(e) { return "—"; }
    }


    /* ================================================================
       CERTIFICADO: descripción dinámica + generación PDF
       ================================================================ */
    var CERT_DESC = {
      todos:      "Incluye nombre, cédula, cargo, área, fecha de ingreso y <strong>salario básico mensual</strong>. Para trámites financieros o bancarios.",
      sin_basico: "Incluye nombre, cédula, cargo, área y fecha de ingreso. <strong>Sin mención del salario</strong>. Ideal cuando no se requiere revelar ingresos.",
      con_extras: "Incluye todos los datos más el <strong>promedio de horas extras</strong> de los últimos 3 meses."
    };

    function mostrarDescCert() {
      var tipo = document.getElementById("tipoCarta").value;
      var desc = document.getElementById("certDesc");
      var res  = document.getElementById("resultadoCertificado");
      if (!desc) return;
      if (tipo && CERT_DESC[tipo]) {
        desc.innerHTML     = "📋 " + CERT_DESC[tipo];
        desc.style.display = "block";
      } else {
        desc.style.display = "none";
      }
      if (res) res.innerHTML = "";
    }

    function generarCertificado() {
      var tipo      = document.getElementById("tipoCarta").value;
      var resultado = document.getElementById("resultadoCertificado");

      if (!tipo) {
        resultado.innerHTML = "<div class='res-warn'>⚠️ Por favor seleccione un tipo de certificado antes de continuar.</div>";
        return;
      }

      // Usar datos de la sesión activa
      var emp = sesion ? {
        nombre:  sesion.nombre       || "—",
        cedula:  sesion.cedula       || "—",
        cargo:   sesion.cargo        || "—",
        area:    sesion.grupo        || "—",
        salario: sesion.salario      || "—",
        ingreso: sesion.fechaIngreso || "—",
        email:   sesion.correo       || "—"
      } : {
        nombre:"Empleado", cedula:"—", cargo:"—", area:"—", salario:"—", ingreso:"—", email:"—"
      };

      var blob = crearPDF(tipo, emp);
      var url  = URL.createObjectURL(blob);
      var arch = emp.nombre.replace(/\s+/g, "_");

      var etiquetas = {
        todos:      "Certificación Laboral Completa",
        sin_basico: "Certificación Laboral sin Salario Básico",
        con_extras: "Carta Laboral con Promedio Extras"
      };

      resultado.innerHTML =
        "<div class='res-ok'>✅ <strong>" + etiquetas[tipo] + "</strong> generada para <strong>" + emp.nombre + "</strong>.</div>" +
        "<button class='btn-descarga' onclick=\"descargarPDF('" + url + "','" + arch + "')\">⬇ Descargar certificado PDF</button>" +
        "<button class='btn-correo'   onclick=\"enviarCorreo('" + emp.email + "')\">📧 Enviar al correo registrado</button>";
    }

    function descargarPDF(url, nombre) {
      var a = document.createElement("a");
      a.href     = url;
      a.download = "certificado_" + nombre + ".pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function enviarCorreo(correo) {
      alert("📧 El certificado ha sido enviado a: " + (correo && correo !== "—" ? correo : "el correo registrado"));
    }

    function crearPDF(tipo, emp) {
      var jsPDF = window.jspdf.jsPDF;
      var doc   = new jsPDF({ unit:"mm", format:"a4" });
      var hoy   = new Date().toLocaleDateString("es-CO",{ year:"numeric", month:"long", day:"numeric" });

      var titulos = {
        todos:      "CERTIFICACIÓN LABORAL",
        sin_basico: "CERTIFICACIÓN LABORAL (SIN SALARIO BÁSICO)",
        con_extras: "CARTA LABORAL CON PROMEDIO DE HORAS EXTRAS"
      };

      // Cabecera azul
      doc.setFillColor(15,52,96);
      doc.rect(0,0,210,36,"F");
      doc.setTextColor(241,196,15);
      doc.setFontSize(17); doc.setFont("helvetica","bold");
      doc.text("ACEGRASCO S.A.",105,14,{align:"center"});
      doc.setFontSize(10); doc.setTextColor(255,255,255); doc.setFont("helvetica","normal");
      doc.text("Portal de Autogestión — Recursos Humanos",105,22,{align:"center"});
      doc.setFontSize(8.5);
      doc.text("Calle 15 #5-23, Bogotá  |  (+57) 301 2952356  |  info@acegrasco.com.co",105,29,{align:"center"});

      // Título
      doc.setTextColor(15,52,96); doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text(titulos[tipo],105,47,{align:"center"});
      doc.setDrawColor(241,196,15); doc.setLineWidth(0.8);
      doc.line(20,51,190,51);

      // Cuerpo
      var y=61, X=20;
      doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(40,40,40);
      doc.text("Bogotá D.C., " + hoy, X, y); y+=9;
      doc.text("A quien pueda interesar:", X, y); y+=9;
      doc.text("La empresa ACEGRASCO S.A. certifica que el/la señor(a):", X, y); y+=9;

      var filas = [
        ["Nombre completo",      emp.nombre],
        ["Cédula de ciudadanía", emp.cedula],
        ["Cargo",                emp.cargo],
        ["Área / Departamento",  emp.area],
        ["Fecha de ingreso",     emp.ingreso]
      ];
      if (tipo==="todos") {
        var sn = Number(String(emp.salario).replace(/\D/g,""));
        filas.push(["Salario básico mensual","$ " + (sn ? sn.toLocaleString("es-CO") : emp.salario)]);
      }
      if (tipo==="con_extras") filas.push(["Promedio horas extras (últ. 3 meses)","Incluido en certificación"]);

      filas.forEach(function(f){
        doc.setFont("helvetica","bold"); doc.setTextColor(15,52,96);
        doc.text(f[0]+":",X+4,y);
        doc.setFont("helvetica","normal"); doc.setTextColor(40,40,40);
        doc.text(String(f[1]),X+72,y); y+=8;
      });

      y+=4;
      doc.setDrawColor(210,210,210); doc.setLineWidth(0.3);
      doc.line(X,y,190,y); y+=8;

      var parrafo = tipo==="sin_basico"
        ? "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, desempeñando las funciones de su cargo con contrato a término indefinido. Esta certificación se expide sin mencionar el salario."
        : tipo==="con_extras"
        ? "Se certifica que el/la empleado(a) se encuentra activo(a), devengando el salario indicado más un promedio de horas extras de los últimos tres (3) meses, conforme al Código Sustantivo del Trabajo."
        : "Se certifica que el/la empleado(a) se encuentra activo(a) en nuestra empresa, devengando el salario básico mensual indicado con todos los beneficios de ley del Código Sustantivo del Trabajo de Colombia.";

      var lineas = doc.splitTextToSize(parrafo,170);
      doc.setFontSize(9.5); doc.text(lineas,X,y);
      y += lineas.length*5.5+10;
      doc.text("La presente certificación se expide con veracidad y es válida a la fecha indicada.",X,y);
      y+=16;

      doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(15,52,96);
      doc.text("______________________________",X,y); y+=6;
      doc.text("Recursos Humanos — Acegrasco S.A.",X,y); y+=5;
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(100,100,100);
      doc.text("Firma autorizada / Sello empresa",X,y);

      doc.setFillColor(15,52,96); doc.rect(0,282,210,15,"F");
      doc.setTextColor(241,196,15); doc.setFontSize(8);
      doc.text("Portal de Autogestión Acegrasco © 2026  |  Documento generado electrónicamente",105,290,{align:"center"});

      return doc.output("blob");
    }


    /* ================================================================
       SOLICITUDES
       ================================================================ */
    function guardarSolicitud(event) {
      event.preventDefault();
      var nombre  = document.getElementById("nombre").value.trim();
      var email   = document.getElementById("email").value.trim();
      var mensaje = document.getElementById("mensaje").value.trim();
      if (!nombre || !email || !mensaje) return;

      var sols = JSON.parse(localStorage.getItem("solicitudes") || "[]");
      sols.push({ nombre:nombre, email:email, mensaje:mensaje, fecha:new Date().toLocaleString("es-CO"), estado:"Pendiente" });
      localStorage.setItem("solicitudes", JSON.stringify(sols));

      document.getElementById("formSolicitud").reset();
      // Recuperar datos de sesión en el formulario
      if (sesion) {
        document.getElementById("nombre").value = sesion.nombre || "";
        document.getElementById("email").value  = sesion.correo || "";
      }
      actualizarDashboard();
      mostrarToast();
    }

    function mostrarToast() {
      var t = document.getElementById("toast-ok");
      if (!t) return;
      t.style.display = "block";
      setTimeout(function(){ t.style.display="none"; }, 3000);
    }

    function actualizarDashboard() {
      var sols = JSON.parse(localStorage.getItem("solicitudes") || "[]");
      var total=sols.length, at=0, pend=0;
      sols.forEach(function(s){ s.estado==="Atendida"?at++:pend++; });
      var e1=document.getElementById("contadorSolicitudes");
      var e2=document.getElementById("contadorAprobadas");
      var e3=document.getElementById("contadorPendientes");
      if(e1) e1.textContent=total;
      if(e2) e2.textContent=at;
      if(e3) e3.textContent=pend;
    }


    /* ================================================================
       CERRAR SESIÓN
       ================================================================ */
    document.getElementById("btnCerrar").addEventListener("click", function(e){
      e.preventDefault();
      localStorage.removeItem("sesionUsuario");
      window.location.href="index.html";
    });


    /* ================================================================
       INIT
       ================================================================ */
    cargarSesion();
    actualizarDashboard();
