package co.acegrasco.servlet.api;

import co.acegrasco.dao.CertificadoDao;
import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.dao.UsuarioDao;
import co.acegrasco.modelo.Certificado;
import co.acegrasco.modelo.Empleado;
import co.acegrasco.modelo.Usuario;
import co.acegrasco.util.GeneradorPdf;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet ApiCertificadosServlet
 * Expone endpoints REST para el módulo de certificados.
 * Consumido por el frontend React.
 *
 * GET  /api/certificados?idEmpleado=N  → historial de certificados del empleado
 * GET  /api/certificados               → todos los certificados (admin)
 * POST /api/certificados               → genera el PDF y lo devuelve como descarga
 *
 * Paquete: co.acegrasco.servlet.api
 */
@WebServlet(name = "ApiCertificadosServlet", urlPatterns = "/api/certificados")
public class ApiCertificadosServlet extends HttpServlet {

    private CertificadoDao certificadoDao;
    private EmpleadoDao    empleadoDao;
    private UsuarioDao     usuarioDao;

    @Override
    public void init() {
        this.certificadoDao = new CertificadoDao();
        this.empleadoDao    = new EmpleadoDao();
        this.usuarioDao     = new UsuarioDao();
    }

    /** Cabeceras CORS para React en puerto 3000 */
    private void configurarCabeceras(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        configurarCabeceras(res);
        res.setStatus(HttpServletResponse.SC_OK);
    }

    /**
     * GET /api/certificados?idEmpleado=N → historial del empleado
     * GET /api/certificados              → todos los certificados
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        configurarCabeceras(response);
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String idEmpParam = request.getParameter("idEmpleado");

        List<Certificado> lista = idEmpParam != null
            ? certificadoDao.consultarPorEmpleado(Integer.parseInt(idEmpParam))
            : certificadoDao.consultarTodos();

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            if (i > 0) sb.append(",");
            Certificado c = lista.get(i);
            sb.append(String.format(
                "{\"idCertificado\":%d,\"idEmpleado\":%d,\"idTipo\":%d," +
                "\"consecutivo\":%d,\"incluyeSueldo\":%b," +
                "\"fechaGeneracion\":\"%s\",\"canalEntrega\":\"%s\",\"archivoPdf\":\"%s\"}",
                c.getIdCertificado(), c.getIdEmpleado(), c.getIdTipo(),
                c.getConsecutivo(), c.isIncluyeSueldo(),
                c.getFechaGeneracion() != null ? c.getFechaGeneracion().toString() : "",
                c.getCanalEntrega() != null ? c.getCanalEntrega() : "pdf",
                c.getArchivoPdf()   != null ? c.getArchivoPdf()   : ""
            ));
        }
        sb.append("]");
        out.print(sb);
    }

    /**
     * POST /api/certificados
     * Body: {"idUsuario":2,"tipoCarta":"todos","canal":"pdf"}
     * Genera el PDF con iText y lo envía como descarga al navegador React.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");

        // Leer body JSON
        StringBuilder body = new StringBuilder();
        String linea;
        while ((linea = request.getReader().readLine()) != null) body.append(linea);
        String json = body.toString();

        try {
            int    idUsuario = Integer.parseInt(extraerCampo(json, "idUsuario"));
            String tipoCarta = extraerCampo(json, "tipoCarta");
            String canal     = extraerCampo(json, "canal");

            // Obtener empleado vinculado al usuario
            Empleado emp = empleadoDao.consultarPorUsuario(idUsuario);
            if (emp == null) {
                response.setContentType("application/json;charset=UTF-8");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().print("{\"error\":\"No se encontró perfil de empleado para este usuario.\"}");
                return;
            }

            // Nombre del empleado viene de la tabla usuarios
            Usuario usuario = usuarioDao.consultarPorId(idUsuario);
            String nombreEmpleado = usuario != null ? usuario.getNombre() : "Empleado";

            // Determinar id_tipo según el tipo de carta
            int idTipo = switch (tipoCarta) {
                case "sin_basico" -> 2;
                case "con_extras" -> 3;
                default           -> 1;
            };

            // Obtener consecutivo y registrar en BD
            int    consecutivo   = certificadoDao.siguienteConsecutivo();
            String nombreArchivo = String.format("CERT-%04d-%s.pdf", consecutivo, emp.getCedula());

            Certificado cert = new Certificado();
            cert.setIdEmpleado  (emp.getIdEmpleado());
            cert.setIdTipo      (idTipo);
            cert.setConsecutivo (consecutivo);
            cert.setIncluyeSueldo("todos".equals(tipoCarta));
            cert.setCanalEntrega(canal != null ? canal : "pdf");
            cert.setArchivoPdf  (nombreArchivo);
            certificadoDao.insertar(cert);

            if ("correo".equals(canal)) {
                // Simular envío por correo
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().print(String.format(
                    "{\"mensaje\":\"Certificado N.° %04d enviado al correo: %s\",\"consecutivo\":%d}",
                    consecutivo, usuario != null ? usuario.getCorreo() : "—", consecutivo
                ));
                return;
            }

            // Generar PDF con iText y enviarlo como descarga
            byte[] pdfBytes = GeneradorPdf.generar(tipoCarta, emp, nombreEmpleado, consecutivo);

            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + nombreArchivo + "\"");
            response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
            response.setContentLength(pdfBytes.length);

            try (OutputStream out = response.getOutputStream()) {
                out.write(pdfBytes);
            }

        } catch (Exception e) {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"error\":\"Error al generar el certificado: " + e.getMessage() + "\"}");
        }
    }

    /** Extrae el valor de un campo del JSON recibido como texto */
    private String extraerCampo(String json, String campo) {
        String buscar = "\"" + campo + "\"";
        int inicio = json.indexOf(buscar);
        if (inicio == -1) return "";
        inicio = json.indexOf(":", inicio) + 1;
        while (inicio < json.length() && json.charAt(inicio) == ' ') inicio++;
        if (json.charAt(inicio) == '"') {
            int fin = json.indexOf("\"", inicio + 1);
            return json.substring(inicio + 1, fin);
        } else {
            int fin = inicio;
            while (fin < json.length() && (Character.isDigit(json.charAt(fin))
                    || json.charAt(fin) == '-' || json.charAt(fin) == '.')) fin++;
            return json.substring(inicio, fin);
        }
    }
}
