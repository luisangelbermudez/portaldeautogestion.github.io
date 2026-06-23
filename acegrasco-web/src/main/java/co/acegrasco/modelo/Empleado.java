package co.acegrasco.modelo;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Clase Empleado - Mapea la tabla 'empleados' (incluye campo 'area').
 * Paquete: co.acegrasco.modelo
 */
public class Empleado {
    private int        idEmpleado;
    private int        idUsuario;
    private String     nombre;           // Viene de la tabla usuarios (JOIN)
    private String     cedula;
    private String     cargo;
    private String     area;
    private LocalDate  fechaIngreso;
    private BigDecimal salario;
    private BigDecimal promedioHorasExtras;

    public Empleado() {}

    public Empleado(int idEmpleado, int idUsuario, String cedula, String cargo, String area,
                    LocalDate fechaIngreso, BigDecimal salario, BigDecimal promedioHorasExtras) {
        this.idEmpleado          = idEmpleado;
        this.idUsuario           = idUsuario;
        this.cedula              = cedula;
        this.cargo               = cargo;
        this.area                = area;
        this.fechaIngreso        = fechaIngreso;
        this.salario             = salario;
        this.promedioHorasExtras = promedioHorasExtras;
    }

    public int        getIdEmpleado()                              { return idEmpleado; }
    public void       setIdEmpleado(int idEmpleado)                { this.idEmpleado = idEmpleado; }
    public int        getIdUsuario()                               { return idUsuario; }
    public void       setIdUsuario(int idUsuario)                  { this.idUsuario = idUsuario; }
    public String     getNombre()                                  { return nombre; }
    public void       setNombre(String nombre)                     { this.nombre = nombre; }
    public String     getCedula()                                  { return cedula; }
    public void       setCedula(String cedula)                     { this.cedula = cedula; }
    public String     getCargo()                                   { return cargo; }
    public void       setCargo(String cargo)                       { this.cargo = cargo; }
    public String     getArea()                                    { return area; }
    public void       setArea(String area)                         { this.area = area; }
    public LocalDate  getFechaIngreso()                            { return fechaIngreso; }
    public void       setFechaIngreso(LocalDate fechaIngreso)      { this.fechaIngreso = fechaIngreso; }
    public BigDecimal getSalario()                                 { return salario; }
    public void       setSalario(BigDecimal salario)               { this.salario = salario; }
    public BigDecimal getPromedioHorasExtras()                     { return promedioHorasExtras; }
    public void       setPromedioHorasExtras(BigDecimal v)         { this.promedioHorasExtras = v; }

    @Override
    public String toString() {
        return String.format("Empleado{id=%d, cedula='%s', cargo='%s', area='%s'}", idEmpleado, cedula, cargo, area);
    }
}
