package co.acegrasco.dao;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.modelo.Usuario;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase UsuarioDao
 * CRUD sobre la tabla 'usuarios' con PreparedStatement.
 * Paquete: co.acegrasco.dao
 */
public class UsuarioDao {

    private final Connection conexion;

    public UsuarioDao() {
        this.conexion = Conexion.obtenerInstancia().obtenerConexion();
    }

    /** INSERT - Inserta un nuevo usuario. */
    public boolean insertar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nombre, correo, contrasena, id_rol, id_estado) VALUES (?,?,?,?,?)";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getContrasena());
            ps.setInt   (4, usuario.getIdRol());
            ps.setInt   (5, usuario.getIdEstado());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error insertar usuario: " + e.getMessage());
            return false;
        }
    }

    /** SELECT ALL - Consulta todos los usuarios. */
    public List<Usuario> consultarTodos() {
        List<Usuario> lista = new ArrayList<>();
        String sql = "SELECT id_usuario, nombre, correo, contrasena, id_rol, id_estado FROM usuarios ORDER BY id_usuario";
        try (PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (SQLException e) {
            System.err.println("Error consultar usuarios: " + e.getMessage());
        }
        return lista;
    }

    /** SELECT BY ID - Consulta usuario por ID. */
    public Usuario consultarPorId(int idUsuario) {
        String sql = "SELECT id_usuario, nombre, correo, contrasena, id_rol, id_estado FROM usuarios WHERE id_usuario=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error consultar usuario por ID: " + e.getMessage());
        }
        return null;
    }

    /** SELECT BY correo+contraseña - Para autenticación. */
    public Usuario autenticar(String correo, String contrasena) {
        String sql = "SELECT id_usuario, nombre, correo, contrasena, id_rol, id_estado " +
                     "FROM usuarios WHERE correo=? AND contrasena=? AND id_estado=1";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString(1, correo);
            ps.setString(2, contrasena);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapear(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error autenticar: " + e.getMessage());
        }
        return null;
    }

    /** UPDATE - Actualiza un usuario existente. */
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE usuarios SET nombre=?, correo=?, contrasena=?, id_rol=?, id_estado=? WHERE id_usuario=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getContrasena());
            ps.setInt   (4, usuario.getIdRol());
            ps.setInt   (5, usuario.getIdEstado());
            ps.setInt   (6, usuario.getIdUsuario());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error actualizar usuario: " + e.getMessage());
            return false;
        }
    }

    /** DELETE - Elimina un usuario por ID. */
    public boolean eliminar(int idUsuario) {
        String sql = "DELETE FROM usuarios WHERE id_usuario=?";
        try (PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error eliminar usuario: " + e.getMessage());
            return false;
        }
    }

    private Usuario mapear(ResultSet rs) throws SQLException {
        return new Usuario(
            rs.getInt("id_usuario"), rs.getString("nombre"), rs.getString("correo"),
            rs.getString("contrasena"), rs.getInt("id_rol"), rs.getInt("id_estado")
        );
    }
}
