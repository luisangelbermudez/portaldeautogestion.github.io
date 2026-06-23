<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ page import="co.acegrasco.modelo.Usuario" %>
<%@ include file="header.jsp" %>

<%
    Usuario _uSol = (Usuario) session.getAttribute("usuario");
    boolean _adminSol = (_uSol != null && _uSol.getIdRol() == 1);
%>

<% if (request.getAttribute("mensaje") != null) { %>
  <div style="background:#d4edda;color:#155724;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-weight:500;">${mensaje}</div>
<% } %>
<% if (request.getAttribute("error") != null) { %>
  <div style="background:#f8d7da;color:#721c24;border-radius:10px;padding:12px 16px;margin-bottom:16px;">${error}</div>
<% } %>

<div class="panel">
  <div class="panel-head">
    <h3>📝 <%= _adminSol ? "Gestión de Solicitudes" : "Mis Solicitudes" %></h3>
    <a href="${pageContext.request.contextPath}/solicitudes?accion=nueva" class="btn-nuevo">➕ Nueva solicitud</a>
  </div>

  <div class="tbl-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th>ID</th>
          <% if (_adminSol) { %><th>ID Empleado</th><% } %>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <c:forEach var="s" items="${solicitudes}">
          <tr>
            <td>${s.idSolicitud}</td>
            <% if (_adminSol) { %><td>${s.idEmpleado}</td><% } %>
            <td><strong>${s.tipoSolicitud}</strong></td>
            <td style="max-width:180px;">${s.descripcion}</td>
            <td>
              <c:choose>
                <c:when test="${s.idEstado == 3}"><span class="badge-estado badge-pendiente">⏳ Pendiente</span></c:when>
                <c:when test="${s.idEstado == 4}"><span class="badge-estado badge-revision">🔍 En revisión</span></c:when>
                <c:when test="${s.idEstado == 5}"><span class="badge-estado badge-aprobado">✅ Aprobado</span></c:when>
                <c:when test="${s.idEstado == 6}"><span class="badge-estado badge-rechazado">❌ Rechazado</span></c:when>
              </c:choose>
            </td>
            <td style="white-space:nowrap;">${s.fechaCreacion}</td>
            <td class="col-acciones">
              <% if (_adminSol) { %>
                <a href="${pageContext.request.contextPath}/solicitudes?accion=cambiarEstado&id=${s.idSolicitud}&estado=4"
                   class="btn-tbl revisar">🔍 Revisar</a>
                <a href="${pageContext.request.contextPath}/solicitudes?accion=cambiarEstado&id=${s.idSolicitud}&estado=5"
                   class="btn-tbl aprobar">✅ Aprobar</a>
                <a href="${pageContext.request.contextPath}/solicitudes?accion=cambiarEstado&id=${s.idSolicitud}&estado=6"
                   class="btn-tbl rechazar">❌ Rechazar</a>
              <% } %>
              <a href="${pageContext.request.contextPath}/solicitudes?accion=eliminar&id=${s.idSolicitud}"
                 class="btn-tbl eliminar"
                 onclick="return confirm('¿Eliminar esta solicitud?')">🗑</a>
            </td>
          </tr>
        </c:forEach>
        <c:if test="${empty solicitudes}">
          <tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">No hay solicitudes registradas.</td></tr>
        </c:if>
      </tbody>
    </table>
  </div>
</div>

<%@ include file="footer.jsp" %>
