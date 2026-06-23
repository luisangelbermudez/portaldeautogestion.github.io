package co.acegrasco.servlet;

import co.acegrasco.dao.CertificadoDao;
import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.modelo.Certificado;
import co.acegrasco.modelo.Empleado;
import co.acegrasco.modelo.Usuario;
import co.acegrasco.util.GeneradorPdf;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.OutputStream;

/**
 * Servlet CertificadoServlet
 * GET  /certificados → pantalla selección de certificado
 * POST /certificados → genera PDF y lo descarga, o simula envío por correo
 *
 * Paquete: co.acegrasco.servlet
 */
@WebServlet(name = "CertificadoServlet", urlPatterns = "/certificados")
public class CertificadoServlet extends HttpServlet {

    private EmpleadoDao    empleadoDao;
    private CertificadoDao certificadoDao;

    @Override
    public void init() {
        this.empleadoDao    = new EmpleadoDao();
        this.certificadoDao = new CertificadoDao();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!haySession(request)) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        Usuario  usuario  = usuarioSesion(request);
        Empleado empleado = empleadoDao.consultarPorUsuario(usuario.getIdUsuario());

        request.setAttribute("empleado", empleado);
        request.setAttribute("misCertificados",
                empleado != null
                        ? certificadoDao.consultarPorEmpleado(empleado.getIdEmpleado())
                        : java.util.List.of());

        request.getRequestDispatcher("/WEB-INF/views/certificados.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        if (!haySession(request)) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        request.setCharacterEncoding("UTF-8");

        String tipoCarta = request.getParameter("tipoCarta");
        String canal     = request.getParameter("canal");

        if (tipoCarta == null || tipoCarta.isBlank()) {
            request.setAttribute("error", "Selecciona un tipo de certificado.");
            doGet(request, response);
            return;
        }

        Usuario  usuario  = usuarioSesion(request);
        Empleado empleado = empleadoDao.consultarPorUsuario(usuario.getIdUsuario());

        if (empleado == null) {
            request.setAttribute("error",
                "Tu perfil de empleado no está registrado. Contacta al administrador.");
            doGet(request, response);
            return;
        }

        // Nombre del empleado viene del usuario en sesión (tabla usuarios)
        String nombreEmpleado = usuario.getNombre();

        // id_tipo según el tipo de carta
        int idTipo = switch (tipoCarta) {
            case "sin_basico" -> 2;
            case "con_extras" -> 3;
            default           -> 1;
        };

        // Consecutivo y nombre del archivo
        int    consecutivo   = certificadoDao.siguienteConsecutivo();
        String nombreArchivo = String.format("CERT-%04d-%s.pdf", consecutivo,
                empleado.getCedula() != null ? empleado.getCedula() : "EMP");

        // Registrar en BD
        Certificado cert = new Certificado();
        cert.setIdEmpleado  (empleado.getIdEmpleado());
        cert.setIdTipo      (idTipo);
        cert.setConsecutivo (consecutivo);
        cert.setIncluyeSueldo("todos".equals(tipoCarta));
        cert.setCanalEntrega(canal != null ? canal : "pdf");
        cert.setArchivoPdf  (nombreArchivo);
        certificadoDao.insertar(cert);

        // Generar PDF pasando el nombre del empleado por separado
        byte[] pdfBytes;
        try {
            pdfBytes = GeneradorPdf.generar(tipoCarta, empleado, nombreEmpleado, consecutivo);
        } catch (Exception e) {
            request.setAttribute("error", "Error al generar el PDF: " + e.getMessage());
            doGet(request, response);
            return;
        }

        if ("correo".equals(canal)) {
            request.setAttribute("mensaje",
                "✅ Certificado N.° " + String.format("%04d", consecutivo) +
                " enviado al correo: " + usuario.getCorreo());
            doGet(request, response);
            return;
        }

        // Descargar PDF en el navegador
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"" + nombreArchivo + "\"");
        response.setContentLength(pdfBytes.length);
        try (OutputStream out = response.getOutputStream()) {
            out.write(pdfBytes);
        }
    }

    private boolean haySession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute("usuario") != null;
    }

    private Usuario usuarioSesion(HttpServletRequest request) {
        return (Usuario) request.getSession(false).getAttribute("usuario");
    }
}
