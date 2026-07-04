package co.acegrasco.servlet;

import co.acegrasco.dao.UsuarioDao;
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
 * Servlet UsuarioServlet
 * Gestiona las operaciones CRUD de usuarios vía formularios HTML.
 *
 * GET  /admin/usuarios          → lista todos los usuarios
 * GET  /admin/usuarios?accion=nuevo      → formulario nuevo usuario
 * GET  /admin/usuarios?accion=editar&id= → formulario editar usuario
 * GET  /admin/usuarios?accion=eliminar&id= → elimina usuario (con confirmación)
 * POST /admin/usuarios          → guarda nuevo o actualiza usuario existente
 *
 * Paquete: co.acegrasco.servlet
 */
@WebServlet(name = "UsuarioServlet", urlPatterns = "/admin/usuarios")
public class UsuarioServlet extends HttpServlet {

    private UsuarioDao usuarioDao;

    @Override
    public void init() {
        this.usuarioDao = new UsuarioDao();
    }

    /**
     * GET: lista usuarios o muestra formulario según parámetro 'accion'.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Verificar sesión de administrador
        if (!esAdmin(request)) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        String accion = request.getParameter("accion");

        if ("nuevo".equals(accion)) {
            // Mostrar formulario para nuevo usuario
            request.getRequestDispatcher("/WEB-INF/views/usuario-form.jsp").forward(request, response);

        } else if ("editar".equals(accion)) {
            // Mostrar formulario precargado con datos del usuario
            int id = Integer.parseInt(request.getParameter("id"));
            Usuario usuario = usuarioDao.consultarPorId(id);
            if (usuario == null) {
                request.setAttribute("error", "Usuario no encontrado.");
                listarUsuarios(request, response);
                return;
            }
            request.setAttribute("usuarioEditar", usuario);
            request.getRequestDispatcher("/WEB-INF/views/usuario-form.jsp").forward(request, response);

        } else if ("eliminar".equals(accion)) {
            // Eliminar usuario por ID
            int id = Integer.parseInt(request.getParameter("id"));

            if (usuarioDao.tieneEmpleadoAsociado(id)) {
                // No se puede borrar: hay un empleado (y su historial de certificados/solicitudes)
                // que depende de este usuario. Sugerimos desactivar en su lugar.
                request.setAttribute("error",
                    "Este usuario tiene un empleado asociado y no puede eliminarse, " +
                    "ya que perdería su historial de certificados y solicitudes. " +
                    "Usa el botón \"Desactivar\" para bloquear su acceso sin borrar sus datos.");
                listarUsuarios(request, response);
                return;
            }

            boolean ok = usuarioDao.eliminar(id);
            request.setAttribute(ok ? "mensaje" : "error",
                ok ? "Usuario eliminado correctamente." : "No se pudo eliminar el usuario.");
            listarUsuarios(request, response);

        } else if ("desactivar".equals(accion)) {
            // Desactiva el usuario (id_estado = Inactivo) en vez de borrarlo físicamente
            int id = Integer.parseInt(request.getParameter("id"));
            boolean ok = usuarioDao.desactivar(id);
            request.setAttribute(ok ? "mensaje" : "error",
                ok ? "Usuario desactivado correctamente." : "No se pudo desactivar el usuario.");
            listarUsuarios(request, response);

        } else {
            // Por defecto: listar usuarios
            listarUsuarios(request, response);
        }
    }

    /**
     * POST: guarda un nuevo usuario o actualiza uno existente.
     * Si 'idUsuario' viene en el formulario y no está vacío → UPDATE, sino → INSERT.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!esAdmin(request)) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        request.setCharacterEncoding("UTF-8");

        String idParam    = request.getParameter("idUsuario");
        String nombre     = request.getParameter("nombre");
        String correo     = request.getParameter("correo");
        String contrasena = request.getParameter("contrasena");
        int    idRol      = Integer.parseInt(request.getParameter("idRol"));
        int    idEstado   = Integer.parseInt(request.getParameter("idEstado"));

        // Validación básica
        if (nombre == null || nombre.isBlank() || correo == null || correo.isBlank()) {
            request.setAttribute("error", "Nombre y correo son obligatorios.");
            request.getRequestDispatcher("/WEB-INF/views/usuario-form.jsp").forward(request, response);
            return;
        }

        boolean exito;

        if (idParam != null && !idParam.isBlank()) {
            // UPDATE
            int id = Integer.parseInt(idParam);
            Usuario existente = usuarioDao.consultarPorId(id);
            existente.setNombre(nombre);
            existente.setCorreo(correo);
            if (contrasena != null && !contrasena.isBlank()) existente.setContrasena(contrasena);
            existente.setIdRol(idRol);
            existente.setIdEstado(idEstado);
            exito = usuarioDao.actualizar(existente);
        } else {
            // INSERT
            if (contrasena == null || contrasena.isBlank()) {
                request.setAttribute("error", "La contraseña es obligatoria para nuevos usuarios.");
                request.getRequestDispatcher("/WEB-INF/views/usuario-form.jsp").forward(request, response);
                return;
            }
            Usuario nuevo = new Usuario(0, nombre, correo, contrasena, idRol, idEstado);
            exito = usuarioDao.insertar(nuevo);
        }

        request.setAttribute(exito ? "mensaje" : "error",
            exito ? "Usuario guardado correctamente." : "Error al guardar el usuario.");
        listarUsuarios(request, response);
    }

    // ─── Auxiliar ────────────────────────────────────────────────────────────

    private void listarUsuarios(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        List<Usuario> usuarios = usuarioDao.consultarTodos();
        request.setAttribute("usuarios", usuarios);
        request.getRequestDispatcher("/WEB-INF/views/usuarios.jsp").forward(request, response);
    }

    private boolean esAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        Usuario u = (Usuario) session.getAttribute("usuario");
        return u != null && u.getIdRol() == 1;
    }
}
