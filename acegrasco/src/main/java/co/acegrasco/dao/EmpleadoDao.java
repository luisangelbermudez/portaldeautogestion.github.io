package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Empleado;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase EmpleadoDao
 * Implementa las operaciones CRUD sobre la tabla 'empleados'
 * utilizando JDBC con PreparedStatement.
 *
 * Paquete: co.acegrasco.dao
 */
public class EmpleadoDao {

    private final Connection conexion;

    public EmpleadoDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    // ─── INSERTAR ─────────────────────────────────────────────────────────────

    /**
     * Inserta un nuevo empleado en la base de datos.
     *
     * @param empleado objeto Empleado con los datos a insertar
     * @return true si se insertó correctamente
     */
    public boolean insertar(Empleado empleado) {
        String sql = "INSERT INTO empleados "
                + "(id_usuario, cedula, cargo, area, fecha_ingreso, salario, promedio_horas_extras) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt       (1, empleado.getIdUsuario());
            ps.setString    (2, empleado.getCedula());
            ps.setString    (3, empleado.getCargo());
            ps.setString    (4, empleado.getArea());
            ps.setDate      (5, Date.valueOf(empleado.getFechaIngreso()));
            ps.setBigDecimal(6, empleado.getSalario());
            ps.setBigDecimal(7, empleado.getPromedioHorasExtras());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al insertar empleado: " + e.getMessage());
            return false;
        }
    }

    // ─── CONSULTAR TODOS ──────────────────────────────────────────────────────

    /**
     * Consulta todos los empleados con su nombre de usuario.
     *
     * @return lista de objetos Empleado
     */
    public List<Empleado> consultarTodos() {
        List<Empleado> listaEmpleados = new ArrayList<>();
        String sql = "SELECT e.id_empleado, e.id_usuario, e.cedula, e.cargo, e.area, "
                + "e.fecha_ingreso, e.salario, e.promedio_horas_extras "
                + "FROM empleados e ORDER BY e.id_empleado";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                listaEmpleados.add(mapearEmpleado(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar empleados: " + e.getMessage());
        }
        return listaEmpleados;
    }

    // ─── CONSULTAR POR ID ─────────────────────────────────────────────────────

    /**
     * Consulta un empleado por su identificador.
     *
     * @param idEmpleado identificador del empleado
     * @return objeto Empleado o null si no existe
     */
    public Empleado consultarPorId(int idEmpleado) {
        String sql = "SELECT id_empleado, id_usuario, cedula, cargo, area, "
                + "fecha_ingreso, salario, promedio_horas_extras "
                + "FROM empleados WHERE id_empleado = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapearEmpleado(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar empleado: " + e.getMessage());
        }
        return null;
    }

    // ─── ACTUALIZAR ───────────────────────────────────────────────────────────

    /**
     * Actualiza los datos de un empleado existente.
     *
     * @param empleado objeto Empleado con datos actualizados
     * @return true si se actualizó correctamente
     */
    public boolean actualizar(Empleado empleado) {
        // CORRECCIÓN: El orden de los signos de interrogación debe coincidir exactamente con los setters de abajo.
        String sql = "UPDATE empleados SET cedula=?, cargo=?, area=?, fecha_ingreso=?, "
                + "salario=?, promedio_horas_extras=? WHERE id_empleado=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString    (1, empleado.getCedula());
            ps.setString    (2, empleado.getCargo());
            ps.setString    (3, empleado.getArea());
            ps.setDate      (4, Date.valueOf(empleado.getFechaIngreso()));
            ps.setBigDecimal(5, empleado.getSalario());
            ps.setBigDecimal(6, empleado.getPromedioHorasExtras());
            ps.setInt       (7, empleado.getIdEmpleado());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al actualizar empleado: " + e.getMessage());
            return false;
        }
    }

    // ─── ELIMINAR ─────────────────────────────────────────────────────────────

    /**
     * Elimina un empleado por su identificador.
     *
     * @param idEmpleado identificador del empleado a eliminar
     * @return true si se eliminó correctamente
     */
    public boolean eliminar(int idEmpleado) {
        String sql = "DELETE FROM empleados WHERE id_empleado = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idEmpleado);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al eliminar empleado: " + e.getMessage());
            return false;
        }
    }

    // ─── MÉTODO AUXILIAR ──────────────────────────────────────────────────────

    private Empleado mapearEmpleado(ResultSet rs) throws SQLException {
        return new Empleado(
                rs.getInt       ("id_empleado"),
                rs.getInt       ("id_usuario"),
                rs.getString    ("cedula"),
                rs.getString    ("cargo"),
                rs.getString    ("area"),
                rs.getDate      ("fecha_ingreso").toLocalDate(),
                rs.getBigDecimal("salario"),
                rs.getBigDecimal("promedio_horas_extras")
        );
    }
}
