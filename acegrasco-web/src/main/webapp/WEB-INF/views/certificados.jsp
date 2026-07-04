<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ page import="co.acegrasco.modelo.Usuario" %>
<%
    Usuario _u = (Usuario) session.getAttribute("usuario");
    String _nombre = (_u != null) ? _u.getNombre() : "Empleado";
    boolean _esAdmin = (_u != null && _u.getIdRol() == 1);
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Certificados Laborales — Acegrasco</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"/>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/usuario.css"/>
  <style>
    .cert-card-opt {
      border: 2px solid #dde3ef;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all .22s;
      text-align: center;
      background: rgba(255,255,255,.93);
      margin-bottom: 14px;
    }
    .cert-card-opt:hover, .cert-card-opt.seleccionado {
      border-color: var(--azul-oscuro);
      background: rgba(15,52,96,.06);
    }
    .cert-card-opt .icono { font-size: 2.4rem; margin-bottom: 8px; }
    .cert-card-opt h5 { font-size: .95rem; color: var(--azul-oscuro); font-weight: 700; margin-bottom: 5px; }
    .cert-card-opt p  { font-size: .80rem; color: #666; margin: 0; }
    .canal-opt { display: flex; gap: 12px; margin: 14px 0; }
    .canal-btn {
      flex: 1; padding: 12px; border: 2px solid #dde3ef;
      border-radius: 10px; background: rgba(255,255,255,.9);
      cursor: pointer; font-size: .88rem; font-weight: 600;
      color: var(--azul-oscuro); transition: all .2s; text-align: center;
    }
    .canal-btn:hover, .canal-btn.activo {
      border-color: var(--azul-oscuro);
      background: rgba(15,52,96,.08);
    }
    .badge-consec {
      background: var(--azul-oscuro); color: var(--dorado);
      border-radius: 20px; padding: 3px 12px; font-size: .78rem; font-weight: 700;
    }
    .hist-table th { background: var(--azul-oscuro); color: var(--dorado); font-size: .82rem; }
    .hist-table td { font-size: .83rem; }
  </style>
</head>
<body>

<!-- NAVBAR -->
<% String _dashUrl = request.getContextPath() + (_esAdmin ? "/admin/dashboard" : "/empleado/dashboard"); %>
<nav class="navbar-top">
  <a href="<%= _dashUrl %>" class="brand">🏢 Portal Acegrasco</a>
  <div class="nav-links">
    <% if (_esAdmin) { %>
      <a href="${pageContext.request.contextPath}/admin/dashboard">📊 Admin</a>
    <% } %>
    <a href="${pageContext.request.contextPath}/solicitudes">📨 Solicitudes</a>
    <a href="${pageContext.request.contextPath}/logout">🚪 Cerrar sesión</a>
  </div>
</nav>

<div class="page-wrap">

  <!-- PERFIL RÁPIDO -->
  <div class="perfil-card">
    <img src="${pageContext.request.contextPath}/imagenes/avatar.JPG" alt="Avatar" class="perfil-avatar"
         onerror="this.style.display='none'"/>
    <div class="perfil-info">
      <h4><%= _nombre %></h4>
      <c:if test="${not empty empleado}">
        <p>📌 Cargo: ${empleado.cargo}</p>
        <p>🪪 Cédula: ${empleado.cedula}</p>
        <p>🏢 Área: ${empleado.area}</p>
      </c:if>
      <span class="perfil-badge">✅ Sesión activa</span>
    </div>
  </div>

  <!-- ALERTAS -->
  <c:if test="${not empty mensaje}">
    <div style="background:#d4edda;border:1px solid #c3e6cb;color:#155724;border-radius:10px;padding:13px 16px;margin-bottom:16px;font-weight:500;">
      ${mensaje}
    </div>
  </c:if>
  <c:if test="${not empty error}">
    <div style="background:#f8d7da;border:1px solid #f5c6cb;color:#721c24;border-radius:10px;padding:13px 16px;margin-bottom:16px;">
      ${error}
    </div>
  </c:if>

  <!-- PANEL CERTIFICADOS -->
  <div class="panel">
    <div class="panel-titulo">📄 Generar Certificado Laboral</div>
    <p style="font-size:.87rem;color:#555;margin-bottom:18px;">
      Selecciona el tipo de certificado y el canal de entrega:
    </p>

    <%-- Formulario POST al CertificadoServlet --%>
    <%-- target="frameDescargaCert": evita que la descarga del PDF navegue fuera de esta página --%>
    <form action="${pageContext.request.contextPath}/certificados" method="post" id="formCert" target="frameDescargaCert">

      <!-- Selección tipo de certificado -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="cert-card-opt" onclick="seleccionarTipo('todos', this)">
            <div class="icono">📋</div>
            <h5>Certificación Laboral Completa</h5>
            <p>Nombre, cédula, cargo, área, ingreso y salario básico</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="cert-card-opt" onclick="seleccionarTipo('sin_basico', this)">
            <div class="icono">📑</div>
            <h5>Sin Salario Básico</h5>
            <p>Igual que el anterior pero sin mencionar el salario</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="cert-card-opt" onclick="seleccionarTipo('con_extras', this)">
            <div class="icono">⏱️</div>
            <h5>Con Horas Extras</h5>
            <p>Incluye el promedio de horas extras de los últimos 3 meses</p>
          </div>
        </div>
      </div>

      <!-- Campo oculto tipo -->
      <input type="hidden" name="tipoCarta" id="tipoCarta" value=""/>

      <!-- Descripción dinámica -->
      <div id="certDesc" style="display:none;background:#fffbea;border:1px solid rgba(241,196,15,.5);border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.87rem;color:#555;"></div>

      <!-- Canal de entrega -->
      <div id="panelCanal" style="display:none;">
        <label style="display:block;font-size:.83rem;font-weight:600;color:var(--azul-oscuro);margin-bottom:8px;">Canal de entrega</label>
        <div class="canal-opt">
          <div class="canal-btn activo" id="btnPdf" onclick="seleccionarCanal('pdf')">
            ⬇️ Descargar PDF
          </div>
          <div class="canal-btn" id="btnCorreo" onclick="seleccionarCanal('correo')">
            📧 Enviar por correo
          </div>
        </div>
        <input type="hidden" name="canal" id="canal" value="pdf"/>

        <button type="submit" class="btn-principal">
          📄 Generar certificado
        </button>
      </div>

    </form>

    <!-- Iframe oculto: recibe la descarga del PDF sin sacar al usuario de esta página -->
    <iframe name="frameDescargaCert" id="frameDescargaCert" style="display:none;"></iframe>
  </div>

  <!-- HISTORIAL DE CERTIFICADOS -->
  <div class="panel">
    <div class="panel-titulo">📋 Mis certificados generados</div>
    <c:choose>
      <c:when test="${not empty misCertificados}">
        <table class="table table-sm hist-table">
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Tipo</th>
              <th>Canal</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <c:forEach var="c" items="${misCertificados}">
              <tr>
                <td><span class="badge-consec">#${String.format('%04d', c.consecutivo)}</span></td>
                <td>
                  <c:choose>
                    <c:when test="${c.idTipo == 1}">Certificación Completa</c:when>
                    <c:when test="${c.idTipo == 2}">Sin Salario Básico</c:when>
                    <c:when test="${c.idTipo == 3}">Con Horas Extras</c:when>
                  </c:choose>
                </td>
                <td>${c.canalEntrega == 'pdf' ? '⬇️ PDF' : '📧 Correo'}</td>
                <td>${c.fechaGeneracion}</td>
              </tr>
            </c:forEach>
          </tbody>
        </table>
      </c:when>
      <c:otherwise>
        <p style="color:#888;font-size:.87rem;">Aún no has generado certificados.</p>
      </c:otherwise>
    </c:choose>
  </div>

</div><!-- /page-wrap -->

<!-- FOOTER -->
<div class="footer">
  Portal de Autogestión © 2026
  <span>📱 (+57) 301 2952356</span>
  <span>✉ info@acegrasco.com.co</span>
  <span>📍 Calle 15 #5-23, Bogotá</span>
</div>

<script>
  var CERT_DESC = {
    todos:      '📋 Incluye nombre, cédula, cargo, área, fecha de ingreso y <strong>salario básico mensual</strong>. Para trámites financieros o bancarios.',
    sin_basico: '📑 Incluye nombre, cédula, cargo, área y fecha de ingreso. <strong>Sin mención del salario</strong>. Ideal cuando no se requiere revelar ingresos.',
    con_extras: '⏱️ Incluye todos los datos más el <strong>promedio de horas extras</strong> de los últimos 3 meses.'
  };

  function seleccionarTipo(tipo, el) {
    document.querySelectorAll('.cert-card-opt').forEach(c => c.classList.remove('seleccionado'));
    el.classList.add('seleccionado');
    document.getElementById('tipoCarta').value = tipo;
    var desc = document.getElementById('certDesc');
    desc.innerHTML     = CERT_DESC[tipo];
    desc.style.display = 'block';
    document.getElementById('panelCanal').style.display = 'block';
  }

  function seleccionarCanal(canal) {
    document.getElementById('canal').value = canal;
    document.getElementById('btnPdf').classList.toggle('activo',    canal === 'pdf');
    document.getElementById('btnCorreo').classList.toggle('activo', canal === 'correo');
  }

  document.getElementById('formCert').addEventListener('submit', function(e) {
    if (!document.getElementById('tipoCarta').value) {
      e.preventDefault();
      alert('⚠️ Por favor selecciona un tipo de certificado.');
      return;
    }

    // Si el canal es PDF, la respuesta del servlet se descarga en el iframe oculto
    // (gracias a target="frameDescargaCert") y esta página NO navega.
    // Por eso recargamos manualmente para que "Mis certificados generados" se actualice.
    var canalSeleccionado = document.getElementById('canal').value;
    if (canalSeleccionado === 'pdf') {
      setTimeout(function () {
        window.location.reload();
      }, 800); // pequeña espera para que el navegador alcance a iniciar la descarga
    }
    // Si el canal es "correo", el servlet hace forward directo a esta misma JSP
    // con los datos actualizados, así que no hace falta recargar aparte.
  });
</script>

</body>
</html>
