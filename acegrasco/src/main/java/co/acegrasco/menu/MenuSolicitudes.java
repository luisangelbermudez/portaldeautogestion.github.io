package co.acegrasco.menu;

import co.acegrasco.dao.SolicitudDao;
import co.acegrasco.modelo.Solicitud;
import co.acegrasco.util.Consola;

import java.util.List;
import java.util.Scanner;

/**
 * Clase MenuSolicitudes
 * Gestiona el menú de consola para las operaciones CRUD de solicitudes.
 *
 * Paquete: co.acegrasco.menu
 */
public class MenuSolicitudes {

    private final SolicitudDao solicitudDao;
    private final Scanner      scanner;

    public MenuSolicitudes(Scanner scanner) {
        this.solicitudDao = new SolicitudDao();
        this.scanner      = scanner;
    }

    /** Muestra el menú de solicitudes y procesa la opción elegida. */
    public void mostrar() {
        int opcion;
        do {
            Consola.titulo("Gestión de Solicitudes");
            System.out.println("  1. Listar todas las solicitudes");
            System.out.println("  2. Listar solicitudes por empleado");
            System.out.println("  3. Insertar nueva solicitud");
            System.out.println("  4. Actualizar estado de solicitud");
            System.out.println("  5. Eliminar solicitud");
            System.out.println("  0. Volver al menú principal");
            Consola.separador();
            System.out.print("  Seleccione una opción: ");
            opcion = leerEntero();

            switch (opcion) {
                case 1 -> listarSolicitudes();
                case 2 -> listarPorEmpleado();
                case 3 -> insertarSolicitud();
                case 4 -> actualizarEstado();
                case 5 -> eliminarSolicitud();
                case 0 -> System.out.println("  Volviendo al menú principal...");
                default -> Consola.error("Opción inválida.");
            }
        } while (opcion != 0);
    }

    private void listarSolicitudes() {
        Consola.titulo("Listado de Solicitudes");
        List<Solicitud> solicitudes = solicitudDao.consultarTodas();
        Consola.imprimirSolicitudes(solicitudes);
    }

    private void listarPorEmpleado() {
        Consola.titulo("Solicitudes por Empleado");
        System.out.print("  Ingrese el ID del empleado: ");
        int idEmpleado = leerEntero();
        List<Solicitud> solicitudes = solicitudDao.consultarPorEmpleado(idEmpleado);
        Consola.imprimirSolicitudes(solicitudes);
    }

    private void insertarSolicitud() {
        Consola.titulo("Insertar Nueva Solicitud");
        Solicitud nueva = new Solicitud();

        System.out.print("  ID del empleado       : ");
        nueva.setIdEmpleado(leerEntero());

        System.out.println("  Tipo de solicitud:");
        System.out.println("    1. Permiso");
        System.out.println("    2. Vacaciones");
        System.out.println("    3. Incapacidad");
        System.out.println("    4. Actualización de datos");
        System.out.println("    5. Otro");
        System.out.print("  Seleccione: ");
        int tipoOpc = leerEntero();
        String[] tipos = {"Permiso", "Vacaciones", "Incapacidad", "Actualización de datos", "Otro"};
        nueva.setTipoSolicitud(tipoOpc >= 1 && tipoOpc <= 5 ? tipos[tipoOpc - 1] : "Otro");

        System.out.print("  Descripción           : ");
        nueva.setDescripcion(scanner.nextLine().trim());

        boolean resultado = solicitudDao.insertar(nueva);
        if (resultado) Consola.exito("Solicitud registrada correctamente (estado: Pendiente).");
        else           Consola.error("No se pudo registrar la solicitud.");
    }

    private void actualizarEstado() {
        Consola.titulo("Actualizar Estado de Solicitud");
        System.out.print("  ID de la solicitud: ");
        int idSolicitud = leerEntero();

        System.out.println("  Nuevo estado:");
        System.out.println("    3. Pendiente");
        System.out.println("    4. En revisión");
        System.out.println("    5. Aprobado");
        System.out.println("    6. Rechazado");
        System.out.print("  Seleccione: ");
        int nuevoEstado = leerEntero();

        boolean resultado = solicitudDao.actualizarEstado(idSolicitud, nuevoEstado);
        if (resultado) Consola.exito("Estado de solicitud actualizado correctamente.");
        else           Consola.error("No se pudo actualizar la solicitud.");
    }

    private void eliminarSolicitud() {
        Consola.titulo("Eliminar Solicitud");
        System.out.print("  ID de la solicitud a eliminar: ");
        int id = leerEntero();

        System.out.print("  ¿Confirma la eliminación? (s/n): ");
        String confirmacion = scanner.nextLine().trim();
        if (!confirmacion.equalsIgnoreCase("s")) { Consola.info("Operación cancelada."); return; }

        boolean resultado = solicitudDao.eliminar(id);
        if (resultado) Consola.exito("Solicitud eliminada correctamente.");
        else           Consola.error("No se pudo eliminar la solicitud.");
    }

    private int leerEntero() {
        try { return Integer.parseInt(scanner.nextLine().trim()); }
        catch (NumberFormatException e) { return -1; }
    }
}
