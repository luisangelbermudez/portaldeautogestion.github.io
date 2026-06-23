package co.acegrasco.servlet;

import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.dao.SolicitudDao;
import co.acegrasco.modelo.Empleado;
import co.acegrasco.modelo.Solicitud;
import co.acegrasco.modelo.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;

/**
 * Servlet SolicitudServlet
 * CRUD de solicitudes. Empleados pueden crear; admin puede gestionar estado.
 *
 * GET  /solicitudes                        → lista solicitudes
 * GET  /solicitudes?accion=nueva           → formulario nueva solicitud
 * GET  /solicitudes?accion=cambiarEstado&id=N&estado=N → actualiza estado
 * GET  /solicitudes?accion=eliminar&id=N   → elimina solicitud
 * POST /solicitudes                        → inserta nueva solicitud
 *
 * Paquete: co.acegrasco.servlet
 */
@WebServlet(name = "SolicitudServlet", urlPatterns = "/solicitudes")
public class SolicitudServlet extends HttpServlet {

    private SolicitudDao solicitudDao;
    private EmpleadoDao  empleadoDao;

    @Override
    public void init() {
        this.solicitudDao = new SolicitudDao();
        this.empleadoDao  = new EmpleadoDao();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!haySession(request)) { response.sendRedirect(request.getContextPath() + "/login"); return; }

        String accion = request.getParameter("accion");

        if ("nueva".equals(accion)) {
            request.getRequestDispatcher("/WEB-INF/views/solicitud-form.jsp").forward(request, response);

        } else if ("cambiarEstado".equals(accion)) {
            int idSolicitud = Integer.parseInt(request.getParameter("id"));
            int nuevoEstado = Integer.parseInt(request.getParameter("estado"));
            boolean ok = solicitudDao.actualizarEstado(idSolicitud, nuevoEstado);
            request.setAttribute(ok ? "mensaje" : "error",
                ok ? "Estado actualizado correctamente." : "Error al actualizar estado.");
            listar(request, response);

        } else if ("eliminar".equals(accion)) {
            int id = Integer.parseInt(request.getParameter("id"));
            boolean ok = solicitudDao.eliminar(id);
            request.setAttribute(ok ? "mensaje" : "error",
                ok ? "Solicitud eliminada." : "Error al eliminar solicitud.");
            listar(request, response);

        } else {
            listar(request, response);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!haySession(request)) { response.sendRedirect(request.getContextPath() + "/login"); return; }

        request.setCharacterEncoding("UTF-8");

        HttpSession session  = request.getSession(false);
        Usuario usuarioSesion = (Usuario) session.getAttribute("usuario");

        // Obtener el empleado vinculado al usuario en sesión
        Empleado emp = empleadoDao.consultarPorUsuario(usuarioSesion.getIdUsuario());
        if (emp == null) {
            request.setAttribute("error", "No tienes un perfil de empleado registrado. Contacta al administrador.");
            request.getRequestDispatcher("/WEB-INF/views/solicitud-form.jsp").forward(request, response);
            return;
        }

        String tipoSolicitud = request.getParameter("tipoSolicitud");
        String descripcion   = request.getParameter("descripcion");

        if (tipoSolicitud == null || tipoSolicitud.isBlank() || descripcion == null || descripcion.isBlank()) {
            request.setAttribute("error", "Todos los campos son obligatorios.");
            request.getRequestDispatcher("/WEB-INF/views/solicitud-form.jsp").forward(request, response);
            return;
        }

        Solicitud nueva = new Solicitud();
        nueva.setIdEmpleado(emp.getIdEmpleado());
        nueva.setTipoSolicitud(tipoSolicitud);
        nueva.setDescripcion(descripcion);

        boolean ok = solicitudDao.insertar(nueva);
        request.setAttribute(ok ? "mensaje" : "error",
            ok ? "Solicitud enviada correctamente. Estado: Pendiente." : "Error al enviar la solicitud.");
        listar(request, response);
    }

    private void listar(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session   = request.getSession(false);
        Usuario usuarioSesion  = (Usuario) session.getAttribute("usuario");
        List<Solicitud> lista;

        if (usuarioSesion.getIdRol() == 1) {
            // Admin ve todas las solicitudes
            lista = solicitudDao.consultarTodas();
        } else {
            // Empleado solo ve las suyas
            Empleado emp = empleadoDao.consultarPorUsuario(usuarioSesion.getIdUsuario());
            lista = emp != null ? solicitudDao.consultarPorEmpleado(emp.getIdEmpleado()) : List.of();
        }

        request.setAttribute("solicitudes", lista);
        request.getRequestDispatcher("/WEB-INF/views/solicitudes.jsp").forward(request, response);
    }

    private boolean haySession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute("usuario") != null;
    }
}
