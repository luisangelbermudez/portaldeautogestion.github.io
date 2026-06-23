<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="header.jsp" %>

<div class="tarjeta">
  <div class="tarjeta-encabezado">
    <span class="tarjeta-titulo">
      <c:choose>
        <c:when test="${not empty empleado}">&#9998; Editar Empleado</c:when>
        <c:otherwise>&#43; Nuevo Empleado</c:otherwise>
      </c:choose>
    </span>
    <a href="${pageContext.request.contextPath}/admin/empleados" class="btn btn-secundario btn-sm">&#8592; Volver</a>
  </div>

  <% if (request.getAttribute("error") != null) { %>
    <div class="alerta alerta-error">${error}</div>
  <% } %>

  <form action="${pageContext.request.contextPath}/admin/empleados" method="post">

    <c:if test="${not empty empleado}">
      <input type="hidden" name="idEmpleado" value="${empleado.idEmpleado}"/>
    </c:if>

    <div class="form-fila">
      <div class="form-grupo">
        <label for="idUsuario">ID de usuario vinculado *</label>
        <input type="number" id="idUsuario" name="idUsuario" class="form-control"
               value="${not empty empleado ? empleado.idUsuario : ''}"
               <c:if test="${not empty empleado}">disabled</c:if> required/>
        <c:if test="${not empty empleado}">
          <input type="hidden" name="idUsuario" value="${empleado.idUsuario}"/>
        </c:if>
      </div>
      <div class="form-grupo">
        <label for="cedula">Cédula *</label>
        <input type="text" id="cedula" name="cedula" class="form-control"
               value="${not empty empleado ? empleado.cedula : ''}" required
               placeholder="Ej: 12345678"/>
      </div>
    </div>

    <div class="form-fila">
      <div class="form-grupo">
        <label for="cargo">Cargo *</label>
        <input type="text" id="cargo" name="cargo" class="form-control"
               value="${not empty empleado ? empleado.cargo : ''}" required
               placeholder="Ej: Analista de Calidad"/>
      </div>
      <div class="form-grupo">
        <label for="area">Área *</label>
        <select id="area" name="area" class="form-control" required>
          <option value="">-- Seleccione --</option>
          <c:forEach var="a" items="${['RRHH','Tecnología','Finanzas','Operaciones','Legal','Gerencia']}">
            <option value="${a}" ${(not empty empleado && empleado.area == a) ? 'selected' : ''}>${a}</option>
          </c:forEach>
        </select>
      </div>
    </div>

    <div class="form-fila">
      <div class="form-grupo">
        <label for="fechaIngreso">Fecha de ingreso *</label>
        <input type="date" id="fechaIngreso" name="fechaIngreso" class="form-control"
               value="${not empty empleado ? empleado.fechaIngreso : ''}" required/>
      </div>
      <div class="form-grupo">
        <label for="salario">Salario mensual *</label>
        <input type="number" id="salario" name="salario" class="form-control"
               value="${not empty empleado ? empleado.salario : ''}" required
               step="0.01" min="0" placeholder="Ej: 2800000"/>
      </div>
      <div class="form-grupo">
        <label for="promedioHorasExtras">Prom. horas extras</label>
        <input type="number" id="promedioHorasExtras" name="promedioHorasExtras" class="form-control"
               value="${not empty empleado ? empleado.promedioHorasExtras : '0'}"
               step="0.01" min="0"/>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:1rem;">
      <button type="submit" class="btn btn-primario">&#128190; Guardar</button>
      <a href="${pageContext.request.contextPath}/admin/empleados" class="btn btn-secundario">Cancelar</a>
    </div>

  </form>
</div>

<%@ include file="footer.jsp" %>
