package co.acegrasco.servlet.api;

import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.modelo.Empleado;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Servlet ApiEmpleadosServlet
 * Expone endpoints REST en formato JSON para el módulo de empleados.
 *
 * GET    /api/empleados         → listar todos los empleados
 * GET    /api/empleados?id=N    → obtener empleado por ID
 * POST   /api/empleados         → insertar nuevo empleado
 * PUT    /api/empleados         → actualizar empleado
 * DELETE /api/empleados?id=N    → eliminar empleado
 *
 * Paquete: co.acegrasco.servlet.api
 */
@WebServlet(name = "ApiEmpleadosServlet", urlPatterns = "/api/empleados")
public class ApiEmpleadosServlet extends HttpServlet {

    private EmpleadoDao empleadoDao;

    @Override
    public void init() {
        this.empleadoDao = new EmpleadoDao();
    }

    /** Configura cabeceras CORS y JSON */
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

    /** GET: lista todos o busca por ID */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        PrintWriter out = response.getWriter();
        String idParam = request.getParameter("id");

        if (idParam != null) {
            Empleado e = empleadoDao.consultarPorId(Integer.parseInt(idParam));
            out.print(e != null ? empleadoAJson(e) : "{\"error\":\"Empleado no encontrado\"}");
        } else {
            List<Empleado> lista = empleadoDao.consultarTodos();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < lista.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(empleadoAJson(lista.get(i)));
            }
            sb.append("]");
            out.print(sb);
        }
    }

    /** POST: insertar nuevo empleado */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String json = leerBody(request);
        try {
            Empleado nuevo = new Empleado();
            nuevo.setIdUsuario          (Integer.parseInt(extraerCampo(json, "idUsuario")));
            nuevo.setCedula             (extraerCampo(json, "cedula"));
            nuevo.setCargo              (extraerCampo(json, "cargo"));
            nuevo.setArea               (extraerCampo(json, "area"));
            nuevo.setFechaIngreso       (LocalDate.parse(extraerCampo(json, "fechaIngreso")));
            nuevo.setSalario            (new BigDecimal(extraerCampo(json, "salario")));
            nuevo.setPromedioHorasExtras(new BigDecimal(extraerCampo(json, "promedioHorasExtras")));

            boolean ok = empleadoDao.insertar(nuevo);
            response.setStatus(ok ? HttpServletResponse.SC_CREATED : HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print(ok
                ? "{\"mensaje\":\"Empleado registrado correctamente\"}"
                : "{\"error\":\"No se pudo registrar el empleado\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Datos inválidos: " + e.getMessage() + "\"}");
        }
    }

    /** PUT: actualizar empleado */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String json = leerBody(request);
        try {
            int idEmpleado = Integer.parseInt(extraerCampo(json, "idEmpleado"));
            Empleado existente = empleadoDao.consultarPorId(idEmpleado);

            if (existente == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Empleado no encontrado\"}");
                return;
            }

            existente.setCedula             (extraerCampo(json, "cedula"));
            existente.setCargo              (extraerCampo(json, "cargo"));
            existente.setArea               (extraerCampo(json, "area"));
            existente.setFechaIngreso       (LocalDate.parse(extraerCampo(json, "fechaIngreso")));
            existente.setSalario            (new BigDecimal(extraerCampo(json, "salario")));
            existente.setPromedioHorasExtras(new BigDecimal(extraerCampo(json, "promedioHorasExtras")));

            boolean ok = empleadoDao.actualizar(existente);
            out.print(ok
                ? "{\"mensaje\":\"Empleado actualizado correctamente\"}"
                : "{\"error\":\"No se pudo actualizar el empleado\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Datos inválidos: " + e.getMessage() + "\"}");
        }
    }

    /** DELETE: eliminar empleado */
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

        boolean ok = empleadoDao.eliminar(Integer.parseInt(idParam));
        out.print(ok
            ? "{\"mensaje\":\"Empleado eliminado correctamente\"}"
            : "{\"error\":\"No se pudo eliminar el empleado\"}");
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    private String empleadoAJson(Empleado e) {
        return String.format(
            "{\"idEmpleado\":%d,\"idUsuario\":%d,\"nombre\":\"%s\",\"cedula\":\"%s\"," +
            "\"cargo\":\"%s\",\"area\":\"%s\",\"fechaIngreso\":\"%s\"," +
            "\"salario\":%s,\"promedioHorasExtras\":%s}",
            e.getIdEmpleado(), e.getIdUsuario(),
            escapar(e.getNombre()), escapar(e.getCedula()),
            escapar(e.getCargo()), escapar(e.getArea()),
            e.getFechaIngreso(),
            e.getSalario(), e.getPromedioHorasExtras()
        );
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
