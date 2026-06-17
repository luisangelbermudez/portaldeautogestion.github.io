package com.acegrasco.modelo;

/**
 * Entidad que representa un usuario del Portal de Autogestión Acegrasco.
 * Mapea la tabla "usuarios" de la base de datos.
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class Usuario {

    public enum Rol { ADMIN, USUARIO }

    private int    idUsuario;
    private String nombreCompleto;
    private String correo;
    private String contrasena;      // almacenada como hash SHA-256
    private Rol    rol;
    private boolean activo;

    public Usuario() {}

    public Usuario(String nombreCompleto, String correo, String contrasena) {
        this.nombreCompleto = nombreCompleto;
        this.correo         = correo;
        this.contrasena     = contrasena;
        this.rol            = Rol.USUARIO;
        this.activo         = true;
    }

    public Usuario(int idUsuario, String nombreCompleto, String correo,
                   String contrasena, Rol rol, boolean activo) {
        this.idUsuario      = idUsuario;
        this.nombreCompleto = nombreCompleto;
        this.correo         = correo;
        this.contrasena     = contrasena;
        this.rol            = rol;
        this.activo         = activo;
    }

    // Getters y Setters
    public int getIdUsuario()                       { return idUsuario; }
    public void setIdUsuario(int idUsuario)         { this.idUsuario = idUsuario; }

    public String getNombreCompleto()               { return nombreCompleto; }
    public void setNombreCompleto(String v)         { this.nombreCompleto = v; }

    public String getCorreo()                       { return correo; }
    public void setCorreo(String correo)            { this.correo = correo; }

    public String getContrasena()                   { return contrasena; }
    public void setContrasena(String contrasena)    { this.contrasena = contrasena; }

    public Rol getRol()                             { return rol; }
    public void setRol(Rol rol)                     { this.rol = rol; }

    public boolean isActivo()                       { return activo; }
    public void setActivo(boolean activo)           { this.activo = activo; }

    @Override
    public String toString() {
        return String.format("Usuario{id=%d, nombre='%s', correo='%s', rol=%s}",
                idUsuario, nombreCompleto, correo, rol);
    }
}
