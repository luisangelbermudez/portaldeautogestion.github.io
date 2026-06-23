package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Certificado;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase CertificadoDao
 * CRUD sobre la tabla 'certificados'.
 * Paquete: co.acegrasco.dao
 */
public class CertificadoDao {

    private final Connection conexion;

    public CertificadoDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    /** Obtiene el siguiente consecutivo disponible. */
    public int siguienteConsecutivo() {
        String sql = "SELECT IFNULL(MAX(consecutivo), 0) + 1 FROM certificados";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.err.println("Error consecutivo: " + e.getMessage());
        }
        return 1;
    }

    /** INSERT - Registra un nuevo certificado generado. */
    public boolean insertar(Certificado cert) {
        String sql = "INSERT INTO certificados (id_empleado, id_tipo, consecutivo, incluye_sueldo, canal_entrega, archivo_pdf) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt    (1, cert.getIdEmpleado());
            ps.setInt    (2, cert.getIdTipo());
            ps.setInt    (3, cert.getConsecutivo());
            ps.setBoolean(4, cert.isIncluyeSueldo());
            ps.setString (5, cert.getCanalEntrega());
            ps.setString (6, cert.getArchivoPdf());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error insertar certificado: " + e.getMessage());
            return false;
        }
    }

    /** SELECT por empleado. */
    public List<Certificado> consultarPorEmpleado(int idEmpleado) {
        List<Certificado> lista = new ArrayList<>();
        String sql = "SELECT id_certificado, id_empleado, id_tipo, consecutivo, incluye_sueldo, " +
                     "fecha_generacion, canal_entrega, archivo_pdf " +
                     "FROM certificados WHERE id_empleado = ? ORDER BY consecutivo DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error consultar certificados: " + e.getMessage());
        }
        return lista;
    }

    /** SELECT todos (para administrador). */
    public List<Certificado> consultarTodos() {
        List<Certificado> lista = new ArrayList<>();
        String sql = "SELECT id_certificado, id_empleado, id_tipo, consecutivo, incluye_sueldo, " +
                     "fecha_generacion, canal_entrega, archivo_pdf FROM certificados ORDER BY consecutivo DESC";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            System.err.println("Error consultar todos: " + e.getMessage());
        }
        return lista;
    }

    private Certificado mapear(ResultSet rs) throws SQLException {
        Certificado c = new Certificado();
        c.setIdCertificado(rs.getInt("id_certificado"));
        c.setIdEmpleado   (rs.getInt("id_empleado"));
        c.setIdTipo       (rs.getInt("id_tipo"));
        c.setConsecutivo  (rs.getInt("consecutivo"));
        c.setIncluyeSueldo(rs.getBoolean("incluye_sueldo"));
        c.setFechaGeneracion(rs.getTimestamp("fecha_generacion").toLocalDateTime());
        c.setCanalEntrega (rs.getString("canal_entrega"));
        c.setArchivoPdf   (rs.getString("archivo_pdf"));
        return c;
    }
}
