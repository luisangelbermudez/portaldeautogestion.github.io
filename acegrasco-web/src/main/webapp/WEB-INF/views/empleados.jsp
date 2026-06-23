<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="header.jsp" %>

<% if (request.getAttribute("mensaje") != null) { %>
  <div style="background:#d4edda;color:#155724;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-weight:500;">${mensaje}</div>
<% } %>
<% if (request.getAttribute("error") != null) { %>
  <div style="background:#f8d7da;color:#721c24;border-radius:10px;padding:12px 16px;margin-bottom:16px;">${error}</div>
<% } %>

<div class="panel">
  <div class="panel-head">
    <h3>👤 Gestión de Empleados</h3>
    <a href="${pageContext.request.contextPath}/admin/empleados?accion=nuevo" class="btn-nuevo">➕ Nuevo empleado</a>
  </div>

  <div class="tbl-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th>ID</th>
          <th>Cédula</th>
          <th>Nombre</th>
          <th>Cargo</th>
          <th>Área</th>
          <th>Ingreso</th>
          <th>Salario</th>
          <th>H. Extras</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <c:forEach var="e" items="${empleados}">
          <tr>
            <td>${e.idEmpleado}</td>
            <td>${e.cedula}</td>
            <td><strong>${e.nombre != null ? e.nombre : '—'}</strong></td>
            <td>${e.cargo}</td>
            <td><span class="badge-estado badge-revision">${e.area}</span></td>
            <td>${e.fechaIngreso}</td>
            <td>$<c:out value="${e.salario}"/></td>
            <td>${e.promedioHorasExtras} h</td>
            <td class="col-acciones">
              <a href="${pageContext.request.contextPath}/admin/empleados?accion=editar&id=${e.idEmpleado}"
                 class="btn-tbl editar">✏️ Editar</a>
              <a href="${pageContext.request.contextPath}/admin/empleados?accion=eliminar&id=${e.idEmpleado}"
                 class="btn-tbl eliminar"
                 onclick="return confirm('¿Eliminar empleado con cédula ${e.cedula}?')">🗑 Eliminar</a>
            </td>
          </tr>
        </c:forEach>
        <c:if test="${empty empleados}">
          <tr><td colspan="9" style="text-align:center;color:#888;padding:20px;">No hay empleados registrados.</td></tr>
        </c:if>
      </tbody>
    </table>
  </div>
</div>

<%@ include file="footer.jsp" %>
