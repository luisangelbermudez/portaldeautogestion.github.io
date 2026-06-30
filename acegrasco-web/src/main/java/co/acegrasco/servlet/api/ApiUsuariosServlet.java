package co.acegrasco.servlet.api;

import co.acegrasco.dao.UsuarioDao;
import co.acegrasco.modelo.Usuario;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet ApiUsuariosServlet
 * Expone endpoints REST en formato JSON para ser consumidos por React.
 *
 * GET    /api/usuarios         → listar todos los usuarios
 * GET    /api/usuarios?id=N    → obtener usuario por ID
 * POST   /api/usuarios         → insertar nuevo usuario (body JSON)
 * PUT    /api/usuarios         → actualizar usuario (body JSON)
 * DELETE /api/usuarios?id=N    → eliminar usuario por ID
 *
 * Paquete: co.acegrasco.servlet.api
 */
@WebServlet(name = "ApiUsuariosServlet", urlPatterns = "/api/usuarios")
public class ApiUsuariosServlet extends HttpServlet {

    private UsuarioDao usuarioDao;

    @Override
    public void init() {
        this.usuarioDao = new UsuarioDao();
    }

    // ─── Cabeceras CORS y JSON ────────────────────────────────────────────────

    /**
     * Configura las cabeceras para permitir peticiones desde React (CORS)
     * y establece el tipo de respuesta como JSON.
     */
    private void configurarCabeceras(HttpServletResponse response) {
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    /** Maneja la solicitud pre-flight OPTIONS que hace el navegador antes de CORS */
    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        configurarCabeceras(res);
        res.setStatus(HttpServletResponse.SC_OK);
    }

    // ─── GET: listar o buscar por ID ─────────────────────────────────────────

    /**
     * GET /api/usuarios        → JSON con lista de todos los usuarios
     * GET /api/usuarios?id=N   → JSON con un usuario por ID
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        configurarCabeceras(response);
        PrintWriter out = response.getWriter();
        String idParam = request.getParameter("id");

        if (idParam != null) {
            // Buscar usuario por ID
            int id = Integer.parseInt(idParam);
            Usuario u = usuarioDao.consultarPorId(id);
            if (u != null) {
                out.print(usuarioAJson(u));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Usuario no encontrado\"}");
            }
        } else {
            // Listar todos los usuarios
            List<Usuario> usuarios = usuarioDao.consultarTodos();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < usuarios.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(usuarioAJson(usuarios.get(i)));
            }
            sb.append("]");
            out.print(sb);
        }
    }

    // ─── POST: insertar nuevo usuario ────────────────────────────────────────

    /**
     * POST /api/usuarios
     * Body esperado: {"nombre":"...","correo":"...","contrasena":"...","idRol":2,"idEstado":1}
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Leer body JSON manualmente
        StringBuilder body = new StringBuilder();
        String linea;
        while ((linea = request.getReader().readLine()) != null) {
            body.append(linea);
        }

        String json = body.toString();
        try {
            // Parsear campos del JSON
            String nombre    = extraerCampo(json, "nombre");
            String correo    = extraerCampo(json, "correo");
            String contrasena = extraerCampo(json, "contrasena");
            int    idRol     = Integer.parseInt(extraerCampo(json, "idRol"));
            int    idEstado  = Integer.parseInt(extraerCampo(json, "idEstado"));

            if (nombre.isEmpty() || correo.isEmpty() || contrasena.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Nombre, correo y contraseña son obligatorios\"}");
                return;
            }

            Usuario nuevo = new Usuario(0, nombre, correo, contrasena, idRol, idEstado);
            boolean ok = usuarioDao.insertar(nuevo);

            if (ok) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                out.print("{\"mensaje\":\"Usuario creado correctamente\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"No se pudo crear el usuario\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Datos inválidos: " + e.getMessage() + "\"}");
        }
    }

    // ─── PUT: actualizar usuario ──────────────────────────────────────────────

    /**
     * PUT /api/usuarios
     * Body esperado: {"idUsuario":1,"nombre":"...","correo":"...","idRol":1,"idEstado":1}
     */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        configurarCabeceras(response);
        request.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        StringBuilder body = new StringBuilder();
        String linea;
        while ((linea = request.getReader().readLine()) != null) {
            body.append(linea);
        }

        String json = body.toString();
        try {
            int    idUsuario = Integer.parseInt(extraerCampo(json, "idUsuario"));
            String nombre    = extraerCampo(json, "nombre");
            String correo    = extraerCampo(json, "correo");
            int    idRol     = Integer.parseInt(extraerCampo(json, "idRol"));
            int    idEstado  = Integer.parseInt(extraerCampo(json, "idEstado"));

            Usuario existente = usuarioDao.consultarPorId(idUsuario);
            if (existente == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"error\":\"Usuario no encontrado\"}");
                return;
            }

            existente.setNombre(nombre);
            existente.setCorreo(correo);
            existente.setIdRol(idRol);
            existente.setIdEstado(idEstado);

            // Actualizar contraseña solo si viene en el body
            String contrasena = extraerCampo(json, "contrasena");
            if (!contrasena.isEmpty()) existente.setContrasena(contrasena);

            boolean ok = usuarioDao.actualizar(existente);
            out.print(ok
                ? "{\"mensaje\":\"Usuario actualizado correctamente\"}"
                : "{\"error\":\"No se pudo actualizar el usuario\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Datos inválidos: " + e.getMessage() + "\"}");
        }
    }

    // ─── DELETE: eliminar usuario ─────────────────────────────────────────────

    /**
     * DELETE /api/usuarios?id=N
     */
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

        int id = Integer.parseInt(idParam);
        boolean ok = usuarioDao.eliminar(id);
        out.print(ok
            ? "{\"mensaje\":\"Usuario eliminado correctamente\"}"
            : "{\"error\":\"No se pudo eliminar el usuario\"}");
    }

    // ─── Utilidades ──────────────────────────────────────────────────────────

    /**
     * Convierte un objeto Usuario a cadena JSON.
     */
    private String usuarioAJson(Usuario u) {
        return String.format(
            "{\"idUsuario\":%d,\"nombre\":\"%s\",\"correo\":\"%s\",\"idRol\":%d,\"idEstado\":%d}",
            u.getIdUsuario(),
            escapar(u.getNombre()),
            escapar(u.getCorreo()),
            u.getIdRol(),
            u.getIdEstado()
        );
    }

    /**
     * Extrae el valor de un campo del JSON recibido como texto.
     * Ejemplo: extraerCampo("{\"nombre\":\"Juan\"}", "nombre") → "Juan"
     */
    private String extraerCampo(String json, String campo) {
        String buscar = "\"" + campo + "\"";
        int inicio = json.indexOf(buscar);
        if (inicio == -1) return "";
        inicio = json.indexOf(":", inicio) + 1;
        // Saltar espacios
        while (inicio < json.length() && json.charAt(inicio) == ' ') inicio++;

        if (json.charAt(inicio) == '"') {
            // Valor string
            int fin = json.indexOf("\"", inicio + 1);
            return json.substring(inicio + 1, fin);
        } else {
            // Valor numérico
            int fin = inicio;
            while (fin < json.length() && (Character.isDigit(json.charAt(fin)) || json.charAt(fin) == '-')) fin++;
            return json.substring(inicio, fin);
        }
    }

    /** Escapa caracteres especiales para JSON seguro. */
    private String escapar(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
