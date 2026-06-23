<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="co.acegrasco.modelo.Usuario" %>
<%
    Usuario _u = (Usuario) session.getAttribute("usuario");
    String  _nombre = (_u != null) ? _u.getNombre() : "Usuario";
    boolean _esAdmin = (_u != null && _u.getIdRol() == 1);
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Portal Acegrasco</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"/>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/usuario.css"/>
</head>
<body>
<% String _dashUrlH = request.getContextPath() + (_esAdmin ? "/admin/dashboard" : "/empleado/dashboard"); %>
<nav class="navbar-top">
  <a href="<%= _dashUrlH %>" class="brand">🏢 Portal Acegrasco</a>
  <div class="nav-links">
    <% if (_esAdmin) { %>
      <a href="${pageContext.request.contextPath}/admin/usuarios">👥 Usuarios</a>
      <a href="${pageContext.request.contextPath}/admin/empleados">👤 Empleados</a>
      <a href="${pageContext.request.contextPath}/solicitudes">📝 Solicitudes</a>
      <a href="${pageContext.request.contextPath}/certificados">📄 Certificados</a>
    <% } else { %>
      <a href="${pageContext.request.contextPath}/certificados">📄 Certificados</a>
      <a href="${pageContext.request.contextPath}/solicitudes">📨 Solicitudes</a>
    <% } %>
    <a href="${pageContext.request.contextPath}/logout">🚪 Salir</a>
  </div>
</nav>
<div class="page-wrap">
