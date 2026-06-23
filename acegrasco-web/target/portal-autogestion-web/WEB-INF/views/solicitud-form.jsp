<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="header.jsp" %>

<div class="tarjeta">
  <div class="tarjeta-encabezado">
    <span class="tarjeta-titulo">&#128203; Nueva Solicitud</span>
    <a href="${pageContext.request.contextPath}/solicitudes" class="btn btn-secundario btn-sm">&#8592; Volver</a>
  </div>

  <% if (request.getAttribute("error") != null) { %>
    <div class="alerta alerta-error">${error}</div>
  <% } %>

  <%-- Formulario POST al SolicitudServlet --%>
  <form action="${pageContext.request.contextPath}/solicitudes" method="post">

    <div class="form-grupo">
      <label for="tipoSolicitud">Tipo de solicitud *</label>
      <select id="tipoSolicitud" name="tipoSolicitud" class="form-control" required>
        <option value="">-- Seleccione --</option>
        <option value="Permiso">Permiso</option>
        <option value="Vacaciones">Vacaciones</option>
        <option value="Incapacidad">Incapacidad</option>
        <option value="Actualización de datos">Actualización de datos</option>
        <option value="Otro">Otro</option>
      </select>
    </div>

    <div class="form-grupo">
      <label for="descripcion">Descripción *</label>
      <textarea id="descripcion" name="descripcion" class="form-control" rows="4"
                placeholder="Describe tu solicitud con el mayor detalle posible..." required></textarea>
    </div>

    <div style="display:flex;gap:10px;margin-top:1rem;">
      <button type="submit" class="btn btn-primario">&#128228; Enviar solicitud</button>
      <a href="${pageContext.request.contextPath}/solicitudes" class="btn btn-secundario">Cancelar</a>
    </div>

  </form>
</div>

<%@ include file="footer.jsp" %>
