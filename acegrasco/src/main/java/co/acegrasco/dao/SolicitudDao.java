package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Solicitud;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase SolicitudDao
 * Implementa las operaciones CRUD sobre la tabla 'solicitudes'
 * utilizando JDBC con PreparedStatement.
 *
 * Paquete: co.acegrasco.dao
 */
public class SolicitudDao {

    private final Connection conexion;

    public SolicitudDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    // ─── INSERTAR ─────────────────────────────────────────────────────────────

    /**
     * Inserta una nueva solicitud en la base de datos.
     * El estado inicial siempre es 3 (Pendiente).
     *
     * @param solicitud objeto Solicitud con los datos a insertar
     * @return true si se insertó correctamente
     */
    public boolean insertar(Solicitud solicitud) {
        String sql = "INSERT INTO solicitudes (id_empleado, tipo_solicitud, descripcion, id_estado) "
                   + "VALUES (?, ?, ?, 3)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt   (1, solicitud.getIdEmpleado());
            ps.setString(2, solicitud.getTipoSolicitud());
            ps.setString(3, solicitud.getDescripcion());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al insertar solicitud: " + e.getMessage());
            return false;
        }
    }

    // ─── CONSULTAR TODAS ──────────────────────────────────────────────────────

    /**
     * Consulta todas las solicitudes registradas.
     *
     * @return lista de objetos Solicitud
     */
    public List<Solicitud> consultarTodas() {
        List<Solicitud> listaSolicitudes = new ArrayList<>();
        String sql = "SELECT s.id_solicitud, s.id_empleado, s.id_estado, "
                   + "s.tipo_solicitud, s.descripcion, s.fecha_creacion "
                   + "FROM solicitudes s ORDER BY s.fecha_creacion DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                listaSolicitudes.add(mapearSolicitud(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar solicitudes: " + e.getMessage());
        }
        return listaSolicitudes;
    }

    // ─── CONSULTAR POR EMPLEADO ───────────────────────────────────────────────

    /**
     * Consulta las solicitudes de un empleado específico.
     *
     * @param idEmpleado identificador del empleado
     * @return lista de solicitudes del empleado
     */
    public List<Solicitud> consultarPorEmpleado(int idEmpleado) {
        List<Solicitud> lista = new ArrayList<>();
        String sql = "SELECT id_solicitud, id_empleado, id_estado, "
                   + "tipo_solicitud, descripcion, fecha_creacion "
                   + "FROM solicitudes WHERE id_empleado = ? ORDER BY fecha_creacion DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapearSolicitud(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar solicitudes por empleado: " + e.getMessage());
        }
        return lista;
    }

    // ─── ACTUALIZAR ESTADO ────────────────────────────────────────────────────

    /**
     * Actualiza el estado de una solicitud (Pendiente → En revisión → Aprobado/Rechazado).
     *
     * @param idSolicitud identificador de la solicitud
     * @param nuevoEstado nuevo id_estado a asignar
     * @return true si se actualizó correctamente
     */
    public boolean actualizarEstado(int idSolicitud, int nuevoEstado) {
        String sql = "UPDATE solicitudes SET id_estado = ? WHERE id_solicitud = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, nuevoEstado);
            ps.setInt(2, idSolicitud);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al actualizar estado de solicitud: " + e.getMessage());
            return false;
        }
    }

    // ─── ELIMINAR ─────────────────────────────────────────────────────────────

    /**
     * Elimina una solicitud por su identificador.
     *
     * @param idSolicitud identificador de la solicitud a eliminar
     * @return true si se eliminó correctamente
     */
    public boolean eliminar(int idSolicitud) {
        String sql = "DELETE FROM solicitudes WHERE id_solicitud = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idSolicitud);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al eliminar solicitud: " + e.getMessage());
            return false;
        }
    }

    // ─── MÉTODO AUXILIAR ──────────────────────────────────────────────────────

    private Solicitud mapearSolicitud(ResultSet rs) throws SQLException {
        return new Solicitud(
            rs.getInt      ("id_solicitud"),
            rs.getInt      ("id_empleado"),
            rs.getInt      ("id_estado"),
            rs.getString   ("tipo_solicitud"),
            rs.getString   ("descripcion"),
            rs.getTimestamp("fecha_creacion").toLocalDateTime()
        );
    }
}
