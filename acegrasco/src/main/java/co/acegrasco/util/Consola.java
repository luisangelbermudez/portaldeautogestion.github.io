package co.acegrasco.util;

import co.acegrasco.modelo.Empleado;
import co.acegrasco.modelo.Solicitud;
import co.acegrasco.modelo.Usuario;

import java.util.List;

/**
 * Clase Consola
 * Utilidades para mostrar datos formateados en la consola.
 * Centraliza la presentación de tablas y mensajes del sistema.
 *
 * Paquete: co.acegrasco.util
 */
public class Consola {

    private static final String LINEA  = "─".repeat(80);
    private static final String LINEA2 = "═".repeat(80);

    /** Imprime una línea separadora simple. */
    public static void separador()  { System.out.println(LINEA); }

    /** Imprime una línea separadora doble (para títulos). */
    public static void titulo(String texto) {
        System.out.println("\n" + LINEA2);
        System.out.printf ("  %s%n", texto.toUpperCase());
        System.out.println(LINEA2);
    }

    /** Imprime un mensaje de éxito. */
    public static void exito(String mensaje)  { System.out.println("✅ " + mensaje); }

    /** Imprime un mensaje de error. */
    public static void error(String mensaje)  { System.out.println("❌ " + mensaje); }

    /** Imprime un mensaje informativo. */
    public static void info(String mensaje)   { System.out.println("ℹ️  " + mensaje); }

    // ─── TABLAS ───────────────────────────────────────────────────────────────

    /**
     * Imprime la lista de usuarios en formato tabla.
     *
     * @param usuarios lista de usuarios a mostrar
     */
    public static void imprimirUsuarios(List<Usuario> usuarios) {
        if (usuarios.isEmpty()) { info("No hay usuarios registrados."); return; }
        System.out.printf("%-5s %-25s %-30s %-5s %-5s%n",
            "ID", "Nombre", "Correo", "Rol", "Est");
        separador();
        for (Usuario u : usuarios) {
            System.out.printf("%-5d %-25s %-30s %-5d %-5d%n",
                u.getIdUsuario(), u.getNombre(), u.getCorreo(), u.getIdRol(), u.getIdEstado());
        }
    }

    /**
     * Imprime la lista de empleados en formato tabla.
     *
     * @param empleados lista de empleados a mostrar
     */
    public static void imprimirEmpleados(List<Empleado> empleados) {
        if (empleados.isEmpty()) { info("No hay empleados registrados."); return; }
        System.out.printf("%-5s %-12s %-25s %-20s %-12s %-15s%n",
            "ID", "Cédula", "Cargo", "area", "Ingreso", "Salario", "H.Extras");
        separador();
        for (Empleado e : empleados) {
            System.out.printf("%-5d %-12s %-25s %-20s %-12s %-15s%n",
                e.getIdEmpleado(), e.getCedula(), e.getCargo(), e.getArea(),
                e.getFechaIngreso(), e.getSalario(), e.getPromedioHorasExtras());
        }
    }

    /**
     * Imprime la lista de solicitudes en formato tabla.
     *
     * @param solicitudes lista de solicitudes a mostrar
     */
    public static void imprimirSolicitudes(List<Solicitud> solicitudes) {
        if (solicitudes.isEmpty()) { info("No hay solicitudes registradas."); return; }
        System.out.printf("%-5s %-6s %-20s %-6s %-30s%n",
            "ID", "Emp.", "Tipo", "Est.", "Descripción");
        separador();
        for (Solicitud s : solicitudes) {
            String desc = s.getDescripcion() != null && s.getDescripcion().length() > 30
                ? s.getDescripcion().substring(0, 27) + "..."
                : s.getDescripcion();
            System.out.printf("%-5d %-6d %-20s %-6d %-30s%n",
                s.getIdSolicitud(), s.getIdEmpleado(),
                s.getTipoSolicitud(), s.getIdEstado(), desc);
        }
    }
}
