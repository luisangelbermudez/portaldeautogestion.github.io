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

/**
 * Servlet LoginServlet
 * Maneja la autenticación del usuario.
 * GET  → muestra el formulario de login (index.jsp)
 * POST → valida credenciales y redirige según rol
 *
 * Paquete: co.acegrasco.servlet
 */
@WebServlet(name = "LoginServlet", urlPatterns = {"/login", ""})
public class LoginServlet extends HttpServlet {

    /**
     * GET: muestra el formulario de inicio de sesión.
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Si ya hay sesión activa, redirigir al dashboard correspondiente
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("usuario") != null) {
            Usuario u = (Usuario) session.getAttribute("usuario");
            response.sendRedirect(u.getIdRol() == 1
                ? request.getContextPath() + "/admin/dashboard"
                : request.getContextPath() + "/empleado/dashboard");
            return;
        }

        request.getRequestDispatcher("/index.jsp").forward(request, response);
    }

    /**
     * POST: procesa el formulario de login.
     * Parámetros esperados: correo, contrasena
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String correo    = request.getParameter("correo");
        String contrasena = request.getParameter("contrasena");

        // Validar que los campos no estén vacíos
        if (correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            request.setAttribute("error", "Por favor complete todos los campos.");
            request.getRequestDispatcher("/index.jsp").forward(request, response);
            return;
        }

        // Autenticar contra la base de datos
        UsuarioDao usuarioDao = new UsuarioDao();
        Usuario usuario = usuarioDao.autenticar(correo.trim(), contrasena.trim());

        if (usuario == null) {
            request.setAttribute("error", "Correo o contraseña incorrectos.");
            request.getRequestDispatcher("/index.jsp").forward(request, response);
            return;
        }

        // Crear sesión y guardar el usuario autenticado
        HttpSession session = request.getSession(true);
        session.setAttribute("usuario", usuario);
        session.setMaxInactiveInterval(30 * 60); // 30 minutos

        // Redirigir según el rol: 1=Admin, 2=Empleado
        if (usuario.getIdRol() == 1) {
            response.sendRedirect(request.getContextPath() + "/admin/dashboard");
        } else {
            response.sendRedirect(request.getContextPath() + "/empleado/dashboard");
        }
    }
}
