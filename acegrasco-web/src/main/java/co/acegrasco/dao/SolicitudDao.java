package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Solicitud;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase SolicitudDao
 * CRUD sobre la tabla 'solicitudes'.
 * Paquete: co.acegrasco.dao
 */
public class SolicitudDao {

    private final Connection conexion;

    public SolicitudDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    /** INSERT - Estado inicial 3 (Pendiente). */
    public boolean insertar(Solicitud sol) {
        String sql = "INSERT INTO solicitudes (id_empleado, tipo_solicitud, descripcion, id_estado) VALUES (?,?,?,3)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt   (1, sol.getIdEmpleado());
            ps.setString(2, sol.getTipoSolicitud());
            ps.setString(3, sol.getDescripcion());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error insertar solicitud: " + e.getMessage());
            return false;
        }
    }

    /** SELECT ALL con nombre del empleado (JOIN). */
    public List<Solicitud> consultarTodas() {
        List<Solicitud> lista = new ArrayList<>();
        String sql = "SELECT s.id_solicitud, s.id_empleado, s.id_estado, s.tipo_solicitud, s.descripcion, s.fecha_creacion " +
                     "FROM solicitudes s ORDER BY s.fecha_creacion DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            System.err.println("Error consultar solicitudes: " + e.getMessage());
        }
        return lista;
    }

    /** SELECT BY empleado. */
    public List<Solicitud> consultarPorEmpleado(int idEmpleado) {
        List<Solicitud> lista = new ArrayList<>();
        String sql = "SELECT id_solicitud, id_empleado, id_estado, tipo_solicitud, descripcion, fecha_creacion " +
                     "FROM solicitudes WHERE id_empleado=? ORDER BY fecha_creacion DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error consultar solicitudes por empleado: " + e.getMessage());
        }
        return lista;
    }

    /** UPDATE estado. */
    public boolean actualizarEstado(int idSolicitud, int nuevoEstado) {
        String sql = "UPDATE solicitudes SET id_estado=? WHERE id_solicitud=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, nuevoEstado);
            ps.setInt(2, idSolicitud);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error actualizar estado: " + e.getMessage());
            return false;
        }
    }

    /** DELETE */
    public boolean eliminar(int idSolicitud) {
        String sql = "DELETE FROM solicitudes WHERE id_solicitud=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idSolicitud);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error eliminar solicitud: " + e.getMessage());
            return false;
        }
    }

    private Solicitud mapear(ResultSet rs) throws SQLException {
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
