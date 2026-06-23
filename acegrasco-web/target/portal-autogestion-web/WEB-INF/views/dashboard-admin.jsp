<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ page import="co.acegrasco.modelo.Usuario" %>
<%
    Usuario _u = (Usuario) session.getAttribute("usuario");
    String _nombre = (_u != null) ? _u.getNombre() : "Administrador";
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Admin — Acegrasco</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"/>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/usuario.css"/>
</head>
<body>
<nav class="navbar-top">
  <a href="${pageContext.request.contextPath}/admin/dashboard" class="brand">🏢 Portal Acegrasco</a>
  <div class="nav-links">
    <a href="${pageContext.request.contextPath}/admin/usuarios">👥 Usuarios</a>
    <a href="${pageContext.request.contextPath}/admin/empleados">👤 Empleados</a>
    <a href="${pageContext.request.contextPath}/solicitudes">📝 Solicitudes</a>
    <a href="${pageContext.request.contextPath}/certificados">📄 Certificados</a>
    <a href="${pageContext.request.contextPath}/logout">🚪 Salir</a>
  </div>
</nav>

<div class="page-wrap">

  <div class="perfil-card">
    <img src="${pageContext.request.contextPath}/imagenes/avatar.JPG" alt="Avatar" class="perfil-avatar"
         onerror="this.style.display='none'"/>
    <div class="perfil-info">
      <h4><%= _nombre %></h4>
      <p>🔑 Rol: Administrador del sistema</p>
      <p>✉ ${sessionScope.usuario.correo}</p>
      <span class="perfil-badge">🛡️ Admin</span>
    </div>
  </div>

  <% if (request.getAttribute("mensaje") != null) { %>
    <div style="background:#d4edda;color:#155724;border-radius:10px;padding:13px 16px;margin-bottom:16px;font-weight:500;">${mensaje}</div>
  <% } %>
  <% if (request.getAttribute("error") != null) { %>
    <div style="background:#f8d7da;color:#721c24;border-radius:10px;padding:13px 16px;margin-bottom:16px;">${error}</div>
  <% } %>

  <!-- STATS -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-num">${totalUsuarios}</div>
      <div class="stat-lbl">Usuarios</div>
    </div>
    <div class="stat-card verde">
      <div class="stat-num">${totalEmpleados}</div>
      <div class="stat-lbl">Empleados</div>
    </div>
    <div class="stat-card rojo">
      <div class="stat-num">${pendientes}</div>
      <div class="stat-lbl">Solicitudes pendientes</div>
    </div>
  </div>

  <!-- ACCESOS RÁPIDOS -->
  <div class="panel">
    <div class="panel-titulo">⚡ Accesos rápidos</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <a href="${pageContext.request.contextPath}/admin/usuarios?accion=nuevo" class="btn-principal"
         style="text-decoration:none;width:auto;padding:11px 22px;">➕ Nuevo usuario</a>
      <a href="${pageContext.request.contextPath}/admin/empleados?accion=nuevo" class="btn-principal"
         style="text-decoration:none;width:auto;padding:11px 22px;background:linear-gradient(135deg,#27ae60,#2ecc71);">➕ Nuevo empleado</a>
      <a href="${pageContext.request.contextPath}/solicitudes" class="btn-principal"
         style="text-decoration:none;width:auto;padding:11px 22px;background:linear-gradient(135deg,#e74c3c,#c0392b);">📝 Ver solicitudes</a>
      <a href="${pageContext.request.contextPath}/certificados" class="btn-principal"
         style="text-decoration:none;width:auto;padding:11px 22px;background:linear-gradient(135deg,#8e44ad,#9b59b6);">📄 Mis certificados</a>
    </div>
  </div>

</div>

<div class="footer">
  Portal de Autogestión Acegrasco S.A. &copy; 2026
  <span>&#128241; (+57) 301 2952356</span>
  <span>&#9993; info@acegrasco.com.co</span>
  <span>&#128205; Calle 15 #5-23, Bogotá, Colombia</span>
</div>
</body>
</html>
