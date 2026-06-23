package co.acegrasco.menu;

import co.acegrasco.conexion.Conexion;
import co.acegrasco.util.Consola;

import java.util.Scanner;

/**
 * Clase Main
 * Punto de entrada del módulo Java JDBC del Portal de Autogestión - Acegrasco S.A.
 * Evidencia: GA7-220501096-AA2-EV01
 *
 * Paquete: co.acegrasco.menu
 */
public class Main {

    public static void main(String[] args) {

        System.out.println("╔══════════════════════════════════════════════════════════╗");
        System.out.println("║       PORTAL DE AUTOGESTIÓN - ACEGRASCO S.A.            ║");
        System.out.println("║       Módulo JDBC  |  Grupo 9                ║");
        System.out.println("╚══════════════════════════════════════════════════════════╝");

        // Verificar conexión ANTES de mostrar el menú
        Conexion conexion = Conexion.obtenerInstancia();
        if (!conexion.estaConectado()) {
            System.err.println("\n╔══════════════════════════════════════════════════════════╗");
            System.err.println("║  ❌ NO SE PUDO CONECTAR A LA BASE DE DATOS              ║");
            System.err.println("╠══════════════════════════════════════════════════════════╣");
            System.err.println("║  Pasos para solucionar:                                 ║");
            System.err.println("║  1. Abre XAMPP Control Panel                            ║");
            System.err.println("║  2. Haz clic en START en Apache y MySQL                 ║");
            System.err.println("║  3. Abre 127.ac0.0.1/phpmyadmin                          ║");
            System.err.println("║  4. Importa el archivo data/portal_acegrasco.sql        ║");
            System.err.println("║  5. Vuelve a ejecutar este programa                     ║");
            System.err.println("╚══════════════════════════════════════════════════════════╝");
            return;
        }

        Scanner scanner = new Scanner(System.in);
        int opcion;

        do {
            Consola.titulo("Menú Principal");
            System.out.println("  1. Gestión de Usuarios");
            System.out.println("  2. Gestión de Empleados");
            System.out.println("  3. Gestión de Solicitudes");
            System.out.println("  0. Salir");
            Consola.separador();
            System.out.print("  Seleccione una opción: ");

            try {
                opcion = Integer.parseInt(scanner.nextLine().trim());
            } catch (NumberFormatException e) {
                opcion = -1;
            }

            switch (opcion) {
                case 1 -> new MenuUsuarios(scanner).mostrar();
                case 2 -> new MenuEmpleados(scanner).mostrar();
                case 3 -> new MenuSolicitudes(scanner).mostrar();
                case 0 -> System.out.println("\n  Cerrando sesión. ¡Hasta pronto!");
                default -> Consola.error("Opción inválida. Intente de nuevo.");
            }

        } while (opcion != 0);

        Conexion.obtenerInstancia().cerrar();
        scanner.close();
    }
}
