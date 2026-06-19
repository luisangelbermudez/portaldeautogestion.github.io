package co.acegrasco.modelo;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Clase Empleado
 * Representa los datos laborales de un empleado de Acegrasco S.A.
 * Mapea la tabla 'empleados' de la base de datos.
 */
public class Empleado {

    // ─── Atributos ────────────────────────────────────────────────────────────
    private int        idEmpleado;
    private int        idUsuario;
    private String     cedula;
    private String     cargo;
    private String     area;
    private LocalDate  fechaIngreso;
    private BigDecimal salario;
    private BigDecimal promedioHorasExtras;

    // ─── Constructores ────────────────────────────────────────────────────────

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

    // ─── Getters y Setters ────────────────────────────────────────────────────

    public int        getIdEmpleado()                          { return idEmpleado; }
    public void       setIdEmpleado(int idEmpleado)            { this.idEmpleado = idEmpleado; }

    public int        getIdUsuario()                           { return idUsuario; }
    public void       setIdUsuario(int idUsuario)              { this.idUsuario = idUsuario; }

    public String     getCedula()                              { return cedula; }
    public void       setCedula(String cedula)                 { this.cedula = cedula; }

    public String     getCargo()                               { return cargo; }
    public void       setCargo(String cargo)                   { this.cargo = cargo; }

    public String     getArea()                                { return area; }
    public void       setArea(String area)                     { this.area = area; }

    public LocalDate  getFechaIngreso()                        { return fechaIngreso; }
    public void       setFechaIngreso(LocalDate fechaIngreso)  { this.fechaIngreso = fechaIngreso; }

    public BigDecimal getSalario()                             { return salario; }
    public void       setSalario(BigDecimal salario)           { this.salario = salario; }

    public BigDecimal getPromedioHorasExtras()                             { return promedioHorasExtras; }
    public void       setPromedioHorasExtras(BigDecimal promedioHorasExtras) { this.promedioHorasExtras = promedioHorasExtras; }

    // ─── toString ─────────────────────────────────────────────────────────────

    @Override
    public String toString() {
        return String.format(
            "Empleado{id=%d, cedula='%s', cargo='%s', area='%s', ingreso=%s, salario=%s, hExtras=%s}",
            idEmpleado, cedula, cargo, area, fechaIngreso, salario, promedioHorasExtras
        );
    }
}
