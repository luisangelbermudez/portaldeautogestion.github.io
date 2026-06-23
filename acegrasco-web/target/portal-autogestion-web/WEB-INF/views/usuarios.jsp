<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="header.jsp" %>

<% if (request.getAttribute("mensaje") != null) { %>
  <div class="alerta alerta-exito">${mensaje}</div>
<% } %>
<% if (request.getAttribute("error") != null) { %>
  <div class="alerta alerta-error">${error}</div>
<% } %>

<div class="tarjeta">
  <div class="tarjeta-encabezado">
    <span class="tarjeta-titulo">&#128101; Gestión de Usuarios</span>
    <a href="${pageContext.request.contextPath}/admin/usuarios?accion=nuevo" class="btn btn-primario btn-sm">&#43; Nuevo usuario</a>
  </div>

  <div class="tabla-contenedor">
    <table class="tabla">
      <thead>
        <tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <c:forEach var="u" items="${usuarios}">
          <tr>
            <td>${u.idUsuario}</td>
            <td>${u.nombre}</td>
            <td>${u.correo}</td>
            <td>
              <c:choose>
                <c:when test="${u.idRol == 1}"><span class="badge badge-revision">Administrador</span></c:when>
                <c:otherwise><span class="badge badge-activo">Empleado</span></c:otherwise>
              </c:choose>
            </td>
            <td>
              <c:choose>
                <c:when test="${u.idEstado == 1}"><span class="badge badge-activo">Activo</span></c:when>
                <c:otherwise><span class="badge badge-inactivo">Inactivo</span></c:otherwise>
              </c:choose>
            </td>
            <td>
              <a href="${pageContext.request.contextPath}/admin/usuarios?accion=editar&id=${u.idUsuario}"
                 class="btn btn-secundario btn-sm">&#9998; Editar</a>
              <a href="${pageContext.request.contextPath}/admin/usuarios?accion=eliminar&id=${u.idUsuario}"
                 class="btn btn-peligro btn-sm"
                 onclick="return confirm('¿Eliminar usuario ${u.nombre}?')">&#128465; Eliminar</a>
            </td>
          </tr>
        </c:forEach>
        <c:if test="${empty usuarios}">
          <tr><td colspan="6" style="text-align:center;color:#6c757d;">No hay usuarios registrados.</td></tr>
        </c:if>
      </tbody>
    </table>
  </div>
</div>

<%@ include file="footer.jsp" %>
