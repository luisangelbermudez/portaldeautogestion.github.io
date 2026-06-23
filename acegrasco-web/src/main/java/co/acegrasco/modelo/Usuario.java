package co.acegrasco.modelo;

/**
 * Clase Usuario - Mapea la tabla 'usuarios'.
 * Paquete: co.acegrasco.modelo
 */
public class Usuario {
    private int    idUsuario;
    private String nombre;
    private String correo;
    private String contrasena;
    private int    idRol;
    private int    idEstado;

    public Usuario() {}

    public Usuario(int idUsuario, String nombre, String correo,
                   String contrasena, int idRol, int idEstado) {
        this.idUsuario  = idUsuario;
        this.nombre     = nombre;
        this.correo     = correo;
        this.contrasena = contrasena;
        this.idRol      = idRol;
        this.idEstado   = idEstado;
    }

    public int    getIdUsuario()                       { return idUsuario; }
    public void   setIdUsuario(int idUsuario)          { this.idUsuario = idUsuario; }
    public String getNombre()                          { return nombre; }
    public void   setNombre(String nombre)             { this.nombre = nombre; }
    public String getCorreo()                          { return correo; }
    public void   setCorreo(String correo)             { this.correo = correo; }
    public String getContrasena()                      { return contrasena; }
    public void   setContrasena(String contrasena)     { this.contrasena = contrasena; }
    public int    getIdRol()                           { return idRol; }
    public void   setIdRol(int idRol)                  { this.idRol = idRol; }
    public int    getIdEstado()                        { return idEstado; }
    public void   setIdEstado(int idEstado)            { this.idEstado = idEstado; }

    @Override
    public String toString() {
        return String.format("Usuario{id=%d, nombre='%s', correo='%s', idRol=%d}", idUsuario, nombre, correo, idRol);
    }
}
