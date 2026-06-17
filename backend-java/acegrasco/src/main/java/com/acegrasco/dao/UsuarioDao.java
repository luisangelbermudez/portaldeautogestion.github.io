package com.acegrasco.dao;

import com.acegrasco.conexion.ConexionBaseDatos;
import com.acegrasco.modelo.Usuario;
import com.acegrasco.util.Utilidades;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO para la entidad {@link Usuario}.
 * Operaciones CRUD + autenticación contra la tabla "usuarios".
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class UsuarioDao {

    private final Connection conexion;

    private static final String SQL_INSERTAR =
            "INSERT INTO usuarios (nombre_completo, correo, contrasena, rol) VALUES (?, ?, ?, ?)";

    private static final String SQL_CONSULTAR_POR_ID =
            "SELECT id_usuario, nombre_completo, correo, contrasena, rol, activo " +
            "FROM usuarios WHERE id_usuario = ?";

    private static final String SQL_CONSULTAR_TODOS =
            "SELECT id_usuario, nombre_completo, correo, contrasena, rol, activo " +
            "FROM usuarios WHERE activo = TRUE ORDER BY nombre_completo";

    private static final String SQL_ACTUALIZAR =
            "UPDATE usuarios SET nombre_completo=?, correo=?, rol=? WHERE id_usuario=?";

    private static final String SQL_CAMBIAR_CONTRASENA =
            "UPDATE usuarios SET contrasena=? WHERE id_usuario=?";

    private static final String SQL_ELIMINAR =
            "UPDATE usuarios SET activo=FALSE WHERE id_usuario=?";

    private static final String SQL_LOGIN =
            "SELECT id_usuario, nombre_completo, correo, contrasena, rol, activo " +
            "FROM usuarios WHERE correo=? AND contrasena=? AND activo=TRUE";

    public UsuarioDao() {
        this.conexion = ConexionBaseDatos.obtenerInstancia().obtenerConexion();
    }

    // ════════════════════════════ INSERTAR ═══════════════════════════════════

    /**
     * Registra un nuevo usuario. La contraseña se hashea antes de persistir.
     *
     * @param usuario objeto {@link Usuario} a registrar
     * @return {@code true} si el registro fue exitoso
     */
    public boolean insertar(Usuario usuario) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_INSERTAR,
                Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, usuario.getNombreCompleto());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, Utilidades.hashContrasena(usuario.getContrasena()));
            ps.setString(4, usuario.getRol() != null
                    ? usuario.getRol().name() : Usuario.Rol.USUARIO.name());

            int filas = ps.executeUpdate();
            if (filas > 0) {
                try (ResultSet llave = ps.getGeneratedKeys()) {
                    if (llave.next()) usuario.setIdUsuario(llave.getInt(1));
                }
                resultado = true;
                System.out.println("✔ Usuario registrado. ID: " + usuario.getIdUsuario());
            }
        } catch (SQLException e) {
            System.err.println("✘ Error al insertar usuario: " + e.getMessage());
        }
        return resultado;
    }

    // ════════════════════════ CONSULTAR POR ID ════════════════════════════════

    /**
     * Busca un usuario por su ID.
     *
     * @param idUsuario identificador del usuario
     * @return objeto {@link Usuario} o {@code null}
     */
    public Usuario consultarPorId(int idUsuario) {
        Usuario usuario = null;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CONSULTAR_POR_ID)) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) usuario = mapearResultado(rs);
            }
        } catch (SQLException e) {
            System.err.println("✘ Error al consultar usuario por ID: " + e.getMessage());
        }
        return usuario;
    }

    // ═════════════════════════ CONSULTAR TODOS ════════════════════════════════

    /**
     * Retorna todos los usuarios activos.
     *
     * @return lista de {@link Usuario}
     */
    public List<Usuario> consultarTodos() {
        List<Usuario> lista = new ArrayList<>();
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CONSULTAR_TODOS);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) lista.add(mapearResultado(rs));
            System.out.println("✔ Usuarios encontrados: " + lista.size());
        } catch (SQLException e) {
            System.err.println("✘ Error al consultar usuarios: " + e.getMessage());
        }
        return lista;
    }

    // ══════════════════════════ ACTUALIZAR ════════════════════════════════════

    /**
     * Actualiza nombre, correo y rol de un usuario.
     *
     * @param usuario objeto con los datos nuevos
     * @return {@code true} si la actualización fue exitosa
     */
    public boolean actualizar(Usuario usuario) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_ACTUALIZAR)) {
            ps.setString(1, usuario.getNombreCompleto());
            ps.setString(2, usuario.getCorreo());
            ps.setString(3, usuario.getRol().name());
            ps.setInt(4, usuario.getIdUsuario());
            resultado = ps.executeUpdate() > 0;
            if (resultado) System.out.println("✔ Usuario ID " + usuario.getIdUsuario() + " actualizado.");
        } catch (SQLException e) {
            System.err.println("✘ Error al actualizar usuario: " + e.getMessage());
        }
        return resultado;
    }

    /**
     * Cambia la contraseña de un usuario (se hashea automáticamente).
     *
     * @param idUsuario ID del usuario
     * @param nuevaContrasena contraseña en texto plano
     * @return {@code true} si el cambio fue exitoso
     */
    public boolean cambiarContrasena(int idUsuario, String nuevaContrasena) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_CAMBIAR_CONTRASENA)) {
            ps.setString(1, Utilidades.hashContrasena(nuevaContrasena));
            ps.setInt(2, idUsuario);
            resultado = ps.executeUpdate() > 0;
            if (resultado) System.out.println("✔ Contraseña actualizada para usuario ID: " + idUsuario);
        } catch (SQLException e) {
            System.err.println("✘ Error al cambiar contraseña: " + e.getMessage());
        }
        return resultado;
    }

    // ══════════════════════════ ELIMINAR ══════════════════════════════════════

    /**
     * Desactiva un usuario (eliminación lógica).
     *
     * @param idUsuario ID del usuario a desactivar
     * @return {@code true} si la operación fue exitosa
     */
    public boolean eliminar(int idUsuario) {
        boolean resultado = false;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_ELIMINAR)) {
            ps.setInt(1, idUsuario);
            resultado = ps.executeUpdate() > 0;
            if (resultado) System.out.println("✔ Usuario ID " + idUsuario + " desactivado.");
        } catch (SQLException e) {
            System.err.println("✘ Error al eliminar usuario: " + e.getMessage());
        }
        return resultado;
    }

    // ══════════════════════════ LOGIN ═════════════════════════════════════════

    /**
     * Autentica un usuario verificando correo y contraseña hasheada.
     *
     * @param correo     correo ingresado
     * @param contrasena contraseña en texto plano
     * @return objeto {@link Usuario} autenticado o {@code null}
     */
    public Usuario autenticar(String correo, String contrasena) {
        Usuario usuario = null;
        try (PreparedStatement ps = conexion.prepareStatement(SQL_LOGIN)) {
            ps.setString(1, correo);
            ps.setString(2, Utilidades.hashContrasena(contrasena));
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    usuario = mapearResultado(rs);
                    System.out.println("✔ Inicio de sesión exitoso: " + usuario.getNombreCompleto());
                }
            }
        } catch (SQLException e) {
            System.err.println("✘ Error en autenticación: " + e.getMessage());
        }
        return usuario;
    }

    // ══════════════════════════ MAPEO ════════════════════════════════════════

    private Usuario mapearResultado(ResultSet rs) throws SQLException {
        return new Usuario(
                rs.getInt("id_usuario"),
                rs.getString("nombre_completo"),
                rs.getString("correo"),
                rs.getString("contrasena"),
                Usuario.Rol.valueOf(rs.getString("rol")),
                rs.getBoolean("activo")
        );
    }
}
