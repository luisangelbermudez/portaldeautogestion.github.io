package co.acegrasco.menu;

import co.acegrasco.dao.EmpleadoDao;
import co.acegrasco.modelo.Empleado;
import co.acegrasco.util.Consola;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

/**
 * Clase MenuEmpleados
 * Gestiona el menú de consola para las operaciones CRUD de empleados.
 *
 * Paquete: co.acegrasco.menu
 */
public class MenuEmpleados {

    private final EmpleadoDao empleadoDao;
    private final Scanner     scanner;

    public MenuEmpleados(Scanner scanner) {
        this.empleadoDao = new EmpleadoDao();
        this.scanner     = scanner;
    }

    /** Muestra el menú de empleados y procesa la opción elegida. */
    public void mostrar() {
        int opcion;
        do {
            Consola.titulo("Gestión de Empleados");
            System.out.println("  1. Listar todos los empleados");
            System.out.println("  2. Consultar empleado por ID");
            System.out.println("  3. Insertar nuevo empleado");
            System.out.println("  4. Actualizar empleado");
            System.out.println("  5. Eliminar empleado");
            System.out.println("  0. Volver al menú principal");
            Consola.separador();
            System.out.print("  Seleccione una opción: ");
            opcion = leerEntero();

            switch (opcion) {
                case 1 -> listarEmpleados();
                case 2 -> consultarPorId();
                case 3 -> insertarEmpleado();
                case 4 -> actualizarEmpleado();
                case 5 -> eliminarEmpleado();
                case 0 -> System.out.println("  Volviendo al menú principal...");
                default -> Consola.error("Opción inválida.");
            }
        } while (opcion != 0);
    }

    private void listarEmpleados() {
        Consola.titulo("Listado de Empleados");
        List<Empleado> empleados = empleadoDao.consultarTodos();
        Consola.imprimirEmpleados(empleados);
    }

    private void consultarPorId() {
        Consola.titulo("Consultar Empleado por ID");
        System.out.print("  Ingrese el ID del empleado: ");
        int id = leerEntero();
        Empleado e = empleadoDao.consultarPorId(id);
        if (e != null) System.out.println("\n  " + e);
        else           Consola.error("Empleado no encontrado.");
    }

    private void insertarEmpleado() {
        Consola.titulo("Insertar Nuevo Empleado");
        Empleado nuevo = new Empleado();

        System.out.print("  ID de usuario vinculado : ");
        nuevo.setIdUsuario(leerEntero());

        System.out.print("  Cédula                  : ");
        nuevo.setCedula(scanner.nextLine().trim());

        System.out.print("  Cargo                   : ");
        nuevo.setCargo(scanner.nextLine().trim());

        System.out.print("  Área                    : ");
        nuevo.setArea(scanner.nextLine().trim());

        System.out.print("  Fecha de ingreso (YYYY-MM-DD): ");
        nuevo.setFechaIngreso(LocalDate.parse(scanner.nextLine().trim()));

        System.out.print("  Salario mensual         : ");
        nuevo.setSalario(new BigDecimal(scanner.nextLine().trim()));

        System.out.print("  Prom. horas extras      : ");
        nuevo.setPromedioHorasExtras(new BigDecimal(scanner.nextLine().trim()));

        boolean resultado = empleadoDao.insertar(nuevo);
        if (resultado) Consola.exito("Empleado registrado correctamente.");
        else           Consola.error("No se pudo registrar el empleado.");
    }

    private void actualizarEmpleado() {
        Consola.titulo("Actualizar Empleado");
        System.out.print("  ID del empleado a actualizar: ");
        int id = leerEntero();

        Empleado existente = empleadoDao.consultarPorId(id);
        if (existente == null) { Consola.error("Empleado no encontrado."); return; }

        System.out.printf("  Cargo actual [%s] → nuevo cargo: ", existente.getCargo());
        String cargo = scanner.nextLine().trim();
        if (!cargo.isEmpty()) existente.setCargo(cargo);

        System.out.printf("  Área actual [%s] → nueva área: ", existente.getArea());
        String area = scanner.nextLine().trim();
        if (!area.isEmpty()) existente.setArea(area);

        System.out.printf("  Salario actual [%s] → nuevo salario: ", existente.getSalario());
        String salario = scanner.nextLine().trim();
        if (!salario.isEmpty()) existente.setSalario(new BigDecimal(salario));

        System.out.printf("  Prom. extras actual [%s] → nuevo valor: ", existente.getPromedioHorasExtras());
        String extras = scanner.nextLine().trim();
        if (!extras.isEmpty()) existente.setPromedioHorasExtras(new BigDecimal(extras));

        boolean resultado = empleadoDao.actualizar(existente);
        if (resultado) Consola.exito("Empleado actualizado correctamente.");
        else           Consola.error("No se pudo actualizar el empleado.");
    }

    private void eliminarEmpleado() {
        Consola.titulo("Eliminar Empleado");
        System.out.print("  ID del empleado a eliminar: ");
        int id = leerEntero();

        System.out.print("  ¿Confirma la eliminación? (s/n): ");
        String confirmacion = scanner.nextLine().trim();
        if (!confirmacion.equalsIgnoreCase("s")) { Consola.info("Operación cancelada."); return; }

        boolean resultado = empleadoDao.eliminar(id);
        if (resultado) Consola.exito("Empleado eliminado correctamente.");
        else           Consola.error("No se pudo eliminar el empleado.");
    }

    private int leerEntero() {
        try { return Integer.parseInt(scanner.nextLine().trim()); }
        catch (NumberFormatException e) { return -1; }
    }
}
