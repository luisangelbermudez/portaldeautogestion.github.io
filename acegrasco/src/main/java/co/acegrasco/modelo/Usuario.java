package co.acegrasco.modelo;

/**
 * Clase Usuario
 * Representa un usuario del sistema Portal de Autogestión Acegrasco S.A.
 * Mapea la tabla 'usuarios' de la base de datos.
 */
public class Usuario {

    // ─── Atributos ────────────────────────────────────────────────────────────
    private int    idUsuario;
    private String nombre;
    private String correo;
    private String contrasena;
    private int    idRol;
    private int    idEstado;

    // ─── Constructores ────────────────────────────────────────────────────────

    /** Constructor vacío requerido para instanciación genérica. */
    public Usuario() {}

    /**
     * Constructor completo.
     *
     * @param idUsuario  identificador único del usuario
     * @param nombre     nombre completo
     * @param correo     correo electrónico (único)
     * @param contrasena contraseña del usuario
     * @param idRol      referencia al rol asignado
     * @param idEstado   referencia al estado (Activo/Inactivo)
     */
    public Usuario(int idUsuario, String nombre, String correo,
                   String contrasena, int idRol, int idEstado) {
        this.idUsuario  = idUsuario;
        this.nombre     = nombre;
        this.correo     = correo;
        this.contrasena = contrasena;
        this.idRol      = idRol;
        this.idEstado   = idEstado;
    }

    // ─── Getters y Setters ────────────────────────────────────────────────────

    public int    getIdUsuario()           { return idUsuario; }
    public void   setIdUsuario(int id)     { this.idUsuario = id; }

    public String getNombre()              { return nombre; }
    public void   setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo()              { return correo; }
    public void   setCorreo(String correo) { this.correo = correo; }

    public String getContrasena()                    { return contrasena; }
    public void   setContrasena(String contrasena)   { this.contrasena = contrasena; }

    public int    getIdRol()               { return idRol; }
    public void   setIdRol(int idRol)      { this.idRol = idRol; }

    public int    getIdEstado()            { return idEstado; }
    public void   setIdEstado(int idEstado){ this.idEstado = idEstado; }

    // ─── toString ─────────────────────────────────────────────────────────────

    @Override
    public String toString() {
        return String.format(
            "Usuario{id=%d, nombre='%s', correo='%s', idRol=%d, idEstado=%d}",
            idUsuario, nombre, correo, idRol, idEstado
        );
    }
}
