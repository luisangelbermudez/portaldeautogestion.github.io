<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="header.jsp" %>

<div class="tarjeta">
  <div class="tarjeta-encabezado">
    <span class="tarjeta-titulo">
      <c:choose>
        <c:when test="${not empty usuarioEditar}">&#9998; Editar Usuario</c:when>
        <c:otherwise>&#43; Nuevo Usuario</c:otherwise>
      </c:choose>
    </span>
    <a href="${pageContext.request.contextPath}/admin/usuarios" class="btn btn-secundario btn-sm">&#8592; Volver</a>
  </div>

  <% if (request.getAttribute("error") != null) { %>
    <div class="alerta alerta-error">${error}</div>
  <% } %>

  <%--
    Formulario con método POST al UsuarioServlet.
    Si 'usuario' está en el request → es edición (incluye idUsuario oculto).
    Si no → es creación nueva.
  --%>
  <form action="${pageContext.request.contextPath}/admin/usuarios" method="post">

    <!-- Campo oculto: solo se envía en edición -->
    <c:if test="${not empty usuarioEditar}">
      <input type="hidden" name="idUsuario" value="${usuarioEditar.idUsuario}"/>
    </c:if>

    <div class="form-fila">
      <div class="form-grupo">
        <label for="nombre">Nombre completo *</label>
        <input type="text" id="nombre" name="nombre" class="form-control"
               value="${not empty usuarioEditar ? usuarioEditar.nombre : ''}" required
               placeholder="Ej: Carlos Rodríguez"/>
      </div>
      <div class="form-grupo">
        <label for="correo">Correo electrónico *</label>
        <input type="email" id="correo" name="correo" class="form-control"
               value="${not empty usuarioEditar ? usuarioEditar.correo : ''}" required
               placeholder="usuario@acegrasco.com"/>
      </div>
    </div>

    <div class="form-fila">
      <div class="form-grupo">
        <label for="contrasena">
          Contraseña <c:if test="${not empty usuarioEditar}">(dejar vacío para no cambiar)</c:if>
          <c:if test="${empty usuarioEditar}">*</c:if>
        </label>
        <input type="password" id="contrasena" name="contrasena" class="form-control"
               placeholder="••••••••"
               <c:if test="${empty usuarioEditar}">required</c:if>/>
      </div>
    </div>

    <div class="form-fila">
      <div class="form-grupo">
        <label for="idRol">Rol *</label>
        <select id="idRol" name="idRol" class="form-control" required>
          <option value="2" ${(not empty usuarioEditar && usuarioEditar.idRol == 2) ? 'selected' : ''}>Empleado</option>
          <option value="1" ${(not empty usuarioEditar && usuarioEditar.idRol == 1) ? 'selected' : ''}>Administrador</option>
        </select>
      </div>
      <div class="form-grupo">
        <label for="idEstado">Estado *</label>
        <select id="idEstado" name="idEstado" class="form-control" required>
          <option value="1" ${(empty usuarioEditar || usuarioEditar.idEstado == 1) ? 'selected' : ''}>Activo</option>
          <option value="2" ${(not empty usuarioEditar && usuarioEditar.idEstado == 2) ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:1rem;">
      <button type="submit" class="btn btn-primario">&#128190; Guardar</button>
      <a href="${pageContext.request.contextPath}/admin/usuarios" class="btn btn-secundario">Cancelar</a>
    </div>

  </form>
</div>

<%@ include file="footer.jsp" %>
