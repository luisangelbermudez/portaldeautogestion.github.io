package co.acegrasco.modelo;

import java.time.LocalDateTime;

/**
 * Clase Solicitud - Mapea la tabla 'solicitudes'.
 * Paquete: co.acegrasco.modelo
 */
public class Solicitud {
    private int           idSolicitud;
    private int           idEmpleado;
    private int           idEstado;
    private String        tipoSolicitud;
    private String        descripcion;
    private LocalDateTime fechaCreacion;

    public Solicitud() {}

    public Solicitud(int idSolicitud, int idEmpleado, int idEstado,
                     String tipoSolicitud, String descripcion, LocalDateTime fechaCreacion) {
        this.idSolicitud   = idSolicitud;
        this.idEmpleado    = idEmpleado;
        this.idEstado      = idEstado;
        this.tipoSolicitud = tipoSolicitud;
        this.descripcion   = descripcion;
        this.fechaCreacion = fechaCreacion;
    }

    public int           getIdSolicitud()                          { return idSolicitud; }
    public void          setIdSolicitud(int idSolicitud)           { this.idSolicitud = idSolicitud; }
    public int           getIdEmpleado()                           { return idEmpleado; }
    public void          setIdEmpleado(int idEmpleado)             { this.idEmpleado = idEmpleado; }
    public int           getIdEstado()                             { return idEstado; }
    public void          setIdEstado(int idEstado)                 { this.idEstado = idEstado; }
    public String        getTipoSolicitud()                        { return tipoSolicitud; }
    public void          setTipoSolicitud(String tipoSolicitud)    { this.tipoSolicitud = tipoSolicitud; }
    public String        getDescripcion()                          { return descripcion; }
    public void          setDescripcion(String descripcion)        { this.descripcion = descripcion; }
    public LocalDateTime getFechaCreacion()                        { return fechaCreacion; }
    public void          setFechaCreacion(LocalDateTime v)         { this.fechaCreacion = v; }

    @Override
    public String toString() {
        return String.format("Solicitud{id=%d, tipo='%s', estado=%d}", idSolicitud, tipoSolicitud, idEstado);
    }
}
