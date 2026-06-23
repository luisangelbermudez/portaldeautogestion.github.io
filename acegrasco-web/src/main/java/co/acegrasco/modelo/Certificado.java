package co.acegrasco.modelo;

import java.time.LocalDateTime;

/**
 * Clase Certificado - Mapea la tabla 'certificados'.
 * Paquete: co.acegrasco.modelo
 */
public class Certificado {
    private int           idCertificado;
    private int           idEmpleado;
    private int           idTipo;
    private int           consecutivo;
    private boolean       incluyeSueldo;
    private LocalDateTime fechaGeneracion;
    private String        canalEntrega;
    private String        archivoPdf;

    public Certificado() {}

    public int           getIdCertificado()                        { return idCertificado; }
    public void          setIdCertificado(int v)                   { this.idCertificado = v; }
    public int           getIdEmpleado()                           { return idEmpleado; }
    public void          setIdEmpleado(int v)                      { this.idEmpleado = v; }
    public int           getIdTipo()                               { return idTipo; }
    public void          setIdTipo(int v)                          { this.idTipo = v; }
    public int           getConsecutivo()                          { return consecutivo; }
    public void          setConsecutivo(int v)                     { this.consecutivo = v; }
    public boolean       isIncluyeSueldo()                         { return incluyeSueldo; }
    public void          setIncluyeSueldo(boolean v)               { this.incluyeSueldo = v; }
    public LocalDateTime getFechaGeneracion()                      { return fechaGeneracion; }
    public void          setFechaGeneracion(LocalDateTime v)       { this.fechaGeneracion = v; }
    public String        getCanalEntrega()                         { return canalEntrega; }
    public void          setCanalEntrega(String v)                 { this.canalEntrega = v; }
    public String        getArchivoPdf()                           { return archivoPdf; }
    public void          setArchivoPdf(String v)                   { this.archivoPdf = v; }
}
