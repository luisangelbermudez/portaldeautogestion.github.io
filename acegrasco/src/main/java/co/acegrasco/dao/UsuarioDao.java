package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Usuario;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase UsuarioDao
 * Implementa las operaciones CRUD sobre la tabla 'usuarios'
 * utilizando JDBC con PreparedStatement para prevenir SQL Injection.
 *
 * Paquete: co.acegrasco.dao
 */
public class UsuarioDao {

    private final Connection conexion;

    /** Constructor: obtiene la conexión activa del Singleton. */
    public UsuarioDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    // ─── INSERTAR ─────────────────────────────────────────────────────────────

    /**
     * Inserta un nuevo usuario en la base de datos.
     *
     * @param usuario objeto Usuario con los datos a insertar
     * @return true si se insertó correctamente, false en caso contrario
     */
    public boolean insertar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nombre, correo, contrasena, id_rol, id_estado) "
                   + "VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getContrasena());
            ps.setInt   (4, usuario.getIdRol());
            ps.setInt   (5, usuario.getIdEstado());
            int filasAfectadas = ps.executeUpdate();
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("Error al insertar usuario: " + e.getMessage());
            return false;
        }
    }

    // ─── CONSULTAR TODOS ──────────────────────────────────────────────────────

    /**
     * Consulta todos los usuarios registrados en la base de datos.
     *
     * @return lista de objetos Usuario
     */
    public List<Usuario> consultarTodos() {
        List<Usuario> listaUsuarios = new ArrayList<>();
        String sql = "SELECT u.id_usuario, u.nombre, u.correo, u.contrasena, "
                   + "u.id_rol, u.id_estado "
                   + "FROM usuarios u ORDER BY u.id_usuario";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                listaUsuarios.add(mapearUsuario(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar usuarios: " + e.getMessage());
        }
        return listaUsuarios;
    }

    // ─── CONSULTAR POR ID ─────────────────────────────────────────────────────

    /**
     * Consulta un usuario por su identificador único.
     *
     * @param idUsuario identificador del usuario a buscar
     * @return objeto Usuario si existe, null si no se encuentra
     */
    public Usuario consultarPorId(int idUsuario) {
        String sql = "SELECT id_usuario, nombre, correo, contrasena, id_rol, id_estado "
                   + "FROM usuarios WHERE id_usuario = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapearUsuario(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar usuario por ID: " + e.getMessage());
        }
        return null;
    }

    // ─── ACTUALIZAR ───────────────────────────────────────────────────────────

    /**
     * Actualiza los datos de un usuario existente.
     *
     * @param usuario objeto Usuario con los datos actualizados (debe tener idUsuario)
     * @return true si se actualizó correctamente, false en caso contrario
     */
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE usuarios SET nombre=?, correo=?, contrasena=?, "
                   + "id_rol=?, id_estado=? WHERE id_usuario=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getContrasena());
            ps.setInt   (4, usuario.getIdRol());
            ps.setInt   (5, usuario.getIdEstado());
            ps.setInt   (6, usuario.getIdUsuario());
            int filasAfectadas = ps.executeUpdate();
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            return false;
        }
    }

    // ─── ELIMINAR ─────────────────────────────────────────────────────────────

    /**
     * Elimina un usuario de la base de datos por su identificador.
     *
     * @param idUsuario identificador del usuario a eliminar
     * @return true si se eliminó correctamente, false en caso contrario
     */
    public boolean eliminar(int idUsuario) {
        String sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            int filasAfectadas = ps.executeUpdate();
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("Error al eliminar usuario: " + e.getMessage());
            return false;
        }
    }

    // ─── MÉTODO AUXILIAR ──────────────────────────────────────────────────────

    /**
     * Mapea una fila del ResultSet a un objeto Usuario.
     *
     * @param rs ResultSet posicionado en la fila actual
     * @return objeto Usuario con los datos mapeados
     * @throws SQLException si ocurre un error al leer el ResultSet
     */
    private Usuario mapearUsuario(ResultSet rs) throws SQLException {
        return new Usuario(
            rs.getInt   ("id_usuario"),
            rs.getString("nombre"),
            rs.getString("correo"),
            rs.getString("contrasena"),
            rs.getInt   ("id_rol"),
            rs.getInt   ("id_estado")
        );
    }
}
