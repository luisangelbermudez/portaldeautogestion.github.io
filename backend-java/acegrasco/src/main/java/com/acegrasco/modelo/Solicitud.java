package com.acegrasco.modelo;

import java.sql.Timestamp;

/**
 * Entidad que representa una solicitud dentro del Portal de Autogestión.
 * Mapea la tabla "solicitudes" de la base de datos.
 *
 * @author [Tu nombre]
 * @version 1.0
 */
public class Solicitud {

    public enum Estado { PENDIENTE, EN_PROCESO, RESUELTA, CANCELADA }

    private int       idSolicitud;
    private int       idUsuario;
    private String    nombreUsuario;     // campo auxiliar para mostrar en vistas
    private String    tipoSolicitud;
    private String    descripcion;
    private Estado    estado;
    private Timestamp fechaCreacion;
    private Timestamp fechaActualizacion;

    public Solicitud() {}

    public Solicitud(int idUsuario, String tipoSolicitud, String descripcion) {
        this.idUsuario      = idUsuario;
        this.tipoSolicitud  = tipoSolicitud;
        this.descripcion    = descripcion;
        this.estado         = Estado.PENDIENTE;
    }

    public Solicitud(int idSolicitud, int idUsuario, String tipoSolicitud,
                     String descripcion, Estado estado,
                     Timestamp fechaCreacion, Timestamp fechaActualizacion) {
        this.idSolicitud         = idSolicitud;
        this.idUsuario           = idUsuario;
        this.tipoSolicitud       = tipoSolicitud;
        this.descripcion         = descripcion;
        this.estado              = estado;
        this.fechaCreacion       = fechaCreacion;
        this.fechaActualizacion  = fechaActualizacion;
    }

    // Getters y Setters
    public int getIdSolicitud()                         { return idSolicitud; }
    public void setIdSolicitud(int idSolicitud)         { this.idSolicitud = idSolicitud; }

    public int getIdUsuario()                           { return idUsuario; }
    public void setIdUsuario(int idUsuario)             { this.idUsuario = idUsuario; }

    public String getNombreUsuario()                    { return nombreUsuario; }
    public void setNombreUsuario(String v)              { this.nombreUsuario = v; }

    public String getTipoSolicitud()                    { return tipoSolicitud; }
    public void setTipoSolicitud(String v)              { this.tipoSolicitud = v; }

    public String getDescripcion()                      { return descripcion; }
    public void setDescripcion(String descripcion)      { this.descripcion = descripcion; }

    public Estado getEstado()                           { return estado; }
    public void setEstado(Estado estado)                { this.estado = estado; }

    public Timestamp getFechaCreacion()                 { return fechaCreacion; }
    public void setFechaCreacion(Timestamp v)           { this.fechaCreacion = v; }

    public Timestamp getFechaActualizacion()            { return fechaActualizacion; }
    public void setFechaActualizacion(Timestamp v)      { this.fechaActualizacion = v; }

    @Override
    public String toString() {
        return String.format("Solicitud{id=%d, tipo='%s', estado=%s, usuario=%d}",
                idSolicitud, tipoSolicitud, estado, idUsuario);
    }
}
