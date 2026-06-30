package co.acegrasco.servlet.api;

import co.acegrasco.dao.SolicitudDao;
import co.acegrasco.modelo.Solicitud;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet ApiSolicitudesServlet
 * Expone endpoints REST en formato JSON para el módulo de solicitudes.
 *
 * GET    /api/solicitudes            → listar todas las solicitudes
 * GET    /api/solicitudes?id=N       → obtener solicitud por ID
 * GET    /api/solicitudes?empleado=N → obtener solicitudes por empleado
 * POST   /api/solicitudes            → insertar nueva solicitud
 * PUT    /api/solicitudes            → actualizar estado de solicitud
 * DELETE /api/solicitudes?id=N       → eliminar solicitud
 *
 * Paquete: co.acegrasco.servlet.api
 */
@WebServlet(name = "ApiSolicitudesServlet", urlPatterns = "/api/solicitudes")
public class ApiSolicitudesServlet extends HttpServlet {

    private SolicitudDao solicitudDao;

    @Override
    public void init() {
        this.solicitudDao = new SolicitudDao();
    }

    /** Configura cabeceras CORS y JSON para React */
    private void configurarCabeceras(HttpServletResponse response) {
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        configurarCabeceras(res);
        res.setStatus(HttpServletResponse.SC_OK);
    }

    /** GET: lista todas, filtra por empleado, o busca por ID */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        PrintWriter out = response.getWriter();

        String idParam       = request.getParameter("id");
        String empleadoParam = request.getParameter("empleado");

        if (idParam != null) {
            // Buscar por id_solicitud - recorremos la lista
            int idBuscado = Integer.parseInt(idParam);
            Solicitud encontrada = solicitudDao.consultarTodas().stream()
                    .filter(s -> s.getIdSolicitud() == idBuscado)
                    .findFirst().orElse(null);
            out.print(encontrada != null
                ? solicitudAJson(encontrada)
                : "{\"error\":\"Solicitud no encontrada\"}");

        } else if (empleadoParam != null) {
            // Filtrar por empleado
            List<Solicitud> lista = solicitudDao.consultarPorEmpleado(Integer.parseInt(empleadoParam));
            out.print(listaAJson(lista));

        } else {
            // Listar todas
            out.print(listaAJson(solicitudDao.consultarTodas()));
        }
    }

    /** POST: insertar nueva solicitud con estado Pendiente */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String json = leerBody(request);
        try {
            Solicitud nueva = new Solicitud();
            nueva.setIdEmpleado   (Integer.parseInt(extraerCampo(json, "idEmpleado")));
            nueva.setTipoSolicitud(extraerCampo(json, "tipoSolicitud"));
            nueva.setDescripcion  (extraerCampo(json, "descripcion"));

            boolean ok = solicitudDao.insertar(nueva);
            response.setStatus(ok ? HttpServletResponse.SC_CREATED : HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(ok
                ? "{\"mensaje\":\"Solicitud enviada correctamente. Estado: Pendiente\"}"
                : "{\"error\":\"No se pudo registrar la solicitud\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Datos inválidos: " + e.getMessage() + "\"}");
        }
    }

    /** PUT: actualizar estado de una solicitud */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String json = leerBody(request);
        try {
            int idSolicitud = Integer.parseInt(extraerCampo(json, "idSolicitud"));
            int nuevoEstado = Integer.parseInt(extraerCampo(json, "idEstado"));

            boolean ok = solicitudDao.actualizarEstado(idSolicitud, nuevoEstado);
            out.print(ok
                ? "{\"mensaje\":\"Estado actualizado correctamente\"}"
                : "{\"error\":\"No se pudo actualizar el estado\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Datos inválidos: " + e.getMessage() + "\"}");
        }
    }

    /** DELETE: eliminar solicitud por ID */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        PrintWriter out = response.getWriter();
        String idParam = request.getParameter("id");

        if (idParam == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Se requiere el parámetro id\"}");
            return;
        }

        boolean ok = solicitudDao.eliminar(Integer.parseInt(idParam));
        out.print(ok
            ? "{\"mensaje\":\"Solicitud eliminada correctamente\"}"
            : "{\"error\":\"No se pudo eliminar la solicitud\"}");
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    private String solicitudAJson(Solicitud s) {
        return String.format(
            "{\"idSolicitud\":%d,\"idEmpleado\":%d,\"idEstado\":%d," +
            "\"tipoSolicitud\":\"%s\",\"descripcion\":\"%s\",\"fechaCreacion\":\"%s\"}",
            s.getIdSolicitud(), s.getIdEmpleado(), s.getIdEstado(),
            escapar(s.getTipoSolicitud()),
            escapar(s.getDescripcion()),
            s.getFechaCreacion() != null ? s.getFechaCreacion().toString() : ""
        );
    }

    private String listaAJson(List<Solicitud> lista) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(solicitudAJson(lista.get(i)));
        }
        return sb.append("]").toString();
    }

    private String leerBody(HttpServletRequest request) throws IOException {
        StringBuilder body = new StringBuilder();
        String linea;
        while ((linea = request.getReader().readLine()) != null) body.append(linea);
        return body.toString();
    }

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

    private String escapar(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
