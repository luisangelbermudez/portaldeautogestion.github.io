package co.acegrasco.servlet;

import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.modelo.Empleado;
import co.acegrasco.modelo.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Servlet EmpleadoServlet
 * CRUD de empleados con formularios HTML.
 *
 * GET  /admin/empleados                      → lista empleados
 * GET  /admin/empleados?accion=nuevo         → formulario nuevo
 * GET  /admin/empleados?accion=editar&id=N   → formulario editar
 * GET  /admin/empleados?accion=eliminar&id=N → eliminar
 * POST /admin/empleados                      → insertar o actualizar
 *
 * Paquete: co.acegrasco.servlet
 */
@WebServlet(name = "EmpleadoServlet", urlPatterns = "/admin/empleados")
public class EmpleadoServlet extends HttpServlet {

    private EmpleadoDao empleadoDao;

    @Override
    public void init() {
        this.empleadoDao = new EmpleadoDao();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!esAdmin(request)) { response.sendRedirect(request.getContextPath() + "/login"); return; }

        String accion = request.getParameter("accion");

        if ("nuevo".equals(accion)) {
            request.getRequestDispatcher("/WEB-INF/views/empleado-form.jsp").forward(request, response);

        } else if ("editar".equals(accion)) {
            int id = Integer.parseInt(request.getParameter("id"));
            Empleado emp = empleadoDao.consultarPorId(id);
            if (emp == null) { request.setAttribute("error", "Empleado no encontrado."); listar(request, response); return; }
            request.setAttribute("empleado", emp);
            request.getRequestDispatcher("/WEB-INF/views/empleado-form.jsp").forward(request, response);

        } else if ("eliminar".equals(accion)) {
            int id = Integer.parseInt(request.getParameter("id"));
            boolean ok = empleadoDao.eliminar(id);
            request.setAttribute(ok ? "mensaje" : "error", ok ? "Empleado eliminado." : "Error al eliminar.");
            listar(request, response);

        } else {
            listar(request, response);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!esAdmin(request)) { response.sendRedirect(request.getContextPath() + "/login"); return; }

        request.setCharacterEncoding("UTF-8");

        String idParam    = request.getParameter("idEmpleado");
        int    idUsuario  = Integer.parseInt(request.getParameter("idUsuario"));
        String cedula     = request.getParameter("cedula");
        String cargo      = request.getParameter("cargo");
        String area       = request.getParameter("area");
        LocalDate  fecha  = LocalDate.parse(request.getParameter("fechaIngreso"));
        BigDecimal salario = new BigDecimal(request.getParameter("salario"));
        BigDecimal hExtras = new BigDecimal(request.getParameter("promedioHorasExtras"));

        boolean exito;

        if (idParam != null && !idParam.isBlank()) {
            // UPDATE
            Empleado emp = empleadoDao.consultarPorId(Integer.parseInt(idParam));
            emp.setCedula(cedula); emp.setCargo(cargo); emp.setArea(area);
            emp.setFechaIngreso(fecha); emp.setSalario(salario); emp.setPromedioHorasExtras(hExtras);
            exito = empleadoDao.actualizar(emp);
        } else {
            // INSERT
            Empleado nuevo = new Empleado(0, idUsuario, cedula, cargo, area, fecha, salario, hExtras);
            exito = empleadoDao.insertar(nuevo);
        }

        request.setAttribute(exito ? "mensaje" : "error",
            exito ? "Empleado guardado correctamente." : "Error al guardar el empleado.");
        listar(request, response);
    }

    private void listar(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setAttribute("empleados", empleadoDao.consultarTodos());
        request.getRequestDispatcher("/WEB-INF/views/empleados.jsp").forward(request, response);
    }

    private boolean esAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        Usuario u = (Usuario) session.getAttribute("usuario");
        return u != null && u.getIdRol() == 1;
    }
}
