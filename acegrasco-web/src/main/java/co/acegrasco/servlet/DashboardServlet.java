package co.acegrasco.servlet;

import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.dao.SolicitudDao;
import co.acegrasco.dao.UsuarioDao;
import co.acegrasco.modelo.Empleado;
import co.acegrasco.modelo.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Servlet DashboardServlet
 * Redirige al dashboard correcto según el rol del usuario en sesión.
 *
 * GET /admin/dashboard    → dashboard administrador
 * GET /empleado/dashboard → dashboard empleado
 *
 * Paquete: co.acegrasco.servlet
 */
@WebServlet(name = "DashboardServlet", urlPatterns = {"/admin/dashboard", "/empleado/dashboard"})
public class DashboardServlet extends HttpServlet {

    private UsuarioDao   usuarioDao;
    private EmpleadoDao  empleadoDao;
    private SolicitudDao solicitudDao;

    @Override
    public void init() {
        this.usuarioDao   = new UsuarioDao();
        this.empleadoDao  = new EmpleadoDao();
        this.solicitudDao = new SolicitudDao();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("usuario") == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        String uri = request.getRequestURI();

        if (uri.contains("/admin/")) {
            // Solo admin puede ver el dashboard de admin
            if (usuario.getIdRol() != 1) {
                response.sendRedirect(request.getContextPath() + "/empleado/dashboard");
                return;
            }
            // Estadísticas para el dashboard admin
            request.setAttribute("totalUsuarios",   usuarioDao.consultarTodos().size());
            request.setAttribute("totalEmpleados",  empleadoDao.consultarTodos().size());
            request.setAttribute("totalSolicitudes", solicitudDao.consultarTodas().size());
            request.setAttribute("pendientes",
                solicitudDao.consultarTodas().stream().filter(s -> s.getIdEstado() == 3).count());
            request.getRequestDispatcher("/WEB-INF/views/dashboard-admin.jsp").forward(request, response);

        } else {
            // Dashboard empleado
            Empleado emp = empleadoDao.consultarPorUsuario(usuario.getIdUsuario());
            request.setAttribute("empleado", emp);
            if (emp != null) {
                request.setAttribute("misSolicitudes",
                    solicitudDao.consultarPorEmpleado(emp.getIdEmpleado()));
            }
            request.getRequestDispatcher("/WEB-INF/views/dashboard-empleado.jsp").forward(request, response);
        }
    }
}
