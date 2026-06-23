package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Empleado;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase EmpleadoDao
 * CRUD sobre la tabla 'empleados' con JOIN a usuarios para traer el nombre.
 * Paquete: co.acegrasco.dao
 */
public class EmpleadoDao {

    private final Connection conexion;

    public EmpleadoDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    /** INSERT */
    public boolean insertar(Empleado emp) {
        String sql = "INSERT INTO empleados " +
                     "(id_usuario, cedula, cargo, area, fecha_ingreso, salario, promedio_horas_extras) " +
                     "VALUES (?,?,?,?,?,?,?)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt       (1, emp.getIdUsuario());
            ps.setString    (2, emp.getCedula());
            ps.setString    (3, emp.getCargo());
            ps.setString    (4, emp.getArea());
            ps.setDate      (5, Date.valueOf(emp.getFechaIngreso()));
            ps.setBigDecimal(6, emp.getSalario());
            ps.setBigDecimal(7, emp.getPromedioHorasExtras());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error insertar empleado: " + e.getMessage());
            return false;
        }
    }

    /** SELECT ALL - incluye nombre del usuario mediante JOIN */
    public List<Empleado> consultarTodos() {
        List<Empleado> lista = new ArrayList<>();
        String sql = "SELECT e.id_empleado, e.id_usuario, u.nombre, e.cedula, e.cargo, e.area, " +
                     "e.fecha_ingreso, e.salario, e.promedio_horas_extras " +
                     "FROM empleados e " +
                     "JOIN usuarios u ON u.id_usuario = e.id_usuario " +
                     "ORDER BY e.id_empleado";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            System.err.println("Error consultarTodos empleados: " + e.getMessage());
        }
        return lista;
    }

    /** SELECT BY ID - incluye nombre del usuario */
    public Empleado consultarPorId(int idEmpleado) {
        String sql = "SELECT e.id_empleado, e.id_usuario, u.nombre, e.cedula, e.cargo, e.area, " +
                     "e.fecha_ingreso, e.salario, e.promedio_horas_extras " +
                     "FROM empleados e " +
                     "JOIN usuarios u ON u.id_usuario = e.id_usuario " +
                     "WHERE e.id_empleado = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error consultarPorId empleado: " + e.getMessage());
        }
        return null;
    }

    /** SELECT BY id_usuario - incluye nombre del usuario */
    public Empleado consultarPorUsuario(int idUsuario) {
        String sql = "SELECT e.id_empleado, e.id_usuario, u.nombre, e.cedula, e.cargo, e.area, " +
                     "e.fecha_ingreso, e.salario, e.promedio_horas_extras " +
                     "FROM empleados e " +
                     "JOIN usuarios u ON u.id_usuario = e.id_usuario " +
                     "WHERE e.id_usuario = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error consultarPorUsuario: " + e.getMessage());
        }
        return null;
    }

    /** UPDATE */
    public boolean actualizar(Empleado emp) {
        String sql = "UPDATE empleados SET cedula=?, cargo=?, area=?, fecha_ingreso=?, " +
                     "salario=?, promedio_horas_extras=? WHERE id_empleado=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString    (1, emp.getCedula());
            ps.setString    (2, emp.getCargo());
            ps.setString    (3, emp.getArea());
            ps.setDate      (4, Date.valueOf(emp.getFechaIngreso()));
            ps.setBigDecimal(5, emp.getSalario());
            ps.setBigDecimal(6, emp.getPromedioHorasExtras());
            ps.setInt       (7, emp.getIdEmpleado());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error actualizar empleado: " + e.getMessage());
            return false;
        }
    }

    /** DELETE */
    public boolean eliminar(int idEmpleado) {
        String sql = "DELETE FROM empleados WHERE id_empleado=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error eliminar empleado: " + e.getMessage());
            return false;
        }
    }

    /** Mapea ResultSet a Empleado (incluye nombre del usuario) */
    private Empleado mapear(ResultSet rs) throws SQLException {
        Empleado e = new Empleado();
        e.setIdEmpleado          (rs.getInt       ("id_empleado"));
        e.setIdUsuario           (rs.getInt       ("id_usuario"));
        e.setNombre              (rs.getString    ("nombre"));        // de usuarios
        e.setCedula              (rs.getString    ("cedula"));
        e.setCargo               (rs.getString    ("cargo"));
        e.setArea                (rs.getString    ("area"));
        e.setFechaIngreso        (rs.getDate      ("fecha_ingreso").toLocalDate());
        e.setSalario             (rs.getBigDecimal("salario"));
        e.setPromedioHorasExtras (rs.getBigDecimal("promedio_horas_extras"));
        return e;
    }
}
