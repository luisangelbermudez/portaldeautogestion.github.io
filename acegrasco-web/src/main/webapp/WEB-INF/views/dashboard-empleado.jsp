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
  <title>Portal Empleado — Acegrasco</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"/>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/usuario.css"/>
</head>
<body>

<!-- NAVBAR igual que la maqueta -->
<nav class="navbar-top">
  <a href="${pageContext.request.contextPath}/empleado/dashboard" class="brand">🏢 Portal Acegrasco</a>
  <div class="nav-links">
    <% if (_esAdmin) { %>
      <a href="${pageContext.request.contextPath}/admin/dashboard">📊 Administrador</a>
    <% } %>
    <a href="${pageContext.request.contextPath}/logout">🚪 Cerrar sesión</a>
  </div>
</nav>

<div class="page-wrap">

  <!-- PERFIL DEL EMPLEADO -->
  <div class="perfil-card">
    <img src="${pageContext.request.contextPath}/imagenes/avatar.JPG" alt="Avatar" class="perfil-avatar"
         onerror="this.style.display='none'"/>
    <div class="perfil-info">
      <h4><%= _nombre %></h4>
      <c:if test="${not empty empleado}">
        <p>📌 Cargo: ${empleado.cargo}</p>
        <p>🪪 Cédula: ${empleado.cedula}</p>
        <p>✉ Correo: ${sessionScope.usuario.correo}</p>
        <p>🏢 Área: ${empleado.area}</p>
        <p>🕐 Ingreso: ${empleado.fechaIngreso}</p>
      </c:if>
      <c:if test="${empty empleado}">
        <p style="color:#e74c3c;font-size:.83rem;">⚠️ Perfil no configurado. Contacta al administrador.</p>
      </c:if>
      <span class="perfil-badge">✅ Sesión activa</span>
    </div>
  </div>

  <!-- ESTADÍSTICAS -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-num">${not empty misSolicitudes ? misSolicitudes.size() : 0}</div>
      <div class="stat-lbl">Total solicitudes</div>
    </div>
    <div class="stat-card verde">
      <div class="stat-num">
        <c:set var="atendidas" value="0"/>
        <c:forEach var="s" items="${misSolicitudes}">
          <c:if test="${s.idEstado == 5}"><c:set var="atendidas" value="${atendidas + 1}"/></c:if>
        </c:forEach>
        ${atendidas}
      </div>
      <div class="stat-lbl">Atendidas</div>
    </div>
    <div class="stat-card rojo">
      <div class="stat-num">
        <c:set var="pendientes" value="0"/>
        <c:forEach var="s" items="${misSolicitudes}">
          <c:if test="${s.idEstado == 3}"><c:set var="pendientes" value="${pendientes + 1}"/></c:if>
        </c:forEach>
        ${pendientes}
      </div>
      <div class="stat-lbl">Pendientes</div>
    </div>
  </div>

  <!-- ACCESOS RÁPIDOS -->
  <div class="panel">
    <div class="panel-titulo">⚡ Accesos rápidos</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="${pageContext.request.contextPath}/certificados" class="btn-principal"
         style="text-decoration:none;display:inline-block;width:auto;padding:12px 24px;">
        📄 Generar Certificado Laboral
      </a>
      <a href="${pageContext.request.contextPath}/solicitudes?accion=nueva" class="btn-principal"
         style="text-decoration:none;display:inline-block;width:auto;padding:12px 24px;background:linear-gradient(135deg,#e74c3c,#c0392b);">
        📨 Nueva Solicitud
      </a>
      <a href="${pageContext.request.contextPath}/solicitudes" class="btn-principal"
         style="text-decoration:none;display:inline-block;width:auto;padding:12px 24px;background:linear-gradient(135deg,#27ae60,#2ecc71);">
        📋 Ver Mis Solicitudes
      </a>
    </div>
  </div>

  <!-- ÚLTIMAS SOLICITUDES -->
  <div class="panel">
    <div class="panel-titulo rojo">📋 Mis últimas solicitudes</div>
    <c:choose>
      <c:when test="${not empty misSolicitudes}">
        <table class="table table-sm" style="font-size:.85rem;">
          <thead style="background:var(--azul-oscuro);color:var(--dorado);">
            <tr><th>Tipo</th><th>Descripción</th><th>Estado</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            <c:forEach var="s" items="${misSolicitudes}" varStatus="vs">
              <c:if test="${vs.index < 5}">
                <tr>
                  <td>${s.tipoSolicitud}</td>
                  <td>${s.descripcion}</td>
                  <td>
                    <c:choose>
                      <c:when test="${s.idEstado == 3}"><span style="color:#e67e22;font-weight:600;">⏳ Pendiente</span></c:when>
                      <c:when test="${s.idEstado == 4}"><span style="color:#2980b9;font-weight:600;">🔍 En revisión</span></c:when>
                      <c:when test="${s.idEstado == 5}"><span style="color:#27ae60;font-weight:600;">✅ Aprobado</span></c:when>
                      <c:when test="${s.idEstado == 6}"><span style="color:#e74c3c;font-weight:600;">❌ Rechazado</span></c:when>
                    </c:choose>
                  </td>
                  <td>${s.fechaCreacion}</td>
                </tr>
              </c:if>
            </c:forEach>
          </tbody>
        </table>
      </c:when>
      <c:otherwise>
        <p style="color:#888;font-size:.87rem;">No tienes solicitudes enviadas aún.</p>
      </c:otherwise>
    </c:choose>
  </div>

</div>

<!-- FOOTER -->
<div class="footer">
  Portal de Autogestión Acegrasco S.A. &copy; 2026
  <span>&#128241; (+57) 301 2952356</span>
  <span>&#9993; info@acegrasco.com.co</span>
  <span>&#128205; Calle 15 #5-23, Bogotá, Colombia</span>
</div>

</body>
</html>
