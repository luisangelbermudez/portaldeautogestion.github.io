package com.acegrasco.dao;

import com.acegrasco.conexion.ConexionBaseDatos;
import com.acegrasco.modelo.Solicitud;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO para la entidad {@link Solicitud}.
 * Gestiona las operaciones CRUD sobre la tabla "solicitudes".
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class SolicitudDao {

    private final Connection conexion;

    private static final String SQL_INSERTAR =
            "INSERT INTO solicitudes (id_usuario, tipo_solicitud, descripcion) VALUES (?, ?, ?)";

    private static final String SQL_CONSULTAR_POR_ID =
            "SELECT s.id_solicitud, s.id_usuario, u.nombre_completo, s.tipo_solicitud, " +
            "s.descripcion, s.estado, s.fecha_creacion, s.fecha_actualizacion " +
            "FROM solicitudes s JOIN usuarios u ON s.id_usuario = u.id_usuario " +
            "WHERE s.id_solicitud = ?";

    private static final String SQL_CONSULTAR_TODAS =
            "SELECT s.id_solicitud, s.id_usuario, u.nombre_completo, s.tipo_solicitud, " +
            "s.descripcion, s.estado, s.fecha_creacion, s.fecha_actualizacion " +
            "FROM solicitudes s JOIN usuarios u ON s.id_usuario = u.id_usuario " +
            "ORDER BY s.fecha_creacion DESC";

    private static final String SQL_CONSULTAR_POR_USUARIO =
            "SELECT s.id_solicitud, s.id_usuario, u.nombre_completo, s.tipo_solicitud, " +
            "s.descripcion, s.estado, s.fecha_creacion, s.fecha_actualizacion " +
            "FROM solicitudes s JOIN usuarios u ON s.id_usuario = u.id_usuario " +
            "WHERE s.id_usuario = ? ORDER BY s.fecha_creacion DESC";

    private static final String SQL_ACTUALIZAR =
            "UPDATE solicitudes SET tipo_solicitud=?, descripcion=? WHERE id_solicitud=?";

    private static final String SQL_CAMBIAR_ESTADO =
            "UPDATE solicitudes SET estado=? WHERE id_solicitud=?";

    private static final String SQL_ELIMINAR =
            "DELETE FROM solicitudes WHERE id_solicitud=?";

    public SolicitudDao() {
        this.conexion = ConexionBaseDatos.obtenerInstancia().obtenerConexion();
    }

    // ════════════════════════════ INSERTAR ═══════════════════════════════════

    /**
     * Crea una nueva solicitud en la base de datos.
     *
     * @param solicitud objeto {@link Solicitud} con los datos a insertar
     * @return {@code true} si la creación fue exitosa
     */
    public boolean insertar(Solicitud solicitud) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_INSERTAR,
                Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, solicitud.getIdUsuario());
            ps.setString(2, solicitud.getTipoSolicitud());
            ps.setString(3, solicitud.getDescripcion());

            int filas = ps.executeUpdate();
            if (filas > 0) {
                try (ResultSet llave = ps.getGeneratedKeys()) {
                    if (llave.next()) solicitud.setIdSolicitud(llave.getInt(1));
                }
                resultado = true;
                System.out.println("✔ Solicitud creada. ID: " + solicitud.getIdSolicitud());
            }
        } catch (SQLException e) {
            System.err.println("✘ Error al insertar solicitud: " + e.getMessage());
        }
        return resultado;
    }

    // ════════════════════════ CONSULTAR POR ID ════════════════════════════════

    /**
     * Busca una solicitud por su ID con datos del usuario asociado.
     *
     * @param idSolicitud identificador de la solicitud
     * @return objeto {@link Solicitud} o {@code null}
     */
    public Solicitud consultarPorId(int idSolicitud) {
        Solicitud solicitud = null;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CONSULTAR_POR_ID)) {
            ps.setInt(1, idSolicitud);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) solicitud = mapearResultado(rs);
            }
        } catch (SQLException e) {
            System.err.println("✘ Error al consultar solicitud: " + e.getMessage());
        }
        return solicitud;
    }

    // ═════════════════════════ CONSULTAR TODAS ════════════════════════════════

    /**
     * Retorna todas las solicitudes (vista administrador).
     *
     * @return lista completa de {@link Solicitud}
     */
    public List<Solicitud> consultarTodas() {
        List<Solicitud> lista = new ArrayList<>();
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CONSULTAR_TODAS);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapearResultado(rs));
            System.out.println("✔ Total de solicitudes: " + lista.size());
        } catch (SQLException e) {
            System.err.println("✘ Error al consultar solicitudes: " + e.getMessage());
        }
        return lista;
    }

    /**
     * Retorna las solicitudes de un usuario específico.
     *
     * @param idUsuario ID del usuario
     * @return lista de solicitudes del usuario
     */
    public List<Solicitud> consultarPorUsuario(int idUsuario) {
        List<Solicitud> lista = new ArrayList<>();
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CONSULTAR_POR_USUARIO)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapearResultado(rs));
            }
        } catch (SQLException e) {
            System.err.println("✘ Error al consultar solicitudes por usuario: " + e.getMessage());
        }
        return lista;
    }

    // ══════════════════════════ ACTUALIZAR ════════════════════════════════════

    /**
     * Actualiza el tipo y descripción de una solicitud.
     *
     * @param solicitud objeto con los datos actualizados
     * @return {@code true} si la actualización fue exitosa
     */
    public boolean actualizar(Solicitud solicitud) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_ACTUALIZAR)) {
            ps.setString(1, solicitud.getTipoSolicitud());
            ps.setString(2, solicitud.getDescripcion());
            ps.setInt(3, solicitud.getIdSolicitud());
            resultado = ps.executeUpdate() > 0;
            if (resultado)
                System.out.println("✔ Solicitud ID " + solicitud.getIdSolicitud() + " actualizada.");
        } catch (SQLException e) {
            System.err.println("✘ Error al actualizar solicitud: " + e.getMessage());
        }
        return resultado;
    }

    /**
     * Cambia el estado de una solicitud (usado por el administrador).
     *
     * @param idSolicitud ID de la solicitud
     * @param nuevoEstado nuevo estado a asignar
     * @return {@code true} si el cambio fue exitoso
     */
    public boolean cambiarEstado(int idSolicitud, Solicitud.Estado nuevoEstado) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CAMBIAR_ESTADO)) {
            ps.setString(1, nuevoEstado.name());
            ps.setInt(2, idSolicitud);
            resultado = ps.executeUpdate() > 0;
            if (resultado)
                System.out.println("✔ Estado de solicitud ID " + idSolicitud + " → " + nuevoEstado);
        } catch (SQLException e) {
            System.err.println("✘ Error al cambiar estado: " + e.getMessage());
        }
        return resultado;
    }

    // ══════════════════════════ ELIMINAR ══════════════════════════════════════

    /**
     * Elimina físicamente una solicitud de la base de datos.
     *
     * @param idSolicitud ID de la solicitud a eliminar
     * @return {@code true} si la eliminación fue exitosa
     */
    public boolean eliminar(int idSolicitud) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_ELIMINAR)) {
            ps.setInt(1, idSolicitud);
            resultado = ps.executeUpdate() > 0;
            if (resultado) System.out.println("✔ Solicitud ID " + idSolicitud + " eliminada.");
        } catch (SQLException e) {
            System.err.println("✘ Error al eliminar solicitud: " + e.getMessage());
        }
        return resultado;
    }

    // ══════════════════════════ MAPEO ════════════════════════════════════════

    private Solicitud mapearResultado(ResultSet rs) throws SQLException {
        Solicitud s = new Solicitud(
                rs.getInt("id_solicitud"),
                rs.getInt("id_usuario"),
                rs.getString("tipo_solicitud"),
                rs.getString("descripcion"),
                Solicitud.Estado.valueOf(rs.getString("estado")),
                rs.getTimestamp("fecha_creacion"),
                rs.getTimestamp("fecha_actualizacion")
        );
        s.setNombreUsuario(rs.getString("nombre_completo"));
        return s;
    }
}
